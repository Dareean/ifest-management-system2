import { NextRequest, NextResponse } from "next/server";

// Helper function to extract Folder ID from various Google Drive URL formats
function extractFolderId(url: string): string | null {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderUrl = searchParams.get("url");

    if (!folderUrl) {
      return NextResponse.json(
        { error: "Parameter url Google Drive wajib diisi." },
        { status: 400 }
      );
    }

    const folderId = extractFolderId(folderUrl);
    if (!folderId) {
      return NextResponse.json(
        {
          error:
            "Link Google Drive tidak valid atau ID folder tidak ditemukan. Pastikan format link benar.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API Key belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    // Google Drive API v3 endpoint to list files in a folder
    // Filter out trashed files, and request fields: id, name, mimeType, webViewLink, thumbnailLink
    const googleApiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink,thumbnailLink)&key=${apiKey}`;

    const response = await fetch(googleApiUrl);
    const data = (await response.json()) as any;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error?.message || "Gagal mengambil data dari Google Drive.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      folderId,
      files: data.files || [],
    });
  } catch (error: any) {
    console.error("Gdrive API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
