import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth/session";
import { createColloquiumPresignedUpload } from "@/lib/colloquiums/media";

type PresignRequestBody = {
  colloquiumId?: string;
  sectionId?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
};

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.profile || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: PresignRequestBody;

  try {
    body = (await request.json()) as PresignRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const result = await createColloquiumPresignedUpload({
      colloquiumId: body.colloquiumId ?? "",
      sectionId: body.sectionId ?? "",
      assetType: "audio",
      fileName: body.fileName ?? "",
      mimeType: body.mimeType ?? "",
      sizeBytes: body.sizeBytes ?? 0,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create the signed upload token",
      },
      { status: 400 },
    );
  }
}
