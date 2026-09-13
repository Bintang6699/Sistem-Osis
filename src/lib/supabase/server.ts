import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Supabase client for server components - uses anon key with RLS
export async function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          // Use service role behavior for server-side operations
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        }
      }
    }
  )
}
