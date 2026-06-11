const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log('Reading env from:', envPath);
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error('Failed to read .env.local', err);
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
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Initializing Anon Client...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('\n--- STARTING RLS VERIFICATION TESTS ---');

  // Test 1: SELECT from leads (Should fail / return empty list or permission error)
  try {
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    if (error) {
      console.log('✅ Test 1: SELECT from leads failed/blocked. Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('❌ Test 1: SELECT from leads SUCCEEDED and returned data! This is a vulnerability. Data:', data);
    } else {
      console.log('✅ Test 1: SELECT from leads returned empty array (blocked by RLS).');
    }
  } catch (err) {
    console.log('✅ Test 1: SELECT from leads failed. Error:', err.message);
  }

  // Test 2: INSERT into leads (Should succeed, but returning data might be empty because SELECT is blocked)
  try {
    const testLead = {
      name: 'RLS Verification Test User',
      phone: '+380000000000',
      telegram: 'rls_test_anon',
      status: 'pending',
      order_id: 'ORDER_TEST_' + Math.random().toString(36).substr(2, 9)
    };
    const { data, error } = await supabase.from('leads').insert(testLead);
    if (error) {
      console.log('❌ Test 2: INSERT into leads failed! Error:', error.message);
    } else {
      console.log('✅ Test 2: INSERT into leads succeeded.');
    }
  } catch (err) {
    console.log('❌ Test 2: INSERT into leads failed. Error:', err.message);
  }

  // Test 3: UPDATE on leads (Should not affect any rows / fail silently)
  try {
    const { data, error, count } = await supabase
      .from('leads')
      .update({ name: 'Hacked name' })
      .eq('telegram', 'rls_test_anon')
      .select(); // We use select to check if any rows were modified and returned
    if (error) {
      console.log('✅ Test 3: UPDATE on leads failed/blocked with error:', error.message);
    } else if (data && data.length > 0) {
      console.log('❌ Test 3: UPDATE on leads SUCCEEDED! Hacked name was saved. Data:', data);
    } else {
      console.log('✅ Test 3: UPDATE on leads affected 0 rows (blocked by RLS).');
    }
  } catch (err) {
    console.log('✅ Test 3: UPDATE on leads failed as expected. Error:', err.message);
  }

  // Test 4: DELETE on leads (Should not affect any rows / fail silently)
  try {
    const { data, error } = await supabase
      .from('leads')
      .delete()
      .eq('telegram', 'rls_test_anon')
      .select();
    if (error) {
      console.log('✅ Test 4: DELETE on leads failed/blocked with error:', error.message);
    } else if (data && data.length > 0) {
      console.log('❌ Test 4: DELETE on leads SUCCEEDED! Row was deleted. Data:', data);
    } else {
      console.log('✅ Test 4: DELETE on leads affected 0 rows (blocked by RLS).');
    }
  } catch (err) {
    console.log('✅ Test 4: DELETE on leads failed as expected. Error:', err.message);
  }

  // Test 5: minicourse_users SELECT (Should fail / be denied)
  try {
    const { data, error } = await supabase.from('minicourse_users').select('*').limit(1);
    if (error) {
      console.log('✅ Test 5: SELECT from minicourse_users failed/denied. Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('❌ Test 5: SELECT from minicourse_users SUCCEEDED! Data:', data);
    } else {
      console.log('✅ Test 5: SELECT from minicourse_users returned empty array (blocked by RLS).');
    }
  } catch (err) {
    console.log('✅ Test 5: SELECT from minicourse_users failed. Error:', err.message);
  }

  // Test 6: minicourse_progress SELECT (Should fail / be denied)
  try {
    const { data, error } = await supabase.from('minicourse_progress').select('*').limit(1);
    if (error) {
      console.log('✅ Test 6: SELECT from minicourse_progress failed/denied. Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('❌ Test 6: SELECT from minicourse_progress SUCCEEDED! Data:', data);
    } else {
      console.log('✅ Test 6: SELECT from minicourse_progress returned empty array (blocked by RLS).');
    }
  } catch (err) {
    console.log('✅ Test 6: SELECT from minicourse_progress failed. Error:', err.message);
  }

  // Test 7: minicourse_lessons_config SELECT (Should fail / be denied)
  try {
    const { data, error } = await supabase.from('minicourse_lessons_config').select('*').limit(1);
    if (error) {
      console.log('✅ Test 7: SELECT from minicourse_lessons_config failed/denied. Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('❌ Test 7: SELECT from minicourse_lessons_config SUCCEEDED! Data:', data);
    } else {
      console.log('✅ Test 7: SELECT from minicourse_lessons_config returned empty array (blocked by RLS).');
    }
  } catch (err) {
    console.log('✅ Test 7: SELECT from minicourse_lessons_config failed. Error:', err.message);
  }

  // Test 8: minicourse_autologin_tokens SELECT (Should fail / be denied)
  try {
    const { data, error } = await supabase.from('minicourse_autologin_tokens').select('*').limit(1);
    if (error) {
      console.log('✅ Test 8: SELECT from minicourse_autologin_tokens failed/denied. Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('❌ Test 8: SELECT from minicourse_autologin_tokens SUCCEEDED! Data:', data);
    } else {
      console.log('✅ Test 8: SELECT from minicourse_autologin_tokens returned empty array (blocked by RLS).');
    }
  } catch (err) {
    console.log('✅ Test 8: SELECT from minicourse_autologin_tokens failed. Error:', err.message);
  }

  // Test 9: Try to UPDATE minicourse_users (Should fail / return empty/denied)
  try {
    const { data, error } = await supabase
      .from('minicourse_users')
      .update({ is_paid: true })
      .eq('role', 'student')
      .select();
    if (error) {
      console.log('✅ Test 9: UPDATE on minicourse_users failed/blocked. Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('❌ Test 9: UPDATE on minicourse_users SUCCEEDED! Data:', data);
    } else {
      console.log('✅ Test 9: UPDATE on minicourse_users affected 0 rows (blocked by RLS).');
    }
  } catch (err) {
    console.log('✅ Test 9: UPDATE on minicourse_users failed. Error:', err.message);
  }

  console.log('--- RLS VERIFICATION TESTS COMPLETED ---');
}

runTests();
