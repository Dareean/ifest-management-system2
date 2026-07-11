import { sendWhatsAppMessage, formatWhatsAppMessage } from "../lib/fonnte";

/**
 * SCRIPT PENGETESAN FONNTE WHATSAPP
 *
 * Jalankan script ini untuk memastikan token dan integrasi Fonnte berfungsi.
 * Pastikan nomor tujuan sudah terdaftar di WhatsApp.
 */

async function testWhatsApp() {
  const testPhone = "081234567890"; // GANTI DENGAN NOMOR ANDA

  console.log(`🚀 Mengetes pengiriman WhatsApp ke: ${testPhone}...`);

  const message = formatWhatsAppMessage({
    title: "TEST INTEGRASI FONNTE",
    body: "Halo! Jika Anda menerima pesan ini, berarti integrasi Fonnte pada project I-FEST Management System sudah BERHASIL! 🥳",
    footer: "I-FEST Management System"
  });

  const result = await sendWhatsAppMessage({
    phone: testPhone,
    message: message
  });

  if (result.status) {
    console.log("✅ BERHASIL: Pesan terkirim!");
  } else {
    console.log("❌ GAGAL: " + (result.message || "Terjadi kesalahan unknown"));
  }
}

// Catatan: Script ini butuh environment variables.
// Karena script ini dijalankan di luar Next.js context,
// Anda bisa mengetesnya dengan memanggil fungsi ini dari API route atau Server Action.

export { testWhatsApp };
