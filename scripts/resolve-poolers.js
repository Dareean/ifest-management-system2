const https = require('https');

const regions = [
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-southeast-3',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'ca-central-1'
];

function resolveDoH(region) {
  const hostname = `aws-0-${region}.pooler.supabase.com`;
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
          resolve({ region, hostname, exists: !!(json.Answer && json.Answer.length > 0) });
        } catch (e) {
          resolve({ region, hostname, exists: false, error: 'parse' });
        }
      });
    }).on('error', (err) => {
      resolve({ region, hostname, exists: false, error: err.message });
    });
  });
}

async function main() {
  console.log('Checking which regional poolers exist...');
  const results = [];
  for (const r of regions) {
    const res = await resolveDoH(r);
    if (res.exists) {
      console.log(`  ✓ ${res.region} (${res.hostname}) exists!`);
    }
  }
  console.log('Check finished.');
}

main().catch(console.error);
