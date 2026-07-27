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
    console.log(`dns.lookup intercepted for: ${hostname}, options:`, options);
    
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

const sql = `
CREATE TABLE IF NOT EXISTS weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES committee_assignments(id) ON DELETE CASCADE,
    week_label VARCHAR(50) NOT NULL,
    achievements TEXT NOT NULL,
    blockers TEXT NOT NULL,
    next_week_targets TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'NEED_FIX')),
    supervisor_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(division_id, week_label)
);

ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated all" ON weekly_reports;
CREATE POLICY "Allow authenticated all" ON weekly_reports 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_weekly_reports_division ON weekly_reports(division_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week ON weekly_reports(week_label);
`;

async function main() {
  const client = new Client({
    connectionString: `postgresql://postgres:I-Fest%402026@db.xxmxbyiggrottreetrig.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL via dns.lookup override.');

    console.log('Creating weekly_reports table and setting up security...');
    await client.query(sql);
    console.log('Table and security policies created successfully!');

    await client.end();
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

main();
