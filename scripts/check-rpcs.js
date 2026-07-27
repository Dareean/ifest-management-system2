const https = require('https');

https.get('https://xxmxbyiggrottreetrig.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const paths = Object.keys(json.paths || {});
      const rpcPaths = paths.filter(p => p.startsWith('/rpc/'));
      console.log('RPC Endpoints found:', rpcPaths);
    } catch (e) {
      console.error('Failed to parse OpenAPI JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
