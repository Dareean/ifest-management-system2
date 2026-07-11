const { Client } = require("pg");

const sql = `
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS deadline_at DATE;
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS target_institution VARCHAR(255);
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS request_options TEXT;
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'sedang';
NOTIFY pgrst, 'reload schema';
`;

const client = new Client({
  connectionString: "postgresql://postgres.xxmxbyiggrottreetrig:I-Fest%402026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL");
    await client.query(sql);
    console.log("SQL executed successfully via PG!");
  } catch (err) {
    console.error("PG error:", err.message);
  } finally {
    await client.end();
  }
}
main();
