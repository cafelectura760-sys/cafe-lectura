import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getCronSecret } from "@/lib/env/server";
import {
  runSupabaseKeepAliveCheck,
  SUPABASE_KEEPALIVE_JOB_NAME,
  upsertSystemHeartbeat,
} from "@/lib/supabase/keepalive";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function jsonResponse(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${getCronSecret()}`) {
    return jsonResponse(
      {
        ok: false,
        job: SUPABASE_KEEPALIVE_JOB_NAME,
        error: "Unauthorized",
      },
      401,
    );
  }

  const checkedAt = new Date().toISOString();
  const supabase = createAdminClient();

  try {
    await runSupabaseKeepAliveCheck(supabase);
    await upsertSystemHeartbeat(supabase, {
      jobName: SUPABASE_KEEPALIVE_JOB_NAME,
      checkedAt,
    });

    return jsonResponse({
      ok: true,
      job: SUPABASE_KEEPALIVE_JOB_NAME,
      checkedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown keep-alive failure.";

    console.error(`[cron:${SUPABASE_KEEPALIVE_JOB_NAME}] ${message}`);

    return jsonResponse(
      {
        ok: false,
        job: SUPABASE_KEEPALIVE_JOB_NAME,
        checkedAt,
        error: message,
      },
      500,
    );
  }
}
