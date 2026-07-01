import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/admin-overview";
import { listAdminBooks } from "@/lib/admin/book-management";
import { listAdminMembers } from "@/lib/admin/member-management";
import { getAdminKeepAliveStatus } from "@/lib/admin/system-heartbeats";
import { listAdminColloquiums } from "@/lib/colloquiums/data";

export const metadata: Metadata = {
  title: "Administración",
  description: "Resumen operativo del área administrativa de Café Lectura.",
};

export default async function AdminPage() {
  const [members, books, colloquiums, keepAliveStatus] = await Promise.all([
    listAdminMembers(),
    listAdminBooks(),
    listAdminColloquiums(),
    getAdminKeepAliveStatus(),
  ]);

  return (
    <AdminOverview
      memberCount={members.length}
      bookCount={books.length}
      colloquiums={colloquiums}
      keepAliveStatus={keepAliveStatus}
    />
  );
}
