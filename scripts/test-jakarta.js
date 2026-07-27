const { Client } = require("pg");

const config = {
  host: "aws-0-ap-southeast-3.pooler.supabase.com",
  user: "postgres.xxmxbyiggrottreetrig",
  password: "I-Fest@2026",
  database: "postgres",
  port: 6543,
  ssl: { rejectUnauthorized: false }
};

async function main() {
  console.log("Testing connection to Jakarta pooler...");
  const client = new Client(config);
  try {
    await client.connect();
    console.log("SUCCESS! Connected to Jakarta pooler!");
    const res = await client.query("SELECT version()");
    console.log("Postgres version:", res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
    await client.end().catch(() => {});
  }
}

main();
