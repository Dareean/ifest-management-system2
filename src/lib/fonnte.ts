/**
 * Fonnte WhatsApp API Client
 *
 * Fonnte adalah layanan WhatsApp API dari Indonesia yang memungkinkan
 * pengiriman pesan WhatsApp otomatis dan notifikasi.
 *
 * Dokumentasi API: https://fonnte.com/api
 */

const FONNTE_API_URL = "https://api.fonnte.com/send";

interface FonnteResponse {
  status: boolean;
  message?: string;
  detail?: string;
}

interface SendWhatsAppParams {
  phone: string;
  message: string;
  /**
   * Optional: URL file untuk attachment (image, document, dll)
   */
  url?: string;
}

interface SendBulkWhatsAppParams {
  phones: string[];
  message: string;
  url?: string;
}

/**
 * Format nomor telepon ke format WhatsApp international
 *
 * Examples:
 * - 081234567890 -> 6281234567890
 * - +6281234567890 -> 6281234567890
 * - 6281234567890 -> 6281234567890
 *
 * @param phone - nomor telepon dalam format apapun
 * @returns nomor dalam format international (62xxx)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 0, replace with 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  // If doesn't start with 62, add it
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Kirim pesan WhatsApp ke satu nomor
 *
 * @param params - phone number, message, dan optional attachment URL
 * @returns Promise<FonnteResponse>
 *
 * @example
 * ```ts
 * await sendWhatsAppMessage({
 *   phone: "081234567890",
 *   message: "Halo! Ada surat baru untuk Anda."
 * });
 * ```
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppParams,
): Promise<FonnteResponse> {
  const token = process.env.FONNTE_API_TOKEN;

  if (!token) {
    console.error("FONNTE_API_TOKEN not configured in environment variables");
    return {
      status: false,
      message: "Fonnte API token not configured",
    };
  }

  const formattedPhone = formatPhoneNumber(params.phone);

  try {
    const formData = new URLSearchParams();
    formData.append("target", formattedPhone);
    formData.append("message", params.message);

    if (params.url) {
      formData.append("url", params.url);
    }

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = (await response.json()) as FonnteResponse;

    if (!response.ok) {
      console.error("Fonnte API error:", result);
      return {
        status: false,
        message: result.message || "Failed to send WhatsApp message",
      };
    }

    return result;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return {
      status: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Kirim pesan WhatsApp ke multiple nomor sekaligus (broadcast)
 *
 * Note: Fonnte memiliki rate limit. Untuk bulk yang besar (>50 nomor),
 * sebaiknya di-batch dengan delay antar batch.
 *
 * @param params - array of phone numbers, message, dan optional attachment URL
 * @returns Promise with success count and failed phones
 *
 * @example
 * ```ts
 * const result = await sendBulkWhatsApp({
 *   phones: ["081234567890", "081234567891"],
 *   message: "Meeting dimulai 5 menit lagi!"
 * });
 * console.log(`Sent to ${result.successCount} recipients`);
 * ```
 */
export async function sendBulkWhatsApp(params: SendBulkWhatsAppParams): Promise<{
  successCount: number;
  failedCount: number;
  failedPhones: string[];
}> {
  const token = process.env.FONNTE_API_TOKEN;

  if (!token) {
    console.error("FONNTE_API_TOKEN not configured");
    return {
      successCount: 0,
      failedCount: params.phones.length,
      failedPhones: params.phones,
    };
  }

  const results = {
    successCount: 0,
    failedCount: 0,
    failedPhones: [] as string[],
  };

  // Format all phone numbers
  const formattedPhones = params.phones.map(formatPhoneNumber);

  // Join phones with comma for Fonnte bulk send
  const targetPhones = formattedPhones.join(",");

  try {
    const formData = new URLSearchParams();
    formData.append("target", targetPhones);
    formData.append("message", params.message);

    if (params.url) {
      formData.append("url", params.url);
    }

    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = (await response.json()) as FonnteResponse;

    if (response.ok && result.status) {
      results.successCount = params.phones.length;
    } else {
      console.error("Fonnte bulk send error:", result);
      results.failedCount = params.phones.length;
      results.failedPhones = params.phones;
    }
  } catch (error) {
    console.error("Error sending bulk WhatsApp:", error);
    results.failedCount = params.phones.length;
    results.failedPhones = params.phones;
  }

  return results;
}

/**
 * Format pesan WhatsApp dengan markdown-style formatting
 *
 * WhatsApp mendukung:
 * - *bold*
 * - _italic_
 * - ~strikethrough~
 * - ```monospace```
 *
 * @example
 * ```ts
 * formatWhatsAppMessage({
 *   title: "Meeting Reminder",
 *   body: "Jangan lupa meeting hari ini jam 14:00",
 *   footer: "I-FEST Management System"
 * });
 * // Returns: "*Meeting Reminder*\n\nJangan lupa meeting hari ini jam 14:00\n\n_I-FEST Management System_"
 * ```
 */
export function formatWhatsAppMessage(params: {
  title: string;
  body: string;
  footer?: string;
}): string {
  let message = `*${params.title}*\n\n${params.body}`;

  if (params.footer) {
    message += `\n\n_${params.footer}_`;
  }

  return message;
}
