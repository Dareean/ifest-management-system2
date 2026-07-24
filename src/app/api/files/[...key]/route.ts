import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await props.params;
    if (!key || key.length === 0) {
      return NextResponse.json({ error: "Missing file path" }, { status: 400 });
    }

    const objectKey = key.join("/");

    // 1. Get R2 bucket binding
    const context = getCloudflareContext();
    const bucket = context.env?.R2_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "Cloudflare R2 Bucket binding is not configured" },
        { status: 500 }
      );
    }

    // 2. Fetch the object from R2
    const object = await bucket.get(objectKey);

    if (!object) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 3. Return the file stream with correct headers
    const headers = new Headers();
    if (object.httpMetadata?.contentType) {
      headers.set("Content-Type", object.httpMetadata.contentType);
    } else {
      headers.set("Content-Type", "application/octet-stream");
    }

    if (object.httpMetadata?.cacheControl) {
      headers.set("Cache-Control", object.httpMetadata.cacheControl);
    } else {
      headers.set("Cache-Control", "public, max-age=31536000"); // 1 year cache default
    }

    headers.set("ETag", object.httpEtag);
    headers.set("Content-Length", object.size.toString());

    return new Response(object.body as any, {
      headers,
    });
  } catch (error: any) {
    console.error("File retrieval error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
