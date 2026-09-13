const { Client } = require('pg');
const connectionString = 'postgresql://postgres.ndlkduqgbfbctxmkiiau:uangosis032@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

async function checkUser() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT id, email, instance_id FROM auth.users');
  console.log(res.rows);
  await client.end();
}
checkUser();
