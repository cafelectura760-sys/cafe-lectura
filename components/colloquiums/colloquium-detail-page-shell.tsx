import { AppHeader } from "@/components/app-header";
import { ColloquiumReader } from "@/components/colloquiums/colloquium-reader";
import { PageShell } from "@/components/page-shell";
import type { AuthSessionContext } from "@/lib/auth/types";
import type { ColloquiumDetail } from "@/lib/colloquiums/types";

type ColloquiumDetailPageShellProps = {
  colloquium: ColloquiumDetail;
  session: AuthSessionContext | null;
};

export function ColloquiumDetailPageShell({
  colloquium,
  session,
}: ColloquiumDetailPageShellProps) {
  return (
    <PageShell>
      <AppHeader
        activeHref="/colloquiums"
        session={session}
        description="Sala privada con lecturas y audios de la conversación del club."
      />

      <ColloquiumReader colloquium={colloquium} />
    </PageShell>
  );
}
