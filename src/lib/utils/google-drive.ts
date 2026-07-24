// Helper functions for Google Drive uploads using standard Web Crypto and REST APIs.
// This runs natively on Cloudflare Workers / Edge Runtime with zero dependencies.

function cleanPrivateKeyPem(pem: string): string {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  
  let content = pem;
  const startIndex = pem.indexOf(pemHeader);
  const endIndex = pem.indexOf(pemFooter);
  
  if (startIndex !== -1 && endIndex !== -1) {
    content = pem.substring(startIndex + pemHeader.length, endIndex);
  } else {
    content = pem
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "");
  }
  
  return content
    .replace(/\\n/g, "")
    .replace(/\\r/g, "")
    .replace(/\\/g, "")
    .replace(/\s/g, "");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = cleanPrivateKeyPem(pem);
  
  const invalidChars = pemContents.match(/[^A-Za-z0-9+/=]/g);
  if (invalidChars) {
    console.error("Invalid characters found in PEM Base64 contents:", Array.from(new Set(invalidChars)));
  }
  
  // Base64 decode to ArrayBuffer
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }
  
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}

function base64url(arr: Uint8Array | ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(arr));
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string,
  scopes: string[]
): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  
  const encodedHeader = base64url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedClaimSet = base64url(new TextEncoder().encode(JSON.stringify(claimSet)));
  
  const tokenInput = `${encodedHeader}.${encodedClaimSet}`;
  const cryptoKey = await importPrivateKey(privateKeyPem);
  
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(tokenInput)
  );
  
  const signedJwt = `${tokenInput}.${base64url(signature)}`;
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });
  
  const data = (await response.json()) as any;
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Gagal mendapatkan token akses Google");
  }
  
  return data.access_token;
}

export async function uploadToGoogleDrive(
  accessToken: string,
  file: File,
  folderId: string
): Promise<string> {
  const metadata = {
    name: file.name,
    parents: [folderId],
  };
  
  const boundary = "boundary_gdrive_upload";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  
  const arrayBuffer = await file.arrayBuffer();
  
  const metadataBlob = new Blob([
    delimiter,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`
  ]);
  
  const endBlob = new Blob([closeDelimiter]);
  const body = new Blob([metadataBlob, new Uint8Array(arrayBuffer), endBlob]);
  
  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  
  const data = (await response.json()) as any;
  if (!response.ok) {
    throw new Error(data.error?.message || "Gagal mengunggah file ke Google Drive");
  }
  
  return data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`;
}

export async function getGoogleAccessTokenFromRefreshToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = (await response.json()) as any;
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Gagal mendapatkan token akses dari Refresh Token");
  }

  return data.access_token;
}

export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([-\w]{25,})/);
  if (match) return match[1];
  
  const queryMatch = url.match(/[?&]id=([-\w]{25,})/);
  if (queryMatch) return queryMatch[1];
  
  return null;
}

export async function deleteFromGoogleDrive(
  accessToken: string,
  fileId: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.ok) {
      return true;
    }
    
    console.warn(`Gagal menghapus file Google Drive ${fileId}:`, await response.text());
    return false;
  } catch (err) {
    console.error(`Eror saat menghapus file Google Drive ${fileId}:`, err);
    return false;
  }
}


