import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getGoogleAccessToken, getGoogleAccessTokenFromRefreshToken, uploadToGoogleDrive } from "@/lib/utils/google-drive";

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

    // Google Drive Integration for Official Documents (letters)
    if (safeFolder === "letters") {
      const folderId = process.env.GDRIVE_FOLDER_ID;
      
      const oauthClientId = process.env.GDRIVE_CLIENT_ID;
      const oauthClientSecret = process.env.GDRIVE_CLIENT_SECRET;
      const oauthRefreshToken = process.env.GDRIVE_REFRESH_TOKEN;

      const clientEmail = process.env.GDRIVE_CLIENT_EMAIL;
      const privateKey = process.env.GDRIVE_PRIVATE_KEY;

      if (!folderId) {
        return NextResponse.json(
          { error: "GDRIVE_FOLDER_ID belum dikonfigurasi di server." },
          { status: 500 }
        );
      }

      const useOauth = oauthClientId && oauthClientSecret && oauthRefreshToken;
      const useServiceAccount = clientEmail && privateKey;

      if (!useOauth && !useServiceAccount) {
        return NextResponse.json(
          { error: "Kredensial Google Drive (OAuth Refresh Token atau Service Account) belum dikonfigurasi di server." },
          { status: 500 }
        );
      }

      try {
        let accessToken = "";
        if (useOauth) {
          accessToken = await getGoogleAccessTokenFromRefreshToken(
            oauthClientId!,
            oauthClientSecret!,
            oauthRefreshToken!
          );
        } else {
          accessToken = await getGoogleAccessToken(
            clientEmail!,
            privateKey!.replace(/\\n/g, "\n"),
            ["https://www.googleapis.com/auth/drive"]
          );
        }

        const fileUrl = await uploadToGoogleDrive(accessToken, file, folderId);

        return NextResponse.json({
          success: true,
          url: fileUrl,
          key: fileUrl.split("/").pop(),
        });
      } catch (err: any) {
        console.error("Google Drive upload error:", err);
        return NextResponse.json(
          { error: err?.message || "Gagal mengunggah ke Google Drive." },
          { status: 500 }
        );
      }
    }

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
