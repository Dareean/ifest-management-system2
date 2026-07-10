const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const sql = fs.readFileSync(
  path.join(__dirname, "..", "src", "database", "migration.sql"),
  "utf-8",
);

const client = new Client({
  connectionString:
    "postgresql://postgres:I-Fest%402026@[2406:da18:167b:f900:3966:80c3:5999:6094]:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL");

    await client.query(sql);
    console.log("Migration executed successfully!");

    // Verify tables were created
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log("Tables created:", rows.map((r) => r.table_name).join(", "));

    // Verify seed data
    const { rows: years } = await client.query(
      "SELECT id, label, is_active FROM committee_years",
    );
    console.log("Committee years:", JSON.stringify(years, null, 2));
  } catch (err) {
    console.error("Migration error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
