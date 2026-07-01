import type { Metadata } from "next";

import { AdminFeedbackBanner } from "@/components/admin/admin-feedback";
import { ColloquiumsManagement } from "@/components/admin/colloquiums-management";
import { listAdminColloquiumsPage } from "@/lib/colloquiums/data";
import {
  createAdminPath,
  getAdminFeedbackMessage,
  getAdminPaginationParams,
  getSearchParamValue,
} from "@/lib/admin/ui";

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
  const resolvedSearchParams = await searchParams;
  const feedback = getAdminFeedbackMessage(resolvedSearchParams);
  const rawStatus = getSearchParamValue(resolvedSearchParams.status);
  const selectedStatus =
    rawStatus === "draft" || rawStatus === "published" ? rawStatus : "all";
  const paginationParams = getAdminPaginationParams(resolvedSearchParams);
  const colloquiums = await listAdminColloquiumsPage(
    paginationParams,
    selectedStatus,
  );
  const currentPath = createAdminPath("/admin/colloquiums", {
    status: selectedStatus === "all" ? null : selectedStatus,
    page: colloquiums.page,
    size: colloquiums.size,
  });

  return (
    <>
      {feedback ? <AdminFeedbackBanner feedback={feedback} /> : null}
      <ColloquiumsManagement
        colloquiumsPage={colloquiums}
        currentPath={currentPath}
        selectedStatus={selectedStatus}
      />
    </>
  );
}
