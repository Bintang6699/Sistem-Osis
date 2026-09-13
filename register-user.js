const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabase = createClient(
  'https://ndlkduqgbfbctxmkiiau.supabase.co',
  'sb_publishable_7ctVwqmn4Hylxtq-VJkJaQ_upRPqJVM'
);

const connectionString = 'postgresql://postgres.ndlkduqgbfbctxmkiiau:uangosis032@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

async function run() {
  // Daftar menggunakan email Gmail yang valid
  const EMAIL = 'bendahara.osis.dompu@gmail.com';
  const PASSWORD = 'uangosis032';

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Hapus user lama jika ada
  await client.query(`DELETE FROM auth.users WHERE email = $1`, [EMAIL]);

  await client.end();

  // Signup via SDK
  console.log('Membuat akun baru...');
  const { data, error } = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
    options: { data: { name: 'Bendahara OSIS' } }
  });

  if (error) {
    console.error('SIGNUP ERROR:', error.message);
    return;
  }
  console.log('Signup berhasil! ID:', data.user?.id);

  // Konfirmasi email dan set role
  const client2 = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client2.connect();

  await client2.query(`
    UPDATE auth.users SET email_confirmed_at = now() WHERE email = $1
  `, [EMAIL]);
  await client2.query(`
    UPDATE public.profiles SET role = 'bendahara', name = 'Bendahara OSIS' WHERE email = $1
  `, [EMAIL]);
  await client2.end();

  // Test login
  console.log('Test login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: EMAIL, password: PASSWORD
  });

  if (loginError) {
    console.error('LOGIN GAGAL:', loginError.message);
  } else {
    console.log('');
    console.log('===========================================');
    console.log('✅  LOGIN BERHASIL! Aplikasi siap dipakai.');
    console.log('    Email   :', EMAIL);
    console.log('    Password:', PASSWORD);
    console.log('===========================================');
  }
}

run();
