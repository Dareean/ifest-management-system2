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
    
    console.log('Querying from profiles...');
    const resProfiles = await client.query(`
      SELECT ca.id, p.full_name, p.nim
      FROM committee_assignments ca
      JOIN profiles p ON ca.user_id = p.id
      LIMIT 5;
    `);
    console.log('Profiles success:', resProfiles.rows);

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end().catch(() => {});
  }
}

main();
