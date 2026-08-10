const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envLocalPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envLocalPath)) {
  const envText = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envText.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.split("=")[1];
    }
    if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceRoleKey = trimmed.split("=")[1];
    }
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedDummyData() {
  console.log("Seeding dummy transaction data to Supabase Cloud...");

  // 1. Get or create a division
  let { data: div } = await supabase
    .from("divisions")
    .select("id, name")
    .eq("committee_year_id", YEAR_ID)
    .limit(1)
    .single();

  if (!div) {
    console.error("No division found in database.");
    return;
  }

  console.log(`Using division: ${div.name} (${div.id})`);

  // 2. Get or create a budget for this division
  let { data: budget } = await supabase
    .from("budgets")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", div.id)
    .maybeSingle();

  if (!budget) {
    const { data: newB, error: bErr } = await supabase
      .from("budgets")
      .insert({
        committee_year_id: YEAR_ID,
        division_id: div.id,
        total_budget: 5000000,
      })
      .select("id")
      .single();

    if (bErr || !newB) {
      console.error("Error creating budget:", bErr);
      return;
    }
    budget = newB;
  }

  // 3. Get first committee assignment for created_by
  const { data: assignment } = await supabase
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .limit(1)
    .single();

  // 4. Insert dummy transaction
  const dummyTx = {
    budget_id: budget.id,
    type: "expense",
    amount: 150000,
    description: "Pembelian Alat & Banner Konsumsi Rapat Panitia",
    category: "cetak",
    receipt_number: "NOTA-ACARA-001",
    attachment_url: "https://drive.google.com/file/d/sample-receipt-link/view",
    transaction_date: new Date().toISOString(),
    created_by: assignment?.id || null,
  };

  const { data: txData, error: txErr } = await supabase
    .from("budget_transactions")
    .insert(dummyTx)
    .select();

  if (txErr) {
    console.error("Error inserting dummy transaction:", txErr);
  } else {
    console.log("SUCCESS! Dummy transaction inserted into database:");
    console.log(txData);
  }
}

seedDummyData();
