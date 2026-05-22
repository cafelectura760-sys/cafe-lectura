import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_KEEPALIVE_JOB_NAME = "supabase-keepalive";
const STALE_HEARTBEAT_THRESHOLD_MS = 36 * 60 * 60 * 1000;

type SystemHeartbeatRow = {
  job_name: string;
  last_succeeded_at: string | null;
  last_status: "success" | "error";
  last_error: string | null;
  updated_at: string;
};

export type SystemHeartbeatRecord = {
  jobName: string;
  lastSucceededAt: string | null;
  lastStatus: "success" | "error";
  lastError: string | null;
  updatedAt: string;
};

export type KeepAliveStatus = {
  jobName: string;
  lastSucceededAt: string | null;
  lastStatus: "success" | "error" | "missing";
  lastError: string | null;
  updatedAt: string | null;
  isStale: boolean;
};

export async function runSupabaseKeepAliveCheck(supabase: SupabaseClient) {
  const { error } = await supabase.from("books").select("id").limit(1);

  if (error) {
    throw new Error(`Failed to keep Supabase active: ${error.message}`);
  }
}

export async function upsertSystemHeartbeat(
  supabase: SupabaseClient,
  input: {
    jobName: string;
    checkedAt: string;
  },
) {
  const { error } = await supabase.from("system_heartbeats").upsert(
    {
      job_name: input.jobName,
      last_succeeded_at: input.checkedAt,
      last_status: "success",
      last_error: null,
      updated_at: input.checkedAt,
    },
    {
      onConflict: "job_name",
    },
  );

  if (error) {
    throw new Error(`Failed to store heartbeat: ${error.message}`);
  }
}

export function mapSystemHeartbeatRecord(
  row: SystemHeartbeatRow,
): SystemHeartbeatRecord {
  return {
    jobName: row.job_name,
    lastSucceededAt: row.last_succeeded_at,
    lastStatus: row.last_status,
    lastError: row.last_error,
    updatedAt: row.updated_at,
  };
}

export function getKeepAliveStatus(
  heartbeat: SystemHeartbeatRecord | null,
  now = new Date(),
): KeepAliveStatus {
  if (!heartbeat) {
    return {
      jobName: SUPABASE_KEEPALIVE_JOB_NAME,
      lastSucceededAt: null,
      lastStatus: "missing",
      lastError: null,
      updatedAt: null,
      isStale: true,
    };
  }

  const lastSucceededAt = heartbeat.lastSucceededAt;
  const isStale =
    !lastSucceededAt ||
    now.getTime() - new Date(lastSucceededAt).getTime() >
      STALE_HEARTBEAT_THRESHOLD_MS;

  return {
    jobName: heartbeat.jobName,
    lastSucceededAt,
    lastStatus: heartbeat.lastStatus,
    lastError: heartbeat.lastError,
    updatedAt: heartbeat.updatedAt,
    isStale,
  };
}
