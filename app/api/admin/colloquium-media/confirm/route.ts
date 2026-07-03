import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth/session";
import { confirmMediaUpload } from "@/lib/colloquiums/media";

type ConfirmRequestBody = {
  assetToken?: string;
  storageKey?: string;
  mimeType?: string;
  sizeBytes?: number;
  durationSeconds?: number | null;
};

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.profile || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: ConfirmRequestBody;

  try {
    body = (await request.json()) as ConfirmRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const result = await confirmMediaUpload({
      assetToken: body.assetToken ?? "",
      storageKey: body.storageKey ?? "",
      mimeType: body.mimeType ?? "",
      sizeBytes: body.sizeBytes ?? 0,
      durationSeconds: body.durationSeconds ?? null,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to confirm media upload",
      },
      { status: 400 },
    );
  }
}
