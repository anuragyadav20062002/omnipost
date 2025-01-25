'use server'

import { TwitterApi } from 'twitter-api-v2'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { SocialMediaToken } from '@/types/social-media'
import { checkRateLimit, updateRateLimit } from '@/lib/rate-limiter'


export async function publishTweetAction(content: string, imageUrl?: string) {
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

  if (!profile?.social_accounts?.twitter) {
    throw new Error('Twitter account not connected')
  }

  const twitterAccount = profile.social_accounts.twitter as SocialMediaToken

  if (Date.now() > twitterAccount.expires_at) {
    throw new Error('Twitter token expired. Please reconnect your account.')
  }

  if (!(await checkRateLimit(user.id, 'twitter'))) {
    throw new Error('Rate limit exceeded for Twitter. Please try again later.')
  }

  try {
    const client = new TwitterApi(twitterAccount.access_token)
    const mediaIds: string[] = []

    if (imageUrl) {
      const response = await fetch(imageUrl)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const mediaResponse = await client.v1.uploadMedia(buffer, {
        mimeType: response.headers.get('content-type') || undefined
      }) as string

      mediaIds.push(mediaResponse)
    }

    const tweet = await client.v2.tweet({
      text: content,
      ...(mediaIds.length > 0 && { 
        media: { 
          media_ids: mediaIds as [string] | [string, string] | [string, string, string] | [string, string, string, string]
        } 
      })
    })

    // Update rate limit info
    const remaining = 50 // Placeholder, should be from Twitter API response
    const reset = Date.now() + 900000 // Placeholder, should be from Twitter API response
    await updateRateLimit(user.id, 'twitter', { remaining, reset })

    return { id: tweet.data.id }
  } catch (error) {
    console.error('Error publishing tweet:', error)
    throw new Error('Failed to publish to Twitter')
  }
}

