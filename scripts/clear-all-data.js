const dns = require('dns');

// Force Cloudflare's public DNS servers
dns.setServers(['1.1.1.1', '1.0.0.1']);

const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (hostname === 'db.xxmxbyiggrottreetrig.supabase.co') {
    console.log(`dns.lookup intercepted for: ${hostname}`);
    
    dns.resolve6(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        dns.resolve4(hostname, (err4, addresses4) => {
          if (err4 || !addresses4 || addresses4.length === 0) {
            console.error(`DNS override failed:`, err || err4);
            callback(err || err4, null, 4);
          } else {
            console.log(`DNS override resolved IPv4: ${addresses4[0]}`);
            if (options && options.all) {
              callback(null, [{ address: addresses4[0], family: 4 }]);
            } else {
              callback(null, addresses4[0], 4);
            }
          }
        });
      } else {
        console.log(`DNS override resolved IPv6: ${addresses[0]}`);
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

async function main() {
  const client = new Client({
    connectionString: `postgresql://postgres:I-Fest%402026@db.xxmxbyiggrottreetrig.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    console.log('Starting data deletion process...');

    console.log('Deleting weekly_reports...');
    const delReports = await client.query('DELETE FROM weekly_reports;');
    console.log(`Deleted ${delReports.rowCount} weekly reports.`);

    console.log('Deleting letter_revisions...');
    const delRevisions = await client.query('DELETE FROM letter_revisions;');
    console.log(`Deleted ${delRevisions.rowCount} letter revisions.`);

    console.log('Deleting letter_requests...');
    const delLetters = await client.query('DELETE FROM letter_requests;');
    console.log(`Deleted ${delLetters.rowCount} letter requests.`);

    console.log('Deleting tasks...');
    const delTasks = await client.query('DELETE FROM tasks;');
    console.log(`Deleted ${delTasks.rowCount} tasks.`);

    console.log('All requested data cleared successfully!');

    await client.end();
  } catch (err) {
    console.error('Error clearing data:', err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

main();
