const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// 1. Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log('Reading environment from:', envPath);

let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error('❌ Failed to read .env.local:', err.message);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Initialize Supabase Client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to generate unique token
function generateToken() {
  // 12-char random alphanumeric string
  return 'gift_' + crypto.randomBytes(6).toString('hex');
}

async function run() {
  console.log('\n--- Generating 6 Gift Links ---');
  
  const botUsername = 'sofifmc_bot';
  const links = [];
  const leadsToInsert = [];

  for (let i = 1; i <= 6; i++) {
    const token = generateToken();
    // Dummy phone format: 38099000000X where X is 1 to 6
    const phone = `38099000000${i}`;
    
    leadsToInsert.push({
      name: `Переможець Конкурсу №${i} (Софія)`,
      phone: phone,
      order_id: token,
      status: 'paid',
      amount: '0',
      is_free: true
    });

    links.push({
      index: i,
      token: token,
      phone: phone,
      link: `https://t.me/${botUsername}?start=pay_${token}`
    });
  }

  // Insert leads in Supabase
  console.log('Inserting leads into database...');
  const { data, error } = await supabase
    .from('leads')
    .insert(leadsToInsert)
    .select();

  if (error) {
    console.error('❌ Failed to insert gift leads:', error.message);
    process.exit(1);
  }

  console.log('✅ Successfully inserted 6 gift leads into `leads` table.\n');
  console.log('=== СГЕНЕРИРОВАННЫЕ ОДНОРАЗОВЫЕ ССЫЛКИ ===');
  links.forEach(item => {
    console.log(`\nПобедитель #${item.index} (Телефон для связывания: ${item.phone}):`);
    console.log(`Ссылка: ${item.link}`);
  });
  console.log('\n=========================================');
}

run();
