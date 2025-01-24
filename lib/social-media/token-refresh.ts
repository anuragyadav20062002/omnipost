import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { SocialMediaToken } from '@/types/social-media'

async function refreshTwitterToken(refreshToken: string): Promise<SocialMediaToken> {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Twitter token')
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    platform: 'twitter' as const,
  }
}

async function refreshFacebookToken(accessToken: string): Promise<SocialMediaToken> {
  const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${accessToken}`)

  if (!response.ok) {
    throw new Error('Failed to refresh Facebook token')
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    platform: 'facebook' as const,
  }
}

// Instagram uses the same token as Facebook
const refreshInstagramToken = refreshFacebookToken

export async function refreshToken(userId: string, platform: 'twitter' | 'facebook' | 'instagram'): Promise<void> {
  const supabase = createClientComponentClient<Database>()
  const { data: profile } = await supabase
    .from('profiles')
    .select('social_accounts')
    .eq('id', userId)
    .single()

  if (!profile?.social_accounts?.[platform]) {
    throw new Error(`${platform} account not connected`)
  }

  const account = profile.social_accounts[platform] as SocialMediaToken

  let newToken: SocialMediaToken

  switch (platform) {
    case 'twitter':
      if (!account.refresh_token) {
        throw new Error('No refresh token available for Twitter')
      }
      newToken = await refreshTwitterToken(account.refresh_token)
      break
    case 'facebook':
      newToken = await refreshFacebookToken(account.access_token)
      break
    case 'instagram':
      newToken = await refreshInstagramToken(account.access_token)
      break
  }

  // Update the token in the database
  await supabase
    .from('profiles')
    .update({
      social_accounts: {
        ...profile.social_accounts,
        [platform]: newToken,
      },
    })
    .eq('id', userId)
}

