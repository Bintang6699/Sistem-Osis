const { Client } = require('pg');
const connectionString = 'postgresql://postgres.ndlkduqgbfbctxmkiiau:uangosis032@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

async function fixInstanceId() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query(`UPDATE auth.users SET instance_id = NULL WHERE email = 'bendahara@osis.sch.id' RETURNING *`);
  console.log(res.rows);
  await client.end();
}
fixInstanceId();
