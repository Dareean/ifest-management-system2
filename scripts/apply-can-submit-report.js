const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv(fileName) {
  const filePath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && !key.startsWith('#') && !process.env[key]) process.env[key] = val;
    }
  });
}

loadEnv('.env.local');

async function main() {
  const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
  console.log('Connecting to local Postgres at 127.0.0.1:54322...');

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log('Connected!');

    console.log('Adding can_submit_report column to committee_assignments table...');
    await client.query(`
      ALTER TABLE committee_assignments ADD COLUMN IF NOT EXISTS can_submit_report BOOLEAN DEFAULT false;
    `);

    console.log('✓ Successfully added can_submit_report column!');
    await client.end();
  } catch (err) {
    console.error('Error applying migration:', err);
    await client.end().catch(() => {});
  }
}

main();
