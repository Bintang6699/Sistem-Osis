const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndlkduqgbfbctxmkiiau.supabase.co',
  'sb_publishable_7ctVwqmn4Hylxtq-VJkJaQ_upRPqJVM'
);

async function testLogin() {
  console.log('Attempting login...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'bendahara@osis.sch.id',
    password: 'uangosis032'
  });

  if (error) {
    console.error('LOGIN ERROR:', error.message);
  } else {
    console.log('LOGIN SUCCESS!', data.user.id);
  }
}

testLogin();
