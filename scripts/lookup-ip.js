const https = require('https');

const ip = '2406:da18:167b:f900:3966:80c3:5999:6094';
const url = `https://ipinfo.io/${ip}/json`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      console.log('IP Details:', JSON.parse(data));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
