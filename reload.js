const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.ndlkduqgbfbctxmkiiau:uangosis032@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
});

async function main() {
  try {
    const res = await pool.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('Reloaded schema:', res.command);
    
    // Also explicitly grant permissions to authenticated role just in case
    await pool.query(`GRANT ALL ON TABLE public.members TO authenticated;`);
    await pool.query(`GRANT ALL ON TABLE public.members TO anon;`);
    await pool.query(`GRANT ALL ON TABLE public.members TO service_role;`);
    console.log('Granted permissions');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

main();
