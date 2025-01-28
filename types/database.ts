export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface SocialAccount {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  platform: 'twitter' | 'facebook' | 'instagram';
}

export interface UsageTracking {
  id: string
  user_id: string
  content_repurposes: number
  scheduled_posts: number
  tweets: number
  facebook_posts: number
  reset_date: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          // Add other fields as necessary
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
          // Add other fields as necessary
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          // Add other fields as necessary
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          social_accounts: Record<string, SocialAccount> | null;
          subscription_id: string | null;
        };
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          social_accounts?: Record<string, SocialAccount> | null
          subscription_id?: string | null
        };
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          social_accounts?: Record<string, SocialAccount> | null
          subscription_id?: string | null
        };
      };
      analytics: {
        Row: {
          id: string
          user_id: string
          post_id: string
          platform: string
          content: string
          likes: number
          comments: number
          shares: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          platform: string
          content: string
          likes?: number
          comments?: number
          shares?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          platform?: string
          content?: string
          likes?: number
          comments?: number
          shares?: number
          created_at?: string
          updated_at?: string
        }
      };
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          content: string
          original_content: string
          platforms: string[]
          status: 'draft' | 'scheduled' | 'published'
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          content: string
          original_content: string
          platforms?: string[]
          status?: 'draft' | 'scheduled' | 'published'
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          content?: string
          original_content?: string
          platforms?: string[]
          status?: 'draft' | 'scheduled' | 'published'
          metadata?: Json
        }
      };
      scheduled_posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          post_id: string | null
          user_id: string
          platform: string
          content: string
          scheduled_for: string
          published_at: string | null
          status: 'pending' | 'processing' | 'published' | 'failed'
          error_message: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          post_id?: string | null
          user_id: string
          platform: string
          content: string
          scheduled_for: string
          published_at?: string | null
          status?: 'pending' | 'processing' | 'published' | 'failed'
          error_message?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          post_id?: string | null
          user_id?: string
          platform?: string
          content?: string
          scheduled_for?: string
          published_at?: string | null
          status?: 'pending' | 'processing' | 'published' | 'failed'
          error_message?: string | null
          image_url?: string | null
        }
      };
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'basic' | 'pro'
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'basic' | 'pro'
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'basic' | 'pro'
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      };
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          content_repurposes: number
          scheduled_posts: number
          tweets: number
          facebook_posts: number
          reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_repurposes?: number
          scheduled_posts?: number
          tweets?: number
          facebook_posts?: number
          reset_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_repurposes?: number
          scheduled_posts?: number
          tweets?: number
          facebook_posts?: number
          reset_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

