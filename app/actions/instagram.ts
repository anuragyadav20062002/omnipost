'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { checkRateLimit, updateRateLimit } from '@/lib/rate-limiter'
import { publishToInstagram, getInstagramAccessToken } from '@/lib/social-media/instagram'

export async function publishInstagramAction(content: string, imageUrl: string) {
  const supabase = createServerActionClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!imageUrl) {
    throw new Error('Image is required for Instagram posts')
  }

  if (!(await checkRateLimit(user.id, 'instagram'))) {
    throw new Error('Rate limit exceeded for Instagram. Please try again later.')
  }

  try {
    const { accessToken, accountId } = await getInstagramAccessToken(user.id)
    const result = await publishToInstagram(imageUrl, content, accessToken, accountId)

    // Update rate limit info
    const remaining = 25 // Instagram API limit placeholder
    const reset = Date.now() + 3600000 // 1 hour from now
    await updateRateLimit(user.id, 'instagram', { remaining, reset })

    return result
  } catch (error) {
    console.error('Error publishing to Instagram:', error)
    throw new Error('Failed to publish to Instagram')
  }
}

