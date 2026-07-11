const dns = require('dns');

const hostnames = [
  'xxmxbyiggrottreetrig.supabase.co',
  'db.xxmxbyiggrottreetrig.supabase.co',
  'aws-0-ap-southeast-1.pooler.supabase.com'
];

async function main() {
  for (const host of hostnames) {
    console.log(`Resolving ${host}...`);
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.lookup(host, { all: true }, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      console.log(`  dns.lookup results:`, JSON.stringify(addresses));
    } catch (e) {
      console.error(`  dns.lookup failed:`, e.message);
    }

    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.resolve(host, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      console.log(`  dns.resolve results:`, JSON.stringify(addresses));
    } catch (e) {
      console.error(`  dns.resolve failed:`, e.message);
    }
  }
}

main();
