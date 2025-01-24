'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { SocialMediaToken } from '@/types/social-media'
import { checkRateLimit, updateRateLimit } from '@/lib/rate-limiter'
import { publishToFacebook, getFacebookAccessToken } from '@/lib/social-media/facebook'

export async function publishFacebookAction(content: string, imageUrl?: string) {
  const supabase = createServerActionClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('social_accounts')
    .eq('id', user.id)
    .single()

  if (!profile?.social_accounts?.facebook) {
    throw new Error('Facebook account not connected')
  }

  const facebookAccount = profile.social_accounts.facebook as SocialMediaToken & { page_id: string }

  if (Date.now() > facebookAccount.expires_at) {
    throw new Error('Facebook token expired. Please reconnect your account.')
  }

  if (!(await checkRateLimit(user.id, 'facebook'))) {
    throw new Error('Rate limit exceeded for Facebook. Please try again later.')
  }

  try {
    const { accessToken, pageId } = await getFacebookAccessToken(user.id)
    const result = await publishToFacebook(content, accessToken, pageId, imageUrl)

    // Update rate limit info
    const remaining = 50 // Placeholder, should be from Facebook API response
    const reset = Date.now() + 3600000 // Placeholder, should be from Facebook API response
    await updateRateLimit(user.id, 'facebook', { remaining, reset })

    return result
  } catch (error) {
    console.error('Error publishing to Facebook:', error)
    throw new Error('Failed to publish to Facebook')
  }
}

