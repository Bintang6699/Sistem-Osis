const { Client } = require('pg');

const connectionString = 'postgresql://postgres.ndlkduqgbfbctxmkiiau:uangosis032@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

async function createUser() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check if user already exists
    const checkRes = await client.query(`SELECT id FROM auth.users WHERE email = $1`, ['bendahara@osis.sch.id']);
    let userId;

    if (checkRes.rows.length > 0) {
      console.log('User already exists. Updating password and confirming email...');
      userId = checkRes.rows[0].id;
      await client.query(`
        UPDATE auth.users 
        SET encrypted_password = crypt($1, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = $2
      `, ['uangosis032', userId]);
    } else {
      console.log('Creating new user...');
      const insertRes = await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1,
          crypt($2, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}',
          '{}',
          now(),
          now()
        ) RETURNING id;
      `, ['bendahara@osis.sch.id', 'uangosis032']);
      userId = insertRes.rows[0].id;
    }

    console.log('Updating profile role to bendahara...');
    await client.query(`
      UPDATE public.profiles
      SET role = 'bendahara'
      WHERE id = $1
    `, [userId]);

    console.log('User created and configured successfully!');
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await client.end();
  }
}

createUser();
