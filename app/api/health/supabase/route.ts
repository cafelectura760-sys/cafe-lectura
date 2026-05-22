import { NextResponse } from "next/server";

import { runSupabaseKeepAliveCheck } from "@/lib/supabase/keepalive";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  try {
    await runSupabaseKeepAliveCheck(supabase);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Supabase health error.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      service: "supabase",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
