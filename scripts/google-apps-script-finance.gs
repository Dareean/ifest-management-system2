/**
 * Google Apps Script - Synchronizer Keuangan IFEST 2026
 * ------------------------------------------------------------
 * Cara Penggunaan:
 * 1. Buka Google Sheets Bendahara.
 * 2. Klik menu: Ekstensi -> Apps Script.
 * 3. Hapus semua kode default, tempelkan (paste) kode ini.
 * 4. Klik "Deploy" -> "New deployment" -> pilih type "Web app".
 * 5. Set Execute as: "Me", Access: "Anyone".
 * 6. Salin Web App URL (contoh: https://script.google.com/macros/s/.../exec).
 * 7. Tempelkan URL tersebut ke Pengaturan Webhook Dashboard Keuangan I-FEST atau di .env.local:
 *    APPSCRIPT_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
 */

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "sync_transaction") {
      return handleSyncTransaction(ss, contents.data);
    } else if (action === "delete_transaction") {
      return handleDeleteTransaction(ss, contents.transaction_id);
    } else if (action === "bulk_sync") {
      return handleBulkSync(ss, contents.data);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Action tidak dikenal" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook Synchronizer Keuangan I-FEST 2026 Siap Digunakan!")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Memastikan sheet 'Jurnal Transaksi' ada dan memiliki header lengkap.
 */
function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (sheetName === "Jurnal Transaksi") {
      sheet.appendRow([
        "ID Transaksi",
        "Tanggal",
        "Divisi",
        "Tipe",
        "Kategori",
        "Deskripsi",
        "Nominal (Rp)",
        "No. Kwitansi / Nota",
        "Link Bukti / Nota",
        "Waktu Ditambahkan"
      ]);
      sheet.getRange("A1:J1").setFontWeight("bold").setBackground("#04000D").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    } else if (sheetName === "Pagu Anggaran") {
      sheet.appendRow([
        "Nama Divisi",
        "Total Anggaran (Rp)",
        "Terpakai (Rp)",
        "Sisa Kas (Rp)",
        "Terakhir Diperbarui"
      ]);
      sheet.getRange("A1:E1").setFontWeight("bold").setBackground("#04000D").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function handleSyncTransaction(ss, data) {
  var sheet = getOrCreateSheet(ss, "Jurnal Transaksi");
  var rows = sheet.getDataRange().getValues();
  var foundRow = -1;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.id)) {
      foundRow = i + 1;
      break;
    }
  }

  var rowValues = [
    data.id,
    data.transaction_date || new Date().toLocaleDateString("id-ID"),
    data.division_name || "-",
    data.type === "income" ? "Pemasukan" : "Pengeluaran",
    data.category || "-",
    data.description || "-",
    data.amount || 0,
    data.receipt_number || "-",
    data.attachment_url || "-",
    new Date().toLocaleString("id-ID")
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Transaksi berhasil disinkronkan" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleDeleteTransaction(ss, txId) {
  var sheet = getOrCreateSheet(ss, "Jurnal Transaksi");
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(txId)) {
      sheet.deleteRow(i + 1);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Transaksi dihapus dari Sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Transaksi tidak ditemukan" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleBulkSync(ss, data) {
  var txSheet = getOrCreateSheet(ss, "Jurnal Transaksi");
  txSheet.clearContents();
  txSheet.appendRow([
    "ID Transaksi",
    "Tanggal",
    "Divisi",
    "Tipe",
    "Kategori",
    "Deskripsi",
    "Nominal (Rp)",
    "No. Kwitansi / Nota",
    "Link Bukti / Nota",
    "Waktu Ditambahkan"
  ]);
  txSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#04000D").setFontColor("#FFFFFF");
  txSheet.setFrozenRows(1);

  if (data.transactions && data.transactions.length > 0) {
    var rows = data.transactions.map(function(t) {
      return [
        t.id,
        t.transaction_date || "-",
        t.division_name || "-",
        t.type === "income" ? "Pemasukan" : "Pengeluaran",
        t.category || "-",
        t.description || "-",
        t.amount || 0,
        t.receipt_number || "-",
        t.attachment_url || "-",
        new Date().toLocaleString("id-ID")
      ];
    });
    txSheet.getRange(2, 1, rows.length, 10).setValues(rows);
  }

  if (data.budgets && data.budgets.length > 0) {
    var budgetSheet = getOrCreateSheet(ss, "Pagu Anggaran");
    budgetSheet.clearContents();
    budgetSheet.appendRow([
      "Nama Divisi",
      "Total Anggaran (Rp)",
      "Terpakai (Rp)",
      "Sisa Kas (Rp)",
      "Terakhir Diperbarui"
    ]);
    budgetSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#04000D").setFontColor("#FFFFFF");
    budgetSheet.setFrozenRows(1);

    var bRows = data.budgets.map(function(b) {
      return [
        b.division_name || "-",
        b.total_budget || 0,
        b.used_amount || 0,
        b.remaining || 0,
        new Date().toLocaleString("id-ID")
      ];
    });
    budgetSheet.getRange(2, 1, bRows.length, 5).setValues(bRows);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Bulk sync berhasil" }))
    .setMimeType(ContentService.MimeType.JSON);
}
