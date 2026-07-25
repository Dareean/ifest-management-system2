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

    console.log('\n--- Roles in DB ---');
    const resRoles = await client.query('SELECT name, slug, level FROM roles');
    resRoles.rows.forEach(r => {
      console.log(`Role: "${r.name}", Slug: "${r.slug}", Level: ${r.level}`);
    });

    console.log('\n--- Assignments in DB ---');
    const resAssignments = await client.query(`
      SELECT ca.id, p.full_name, r.name as role_name
      FROM committee_assignments ca
      JOIN profiles p ON ca.user_id = p.id
      JOIN roles r ON ca.role_id = r.id
    `);
    resAssignments.rows.forEach(a => {
      console.log(`User: "${a.full_name}", Role: "${a.role_name}"`);
    });

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end().catch(() => {});
  }
}

main();
