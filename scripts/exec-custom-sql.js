const https = require('https');

const sql = `
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS deadline_at DATE;
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS target_institution VARCHAR(255);
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS request_options TEXT;
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'sedang';
NOTIFY pgrst, 'reload schema';
`;

const projectRef = 'xxmxbyiggrottreetrig';
const svcKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';

const payload = JSON.stringify({ query: sql });
const options = {
  hostname: `api.supabase.com`,
  path: `/v1/projects/${projectRef}/sql`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${svcKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('SQL executed successfully!');
      if (data) console.log(data);
    } else {
      console.error(`Error ${res.statusCode}:`, data);
    }
  });
});

req.on('error', (e) => console.error('Request failed:', e.message));
req.write(payload);
req.end();
