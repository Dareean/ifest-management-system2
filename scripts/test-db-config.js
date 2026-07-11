const { Client } = require("pg");

const config = {
  host: "aws-0-ap-southeast-1.pooler.supabase.com",
  user: "postgres.xxmxbyiggrottreetrig",
  password: "I-Fest@2026",
  database: "postgres",
  ssl: { rejectUnauthorized: false }
};

async function testPort(port) {
  console.log(`Testing port ${port}...`);
  const client = new Client({ ...config, port });
  try {
    await client.connect();
    console.log(`  Successfully connected on port ${port}!`);
    
    // Run a test query
    const res = await client.query("SELECT version()");
    console.log("  Postgres version:", res.rows[0].version);
    
    await client.end();
    return true;
  } catch (err) {
    console.log(`  Failed on port ${port}: ${err.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  const ok5432 = await testPort(5432);
  const ok6543 = await testPort(6543);
  if (ok5432 || ok6543) {
    console.log("Connection test succeeded!");
  } else {
    console.log("Connection test failed on both ports.");
  }
}

main().catch(console.error);
