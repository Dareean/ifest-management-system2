const webhookUrl = "https://script.google.com/macros/s/AKfycbwXE0TGix0aNSElZhW5ShDVvMG7yrMAfSVyyqPK9ZEhRIWXhAPtILwNv_ilsxzf63BM/exec";

async function testSync() {
  console.log("Testing POST request to Google Apps Script Web App...");
  try {
    const payload = {
      action: "bulk_sync",
      data: {
        budgets: [
          {
            division_name: "Acara",
            total_budget: 5000000,
            used_amount: 150000,
            remaining: 4850000,
          },
        ],
        transactions: [
          {
            id: "d4266f60-91a1-445d-acea-baf897d12875",
            transaction_date: "10/08/2026",
            division_name: "Acara",
            type: "expense",
            category: "cetak",
            description: "Pembelian Alat & Banner Konsumsi Rapat Panitia",
            amount: 150000,
            receipt_number: "NOTA-ACARA-001",
            attachment_url: "https://drive.google.com/file/d/sample-receipt-link/view",
          },
        ],
      },
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch (err) {
    console.error("Test error:", err);
  }
}

testSync();
