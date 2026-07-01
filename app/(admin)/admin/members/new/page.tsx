import type { Metadata } from "next";

import { AdminFeedbackBanner } from "@/components/admin/admin-feedback";
import { MemberCreateForm } from "@/components/admin/member-create-form";
import { getDefaultMembershipDateInput } from "@/lib/admin/member-management";
import { getAdminFeedbackMessage } from "@/lib/admin/ui";

type AdminMembersCreatePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Nueva cuenta",
  description: "Alta manual de miembros y administradores.",
};

export default async function AdminMembersCreatePage({
  searchParams,
}: AdminMembersCreatePageProps) {
  const feedback = getAdminFeedbackMessage(await searchParams);

  return (
    <>
      {feedback ? <AdminFeedbackBanner feedback={feedback} /> : null}
      <MemberCreateForm
        defaultMembershipDate={getDefaultMembershipDateInput()}
      />
    </>
  );
}
