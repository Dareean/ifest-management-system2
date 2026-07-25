const { Client } = require('pg');

async function testConnection(host, port, user) {
  console.log(`Testing host: ${host}, port: ${port}, user: ${user}...`);
  const client = new Client({
    connectionString: `postgresql://${user}:I-Fest%402026@${host}:${port}/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log(`  -> SUCCESS connected to ${host}:${port}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`  -> FAILED: ${err.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  const hosts = [
    'db.xxmxbyiggrottreetrig.supabase.co',
    'aws-0-ap-southeast-1.pooler.supabase.com'
  ];
  
  const users = [
    'postgres',
    'postgres.xxmxbyiggrottreetrig'
  ];
  
  const ports = [5432, 6543];

  for (const host of hosts) {
    for (const port of ports) {
      for (const user of users) {
        const success = await testConnection(host, port, user);
        if (success) {
          console.log(`\nFound working combination!`);
          console.log(`Host: ${host}`);
          console.log(`Port: ${port}`);
          console.log(`User: ${user}`);
          return;
        }
      }
    }
  }
  console.log('\nAll combinations failed.');
}

main().catch(console.error);
