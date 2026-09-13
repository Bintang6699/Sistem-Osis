const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.ndlkduqgbfbctxmkiiau:uangosis032@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
});

async function main() {
  try {
    await client.connect();
    const tables = ['profiles', 'members', 'categories', 'income_transactions', 'expense_transactions', 'expense_items'];
    for (const table of tables) {
      await client.query(`ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`);
      console.log(`Disabled RLS on ${table}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.end();
  }
}

main();
