const { Client } = require('pg');

async function main() {
  const host = 'db.xxmxbyiggrottreetrig.supabase.co';
  const client = new Client({
    connectionString: `postgresql://postgres:I-Fest%402026@${host}:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected!');

    // Get all auth.users
    const authRes = await client.query(`
      SELECT id, email FROM auth.users
    `);
    console.log('\n--- All Auth Users ---');
    authRes.rows.forEach(u => {
      console.log(`Auth ID: "${u.id}", Email: "${u.email}"`);
    });

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end().catch(() => {});
  }
}

main();
