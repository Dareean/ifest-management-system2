const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Path to env file
const envPath = path.join(__dirname, '../.env.local');

if (!fs.existsSync(envPath)) {
  console.error("File .env.local tidak ditemukan di path:", envPath);
  process.exit(1);
}

// Parse env file
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // Remove quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Gagal mendapatkan NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY dari .env.local");
  process.exit(1);
}

console.log("Menghubungkan ke Supabase...");
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearLetters() {
  try {
    console.log("Menghapus seluruh record di tabel letter_requests...");
    
    // Delete all records from letter_requests
    const { error } = await supabase
      .from('letter_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      throw error;
    }

    console.log("Berhasil menghapus seluruh data persuratan!");
  } catch (err) {
    console.error("Terjadi error saat menghapus data:", err);
  }
}

clearLetters();
