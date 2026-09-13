const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.ndlkduqgbfbctxmkiiau:uangosis032@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
});

async function main() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = 'members';
    `);
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.end();
  }
}

main();
