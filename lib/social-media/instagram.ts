import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { SocialMediaToken } from '@/types/social-media'

export async function getInstagramAccessToken(userId: string): Promise<{ accessToken: string; accountId: string }> {
  const supabase = createClientComponentClient<Database>()
  const { data: profile } = await supabase
    .from('profiles')
    .select('social_accounts')
    .eq('id', userId)
    .single()

  if (!profile?.social_accounts?.instagram) {
    throw new Error('Instagram account not connected')
  }

  const instagramAccount = profile.social_accounts.instagram as SocialMediaToken & { instagram_account_id: string }

  if (Date.now() > instagramAccount.expires_at) {
    throw new Error('Instagram token expired. Please reconnect your account.')
  }

  return {
    accessToken: instagramAccount.access_token,
    accountId: instagramAccount.instagram_account_id
  }
}

export async function publishToInstagram(
  imageUrl: string,
  caption: string,
  accessToken: string,
  instagramAccountId: string
): Promise<{ id: string }> {
  try {
    // First, create a container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v17.0/${instagramAccountId}/media`,
      {
        method: 'POST',
        body: new URLSearchParams({
          image_url: imageUrl,
          caption,
          access_token: accessToken
        })
      }
    )

    if (!containerResponse.ok) {
      const error = await containerResponse.json()
      throw new Error(error.error.message)
    }

    const containerData = await containerResponse.json()

    // Then publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v17.0/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        body: new URLSearchParams({
          creation_id: containerData.id,
          access_token: accessToken
        })
      }
    )

    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      throw new Error(error.error.message)
    }

    const publishData = await publishResponse.json()
    return { id: publishData.id }
  } catch (error) {
    console.error('Error publishing to Instagram:', error)
    throw error
  }
}

