import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import type { AppRole } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AdminMemberActionErrorCode =
  | "invalid-full-name"
  | "invalid-email"
  | "invalid-password"
  | "invalid-role"
  | "invalid-membership-date"
  | "email-already-exists"
  | "member-not-found"
  | "cannot-demote-yourself";

type ProfileRow = {
  id: string;
  full_name: string;
  role: AppRole;
  membership_expires_at: string;
  created_at: string;
};

export type AdminMemberRecord = {
  id: string;
  email: string | null;
  fullName: string;
  role: AppRole;
  membershipExpiresAt: string;
  createdAt: string;
  lastSignInAt: string | null;
};

export type CreateAdminMemberInput = {
  fullName: string;
  email: string;
  password: string;
  role: string;
  membershipDate?: string;
};

export type UpdateAdminMemberInput = {
  memberId: string;
  role: string;
  membershipDate: string;
};

export class AdminMemberActionError extends Error {
  constructor(public readonly code: AdminMemberActionErrorCode) {
    super(code);
    this.name = "AdminMemberActionError";
  }
}

function addOneYear(baseDate: Date): Date {
  const nextDate = new Date(baseDate);
  nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
  return nextDate;
}

function normalizeEmail(value: string): string {
  const normalizedEmail = value.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    throw new AdminMemberActionError("invalid-email");
  }

  return normalizedEmail;
}

function normalizeFullName(value: string): string {
  const fullName = value.trim();

  if (!fullName) {
    throw new AdminMemberActionError("invalid-full-name");
  }

  return fullName;
}

function normalizePassword(value: string): string {
  if (value.length < 8) {
    throw new AdminMemberActionError("invalid-password");
  }

  return value;
}

function normalizeRole(value: string): AppRole {
  if (value !== "admin" && value !== "member") {
    throw new AdminMemberActionError("invalid-role");
  }

  return value;
}

function membershipDateToIso(value?: string): string {
  if (!value) {
    return addOneYear(new Date()).toISOString();
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new AdminMemberActionError("invalid-membership-date");
  }

  const [, year, month, day] = match;
  const membershipDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999),
  );

  if (Number.isNaN(membershipDate.getTime())) {
    throw new AdminMemberActionError("invalid-membership-date");
  }

  return membershipDate.toISOString();
}

function isDuplicateEmailError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("already been registered") ||
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("duplicate")
  );
}

export function getDefaultMembershipDateInput(): string {
  return addOneYear(new Date()).toISOString().slice(0, 10);
}

export function getMembershipDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export async function listAdminMembers(): Promise<AdminMemberRecord[]> {
  await requireAdmin();

  const adminClient = createAdminClient();
  const [
    { data: profileRows, error: profilesError },
    { data: usersData, error },
  ] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, full_name, role, membership_expires_at, created_at")
      .order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    }),
  ]);

  if (profilesError) {
    throw new Error(`Failed to load profiles: ${profilesError.message}`);
  }

  if (error) {
    throw new Error(`Failed to load auth users: ${error.message}`);
  }

  const usersById = new Map(
    (usersData.users ?? []).map((user) => [
      user.id,
      {
        email: user.email ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      },
    ]),
  );

  return (profileRows satisfies ProfileRow[]).map((profile) => {
    const authUser = usersById.get(profile.id);

    return {
      id: profile.id,
      email: authUser?.email ?? null,
      fullName: profile.full_name,
      role: profile.role,
      membershipExpiresAt: profile.membership_expires_at,
      createdAt: profile.created_at,
      lastSignInAt: authUser?.lastSignInAt ?? null,
    };
  });
}

export async function createAdminMember(input: CreateAdminMemberInput) {
  const adminSession = await requireAdmin();
  const adminClient = createAdminClient();

  const fullName = normalizeFullName(input.fullName);
  const email = normalizeEmail(input.email);
  const password = normalizePassword(input.password);
  const role = normalizeRole(input.role);
  const membershipExpiresAt = membershipDateToIso(input.membershipDate);

  const { data: createdUserData, error: createUserError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        created_by_admin_id: adminSession.userId,
      },
    });

  if (createUserError || !createdUserData.user) {
    if (createUserError && isDuplicateEmailError(createUserError.message)) {
      throw new AdminMemberActionError("email-already-exists");
    }

    throw new Error(createUserError?.message ?? "Failed to create auth user.");
  }

  const createdUser = createdUserData.user;
  const { error: profileInsertError } = await adminClient
    .from("profiles")
    .insert({
      id: createdUser.id,
      full_name: fullName,
      role,
      membership_expires_at: membershipExpiresAt,
    });

  if (profileInsertError) {
    await adminClient.auth.admin.deleteUser(createdUser.id);
    throw new Error(`Failed to create profile: ${profileInsertError.message}`);
  }

  return {
    memberId: createdUser.id,
    email,
  };
}

export async function updateAdminMember(input: UpdateAdminMemberInput) {
  const adminSession = await requireAdmin();
  const supabase = await createClient();

  const memberId = input.memberId.trim();
  const role = normalizeRole(input.role);
  const membershipExpiresAt = membershipDateToIso(input.membershipDate);

  if (!memberId) {
    throw new AdminMemberActionError("member-not-found");
  }

  if (memberId === adminSession.userId && role !== "admin") {
    throw new AdminMemberActionError("cannot-demote-yourself");
  }

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", memberId)
    .maybeSingle<{ id: string }>();

  if (selectError) {
    throw new Error(`Failed to load member profile: ${selectError.message}`);
  }

  if (!existingProfile) {
    throw new AdminMemberActionError("member-not-found");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      role,
      membership_expires_at: membershipExpiresAt,
    })
    .eq("id", memberId);

  if (updateError) {
    throw new Error(`Failed to update member: ${updateError.message}`);
  }
}

export async function extendAdminMemberMembership(memberId: string) {
  await requireAdmin();

  const trimmedMemberId = memberId.trim();

  if (!trimmedMemberId) {
    throw new AdminMemberActionError("member-not-found");
  }

  const supabase = await createClient();
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id, membership_expires_at")
    .eq("id", trimmedMemberId)
    .maybeSingle<{ id: string; membership_expires_at: string }>();

  if (selectError) {
    throw new Error(
      `Failed to load current membership: ${selectError.message}`,
    );
  }

  if (!existingProfile) {
    throw new AdminMemberActionError("member-not-found");
  }

  const currentExpiry = new Date(existingProfile.membership_expires_at);
  const renewalBaseDate =
    currentExpiry > new Date() ? currentExpiry : new Date();
  const nextMembershipExpiry = addOneYear(renewalBaseDate).toISOString();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      membership_expires_at: nextMembershipExpiry,
    })
    .eq("id", trimmedMemberId);

  if (updateError) {
    throw new Error(`Failed to extend membership: ${updateError.message}`);
  }
}
