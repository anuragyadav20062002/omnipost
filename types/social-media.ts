export interface SocialMediaToken {
    access_token: string
    refresh_token?: string
    expires_at: number
    platform: 'twitter' | 'facebook' | 'instagram'
  }
  
  export interface TwitterConfig {
    oauth2_client_id: string
    oauth2_client_secret: string
    callback_url: string
  }
  
  export interface FacebookConfig {
    app_id: string
    app_secret: string
    callback_url: string
  }
  
  export interface InstagramConfig extends FacebookConfig {
    instagram_account_id?: string
  }
  
  // Extend the Session type from NextAuth
  declare module '@supabase/auth-helpers-nextjs' {
    interface Session {
      twitter_code_verifier?: string
      twitter_state?: string
      access_token: string
      refresh_token: string
      auth_token_type: string
    }
  }
  
  