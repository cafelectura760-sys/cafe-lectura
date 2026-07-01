import type { Metadata } from "next";

import { AdminFeedbackBanner } from "@/components/admin/admin-feedback";
import { ColloquiumsManagement } from "@/components/admin/colloquiums-management";
import { listAdminColloquiums } from "@/lib/colloquiums/data";
import { getAdminFeedbackMessage, getSearchParamValue } from "@/lib/admin/ui";

type AdminColloquiumsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Coloquios",
  description: "Gestión editorial del módulo privado de coloquios.",
};

export default async function AdminColloquiumsPage({
  searchParams,
}: AdminColloquiumsPageProps) {
  const [colloquiums, resolvedSearchParams] = await Promise.all([
    listAdminColloquiums(),
    searchParams,
  ]);
  const feedback = getAdminFeedbackMessage(resolvedSearchParams);
  const rawStatus = getSearchParamValue(resolvedSearchParams.status);
  const selectedStatus =
    rawStatus === "draft" || rawStatus === "published" ? rawStatus : "all";

  return (
    <>
      {feedback ? <AdminFeedbackBanner feedback={feedback} /> : null}
      <ColloquiumsManagement
        colloquiums={colloquiums}
        selectedStatus={selectedStatus}
      />
    </>
  );
}
