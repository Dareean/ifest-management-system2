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

    // Get Daren's profile
    const profileRes = await client.query(`
      SELECT id, full_name FROM profiles WHERE full_name ILIKE '%dareean%' OR full_name ILIKE '%daren%'
    `);
    console.log('\n--- Daren Profiles ---');
    profileRes.rows.forEach(p => {
      console.log(`Profile ID: "${p.id}", Name: "${p.full_name}"`);
    });

    // Get assignments for Daren's profile IDs
    const profileIds = profileRes.rows.map(p => p.id);
    if (profileIds.length > 0) {
      console.log('\n--- Daren Assignments ---');
      const assignRes = await client.query(`
        SELECT id, user_id, committee_year_id, role_id, division_id, is_active
        FROM committee_assignments
        WHERE user_id = ANY($1)
      `, [profileIds]);
      assignRes.rows.forEach(a => {
        console.log(`Assign ID: "${a.id}", User ID: "${a.user_id}", Year ID: "${a.committee_year_id}", Role ID: "${a.role_id}", Division ID: "${a.division_id}", Active: ${a.is_active}`);
      });
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end().catch(() => {});
  }
}

main();
