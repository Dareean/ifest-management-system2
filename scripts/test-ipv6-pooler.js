const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (hostname === 'db.xxmxbyiggrottreetrig.supabase.co') {
    dns.resolve6(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        callback(err || new Error('No IPv6 address'), null, 4);
      } else {
        if (options && options.all) {
          callback(null, [{ address: addresses[0], family: 6 }]);
        } else {
          callback(null, addresses[0], 6);
        }
      }
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

const { Client } = require('pg');

async function test(user, port) {
  console.log(`Testing connection with user: ${user}, port: ${port}...`);
  const client = new Client({
    host: 'db.xxmxbyiggrottreetrig.supabase.co',
    port: port,
    user: user,
    password: 'I-Fest@2026',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`  -> SUCCESS! Connected to ${user} on port ${port}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`  -> FAILED: ${err.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  await test('postgres', 6543);
  await test('postgres.xxmxbyiggrottreetrig', 6543);
  await test('postgres', 5432);
}

main();
