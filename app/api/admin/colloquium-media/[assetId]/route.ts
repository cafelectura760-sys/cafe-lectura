import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth/session";
import {
  deleteMediaAsset,
  updateMediaAssetMetadata,
} from "@/lib/colloquiums/media";

type DeleteMediaAssetRouteProps = {
  params: Promise<{
    assetId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: DeleteMediaAssetRouteProps,
) {
  const session = await getAuthSession();

  if (!session?.profile || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { assetId } = await params;

  try {
    await deleteMediaAsset({ assetId });
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete media asset",
      },
      { status: 400 },
    );
  }
}

type UpdateMediaAssetBody = {
  caption?: string | null;
  altText?: string | null;
};

export async function PATCH(
  request: Request,
  { params }: DeleteMediaAssetRouteProps,
) {
  const session = await getAuthSession();

  if (!session?.profile || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { assetId } = await params;
  let body: UpdateMediaAssetBody;

  try {
    body = (await request.json()) as UpdateMediaAssetBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const asset = await updateMediaAssetMetadata({
      assetId,
      caption: body.caption ?? null,
      altText: body.altText ?? null,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update media asset",
      },
      { status: 400 },
    );
  }
}
