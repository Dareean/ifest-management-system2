const { Client } = require('pg');

async function main() {
  const host = 'db.xxmxbyiggrottreetrig.supabase.co';
  const client = new Client({
    connectionString: `postgresql://postgres:I-Fest%402026@${host}:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL.');

    // 1. Alter table
    console.log('Altering divisions table to add supervisor_id...');
    await client.query(`
      ALTER TABLE divisions 
      ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES committee_assignments(id) ON DELETE SET NULL;
    `);
    console.log('Column supervisor_id verified/created.');

    // 2. Fetch assignments for Daren, Gabriel, Reyqal
    console.log('Fetching committee_assignments for Daren, Gabriel, and Reyqal...');
    const res = await client.query(`
      SELECT ca.id, p.full_name, p.nim
      FROM committee_assignments ca
      JOIN profiles p ON ca.user_id = p.id
      WHERE p.nim IN ('F55124086', 'F55124076', 'F52124039');
    `);

    const assignments = res.rows;
    console.log(`Found ${assignments.length} assignments:`);
    console.log(assignments);

    const daren = assignments.find(a => a.nim === 'F55124086');
    const gabriel = assignments.find(a => a.nim === 'F55124076');
    const reyqal = assignments.find(a => a.nim === 'F52124039');

    if (!daren || !gabriel || !reyqal) {
      console.warn('Warning: One or more supervisors were not found in committee_assignments!');
    }

    // 3. Update divisions
    // Daren: Ekraf (ekonomi-kreatif), Konsumsi (konsumsi), Keamanan (keamanan)
    if (daren) {
      console.log(`Setting Daren (${daren.full_name}) as supervisor for ekonomi-kreatif, konsumsi, keamanan...`);
      await client.query(`
        UPDATE divisions
        SET supervisor_id = $1
        WHERE slug IN ('ekonomi-kreatif', 'konsumsi', 'keamanan');
      `, [daren.id]);
    }

    // Gabriel: Acara (acara), Lapangan (lapangan), Logistik (logistik)
    if (gabriel) {
      console.log(`Setting Gabriel (${gabriel.full_name}) as supervisor for acara, lapangan, logistik...`);
      await client.query(`
        UPDATE divisions
        SET supervisor_id = $1
        WHERE slug IN ('acara', 'lapangan', 'logistik');
      `, [gabriel.id]);
    }

    // Reyqal: Sponsorship (sponsorship), Kreativitas (kreativitas), Humas (humas)
    if (reyqal) {
      console.log(`Setting Reyqal (${reyqal.full_name}) as supervisor for sponsorship, kreativitas, humas...`);
      await client.query(`
        UPDATE divisions
        SET supervisor_id = $1
        WHERE slug IN ('sponsorship', 'kreativitas', 'humas');
      `, [reyqal.id]);
    }

    console.log('Migration and assignments completed successfully!');
    await client.end();
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

main();
