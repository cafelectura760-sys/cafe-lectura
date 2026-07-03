import type { Metadata } from "next";

import { AdminFeedbackBanner } from "@/components/admin/admin-feedback";
import { MembersManagement } from "@/components/admin/members-management";
import { listAdminMembersPage } from "@/lib/admin/member-management";
import {
  createAdminPath,
  getAdminFeedbackMessage,
  getAdminPaginationParams,
} from "@/lib/admin/ui";

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
  const resolvedSearchParams = await searchParams;
  const feedback = getAdminFeedbackMessage(resolvedSearchParams);
  const paginationParams = getAdminPaginationParams(resolvedSearchParams);
  const members = await listAdminMembersPage(paginationParams);
  const currentPath = createAdminPath("/admin/members", {
    page: members.page,
    size: members.size,
  });

  return (
    <>
      {feedback ? <AdminFeedbackBanner feedback={feedback} /> : null}
      <MembersManagement membersPage={members} currentPath={currentPath} />
    </>
  );
}
