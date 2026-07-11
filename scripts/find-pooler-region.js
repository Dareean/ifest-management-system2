const dns = require('dns');
const { Client } = require('pg');

const regions = [
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'ap-south-1',     // Mumbai
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'eu-central-1',   // Frankfurt
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'eu-west-3',      // Paris
  'sa-east-1',      // São Paulo
  'ca-central-1'    // Canada Central
];

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  
  // 1. Check DNS first
  const exists = await new Promise((resolve) => {
    dns.lookup(host, (err) => {
      resolve(!err);
    });
  });
  
  if (!exists) return null;
  
  console.log(`Region host found: ${host}. Testing connection...`);
  
  // 2. Try connection
  const client = new Client({
    connectionString: `postgresql://postgres.xxmxbyiggrottreetrig:I-Fest%402026@${host}:6543/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  
  try {
    await client.connect();
    console.log(`SUCCESS! Connected successfully to region: ${region}`);
    await client.end();
    return region;
  } catch (err) {
    console.log(`  Connection failed for ${region}: ${err.message}`);
    await client.end().catch(() => {});
    return null;
  }
}

async function main() {
  console.log('Searching for database region...');
  for (const r of regions) {
    const result = await checkRegion(r);
    if (result) {
      console.log(`\nFound correct region: ${result}`);
      break;
    }
  }
  console.log('Search finished.');
}

main().catch(console.error);
