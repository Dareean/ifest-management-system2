const dns = require('dns');

const ip = '2406:da18:167b:f900:3966:80c3:5999:6094';

async function main() {
  console.log(`Performing reverse DNS lookup for ${ip}...`);
  try {
    const hostnames = await new Promise((resolve, reject) => {
      dns.reverse(ip, (err, hostnames) => {
        if (err) reject(err);
        else resolve(hostnames);
      });
    });
    console.log('Hostnames:', hostnames);
  } catch (e) {
    console.error('Reverse DNS lookup failed:', e.message);
  }
}

main().catch(console.error);
