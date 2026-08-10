/**
 * Google Apps Script - Synchronizer Keuangan & Upload Nota Drive IFEST 2026
 * -------------------------------------------------------------------------
 * Fitur:
 * 1. Otomatis membuat/mengarahkan nota ke Folder Divisi di Google Drive (BENPAT/<NAMA_DIVISI>)
 * 2. Menyimpan file nota (Gambar/PDF) langsung ke folder divisi (ACARA, HUMAS, SPONSORSHIP, LOGISTIK, dll)
 * 3. Mengembalikan Link Google Drive publik untuk disimpan ke database Dashboard
 * 4. Mengisi Jurnal Transaksi & Pagu Anggaran secara real-time di Google Sheets Bendahara
 *
 * Cara Penggunaan:
 * 1. Buka Google Sheets Bendahara Panitia.
 * 2. Klik menu: Ekstensi -> Apps Script.
 * 3. Hapus semua kode default, tempelkan (paste) seluruh skrip ini.
 * 4. Isikan BENPAT_FOLDER_ID dengan ID folder parent 'BENPAT' di Google Drive (opsional, atau biarkan pencarian otomatis).
 * 5. Klik "Deploy" -> "New deployment" -> pilih type "Web app".
 * 6. Set Execute as: "Me", Access: "Anyone".
 * 7. Salin Web App URL (contoh: https://script.google.com/macros/s/.../exec).
 * 8. Tempelkan URL tersebut ke Pengaturan Webhook Dashboard Keuangan I-FEST atau di .env.local:
 *    APPSCRIPT_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
 */

// Ganti dengan ID Folder 'BENPAT' di Google Drive jika ada (Contoh: "1a2b3c4d5e6f7g8h9i")
// Jika dikosongkan (""), skrip akan otomatis mencari atau membuat folder "BENPAT" di Drive Anda.
var BENPAT_FOLDER_ID = "";

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "upload_receipt") {
      return handleUploadReceipt(contents.data);
    } else if (action === "sync_transaction") {
      return handleSyncTransaction(ss, contents.data);
    } else if (action === "delete_transaction") {
      return handleDeleteTransaction(ss, contents.transaction_id);
    } else if (action === "bulk_sync") {
      return handleBulkSync(ss, contents.data);
    }

    return responseJSON({ success: false, error: "Action tidak dikenal: " + action });
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook Synchronizer & Upload Drive Keuangan I-FEST 2026 Siap Digunakan!")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Mencari atau Membuat Parent Folder 'BENPAT' dan Subfolder Divisi
 */
function getTargetDivisionFolder(divisionName) {
  var parentFolder;

  if (BENPAT_FOLDER_ID && BENPAT_FOLDER_ID.trim() !== "") {
    try {
      parentFolder = DriveApp.getFolderById(BENPAT_FOLDER_ID.trim());
    } catch (err) {
      Logger.log("Folder ID tidak valid, mencari folder BENPAT...");
    }
  }

  if (!parentFolder) {
    var folders = DriveApp.getFoldersByName("BENPAT");
    if (folders.hasNext()) {
      parentFolder = folders.next();
    } else {
      parentFolder = DriveApp.createFolder("BENPAT");
    }
  }

  // Normalisasi Nama Divisi (Contoh: "bph" -> "INTI", "acara" -> "ACARA")
  var targetName = (divisionName || "UMUM").toUpperCase().trim();
  if (targetName === "BPH" || targetName === "BPH INTI") {
    targetName = "INTI";
  }

  // Cari subfolder divisi di dalam folder BENPAT
  var subFolders = parentFolder.getFoldersByName(targetName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  } else {
    return parentFolder.createFolder(targetName);
  }
}

/**
 * Upload Nota ke Folder Divisi di Google Drive
 */
function handleUploadReceipt(data) {
  if (!data.file_base64) {
    return responseJSON({ success: false, error: "Data file_base64 wajib diisi" });
  }

  var divisionFolder = getTargetDivisionFolder(data.division_name);
  
  // Clean base64 header if exists (e.g. data:image/png;base64,...)
  var base64Data = data.file_base64;
  if (base64Data.indexOf("base64,") !== -1) {
    base64Data = base64Data.split("base64,")[1];
  }

  var mimeType = data.mime_type || "image/jpeg";
  var fileName = data.file_name || ("Nota_" + (data.division_name || "Divisi") + "_" + Date.now());

  var decodedBlob = Utilities.newBlob(
    Utilities.base64Decode(base64Data),
    mimeType,
    fileName
  );

  var createdFile = divisionFolder.createFile(decodedBlob);
  createdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileUrl = createdFile.getUrl();

  return responseJSON({
    success: true,
    file_url: fileUrl,
    file_id: createdFile.getId(),
    folder_name: divisionFolder.getName(),
    message: "Nota berhasil diupload ke folder BENPAT/" + divisionFolder.getName()
  });
}

/**
 * Memastikan sheet 'Jurnal Transaksi' & 'Pagu Anggaran' siap
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

  return responseJSON({ success: true, message: "Transaksi berhasil disinkronkan" });
}

function handleDeleteTransaction(ss, txId) {
  var sheet = getOrCreateSheet(ss, "Jurnal Transaksi");
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(txId)) {
      sheet.deleteRow(i + 1);
      return responseJSON({ success: true, message: "Transaksi dihapus dari Sheet" });
    }
  }

  return responseJSON({ success: true, message: "Transaksi tidak ditemukan" });
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

  return responseJSON({ success: true, message: "Bulk sync berhasil" });
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
