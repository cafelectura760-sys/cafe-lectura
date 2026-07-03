import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminShell userName={session.profile.full_name}>{children}</AdminShell>
  );
}
