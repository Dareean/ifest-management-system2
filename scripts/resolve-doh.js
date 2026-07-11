const https = require('https');

const hostnames = [
  'db.xxmxbyiggrottreetrig.supabase.co',
  'db.xxmxbyiggrottreetrig.supabase.com',
  'xxmxbyiggrottreetrig.supabase.co'
];

function resolveDoH(hostname) {
  return new Promise((resolve) => {
    const url = `https://cloudflare-dns.com/dns-query?name=${hostname}&type=A`;
    const options = {
      headers: {
        'accept': 'application/dns-json'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ hostname, status: 'success', answers: json.Answer || [] });
        } catch (e) {
          resolve({ hostname, status: 'error', message: 'Failed to parse response' });
        }
      });
    }).on('error', (err) => {
      resolve({ hostname, status: 'error', message: err.message });
    });
  });
}

async function main() {
  console.log('Resolving hostnames via Cloudflare DoH...');
  for (const host of hostnames) {
    const result = await resolveDoH(host);
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
