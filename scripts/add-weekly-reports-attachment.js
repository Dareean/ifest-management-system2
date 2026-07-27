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

    console.log('Adding attachment_url column to weekly_reports table if it does not exist...');
    await client.query(`
      ALTER TABLE weekly_reports 
      ADD COLUMN IF NOT EXISTS attachment_url TEXT;
    `);
    console.log('Column added successfully!');

    await client.end();
  } catch (err) {
    console.error('Error adding column:', err);
    process.exit(1);
  }
}

main();
