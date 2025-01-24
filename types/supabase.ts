import { Database } from './database'

declare module '@supabase/auth-helpers-nextjs' {
  interface Session {
    twitter_code_verifier?: string
    twitter_state?: string
  }
}

