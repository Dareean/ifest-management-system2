import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user with Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate folder name to prevent directory traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");

    // 3. Get R2 bucket binding
    const context = getCloudflareContext();
    const bucket = context.env?.R2_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "Cloudflare R2 Bucket binding is not configured" },
        { status: 500 }
      );
    }

    // 4. Generate unique key
    const fileExtension = file.name.split(".").pop();
    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}.${fileExtension}`;
    const key = `${safeFolder}/${filename}`;

    // 5. Upload file buffer to R2
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    await bucket.put(key, buffer, {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
        cacheControl: "public, max-age=31536000",
      },
      customMetadata: {
        originalName: file.name,
        uploadedBy: user.id,
      },
    });

    // 6. Generate and return the URL
    // If a public R2 URL prefix is configured, use it, otherwise fall back to local proxy endpoint
    const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    const fileUrl = r2PublicUrl
      ? `${r2PublicUrl.replace(/\/$/, "")}/${key}`
      : `/api/files/${key}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      key: key,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
