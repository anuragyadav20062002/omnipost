interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
  TWITTER_CLIENT_ID: string;
  TWITTER_CLIENT_SECRET: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
}

interface Profile {
  id: string
  social_accounts: {
    twitter?: {
      access_token: string
      refresh_token: string
      expires_at: number
      screen_name?: string
      user_id: string // Add this line
    }
    facebook?: {
      access_token: string
      expires_at: number
      user_id: string
      name?: string
      pages?: Array<{
        id: string
        name: string
        access_token: string
        instagram_account?: {
          id: string
          username: string
        }
      }>
    }
    instagram?: {
      access_token: string
      expires_at: number
      user_id: string
      instagram_account_id: string
      username?: string
    }
  }
}

// ... rest of the file remains unchanged



interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  post_id: string;
  user_id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  scheduled_for: string;
  published_at: string | null;
  status: 'pending' | 'published' | 'failed';
  error_message: string | null;
  recurring_schedule: string | null;
  platform_post_id: string | null;
  metadata: any;
  content: string;
  image_url: string | null;
}

interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
}

// Facebook API Response Types
interface FacebookPostResponse {
  id: string;
  post_id?: string;
}

// Instagram API Response Types
interface InstagramMediaResponse {
  id: string;
  status?: string;
}

interface InstagramPublishResponse {
  id: string;
  status?: string;
}

interface InstagramPostResponse {
  id: string;
  status?: string;
}

// Twitter API Response Types
interface TwitterPostResponse {
  data: {
    id: string;
    text: string;
  };
}

// Generic API Response Type
type SocialMediaPostResponse = FacebookPostResponse | InstagramPostResponse | TwitterPostResponse;

