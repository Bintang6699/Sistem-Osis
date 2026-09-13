const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = 'postgresql://postgres.ndlkduqgbfbctxmkiiau:uangosis032@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

async function setup() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Membuat tabel app_users...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.app_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'bendahara', 'viewer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Tabel app_users berhasil dibuat!');

  const email = 'bendahara@osis.sch.id';
  const password = 'uangosis032';
  const passwordHash = await bcrypt.hash(password, 10);

  console.log('Membuat akun bendahara...');
  await client.query(`
    INSERT INTO public.app_users (email, password_hash, name, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $3, role = $4;
  `, [email, passwordHash, 'Bendahara OSIS', 'bendahara']);

  console.log('');
  console.log('====================================');
  console.log('✅ Akun berhasil dibuat!');
  console.log('   Email   :', email);
  console.log('   Password:', password);
  console.log('   Role    : bendahara');
  console.log('====================================');

  await client.end();
}

setup().catch(console.error);
