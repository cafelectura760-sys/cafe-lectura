import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import {
  getKeepAliveStatus,
  mapSystemHeartbeatRecord,
  SUPABASE_KEEPALIVE_JOB_NAME,
  type KeepAliveStatus,
} from "@/lib/supabase/keepalive";
import { createClient } from "@/lib/supabase/server";

type SystemHeartbeatRow = {
  job_name: string;
  last_succeeded_at: string | null;
  last_status: "success" | "error";
  last_error: string | null;
  updated_at: string;
};

export async function getAdminKeepAliveStatus(): Promise<KeepAliveStatus> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_heartbeats")
    .select("job_name, last_succeeded_at, last_status, last_error, updated_at")
    .eq("job_name", SUPABASE_KEEPALIVE_JOB_NAME)
    .maybeSingle<SystemHeartbeatRow>();

  if (error) {
    throw new Error(`Failed to load keep-alive heartbeat: ${error.message}`);
  }

  return getKeepAliveStatus(data ? mapSystemHeartbeatRecord(data) : null);
}
