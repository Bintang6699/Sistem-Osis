const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    'https://ndlkduqgbfbctxmkiiau.supabase.co',
    'sb_publishable_7ctVwqmn4Hylxtq-VJkJaQ_upRPqJVM'
  );

  const { data, error } = await supabase.from('members').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}

main();
