const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
  console.log(`Testing login for dmardin@gmail.com on ${supabaseUrl}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'dmardin@gmail.com',
    password: 'Pupapupa@123'
  });

  if (error) {
    console.error('LOGIN ERROR:', error.message);
  } else {
    console.log('LOGIN SUCCESSFUL!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
  }
}

testLogin();
