import type { Metadata } from "next";

import { AdminFeedbackBanner } from "@/components/admin/admin-feedback";
import { MembersManagement } from "@/components/admin/members-management";
import { listAdminMembers } from "@/lib/admin/member-management";
import { getAdminFeedbackMessage } from "@/lib/admin/ui";

type MembersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Miembros",
  description: "Gestión administrativa de miembros y vigencias.",
};

export default async function AdminMembersPage({
  searchParams,
}: MembersPageProps) {
  const [members, resolvedSearchParams] = await Promise.all([
    listAdminMembers(),
    searchParams,
  ]);
  const feedback = getAdminFeedbackMessage(resolvedSearchParams);

  return (
    <>
      {feedback ? <AdminFeedbackBanner feedback={feedback} /> : null}
      <MembersManagement members={members} />
    </>
  );
}
