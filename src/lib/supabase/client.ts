import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton browser client — stores session in localStorage
let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!_client) {
    _client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          storageKey: 'sb-session',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      }
    )
  }
  return _client
}
