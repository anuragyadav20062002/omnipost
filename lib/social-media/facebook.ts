import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

type SocialMediaToken = {
  access_token: string
}

export async function getFacebookAccessToken(userId: string): Promise<{ accessToken: string; pageId: string }> {
  const supabase = createClientComponentClient<Database>()
  const { data: profile } = await supabase
    .from('profiles')
    .select('social_accounts')
    .eq('id', userId)
    .single()

  if (!profile?.social_accounts?.facebook) {
    throw new Error('Facebook account not connected')
  }

  const facebookAccount = profile.social_accounts.facebook as SocialMediaToken & { pages: Array<{ id: string, access_token: string }> }

  if (!facebookAccount.pages || facebookAccount.pages.length === 0) {
    throw new Error('No Facebook pages found. Please reconnect your Facebook account.')
  }

  // Use the first page's access token and ID
  const page = facebookAccount.pages[0]

  return {
    accessToken: page.access_token,
    pageId: page.id
  }
}

export async function publishToFacebook(
  content: string,
  accessToken: string,
  pageId: string,
  imageUrl?: string
): Promise<{ id: string }> {
  try {
    const endpoint = `https://graph.facebook.com/v17.0/${pageId}/${imageUrl ? 'photos' : 'feed'}`
    const params = new URLSearchParams({
      message: content,
      access_token: accessToken,
      ...(imageUrl && { url: imageUrl })
    })

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error.message)
    }

    const data = await response.json()
    return { id: data.id }
  } catch (error) {
    console.error('Error publishing to Facebook:', error)
    throw error
  }
}

