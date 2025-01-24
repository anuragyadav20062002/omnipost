import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

interface RateLimitInfo {
  remaining: number
  reset: number
}

const RATE_LIMIT_BUFFER = 5 // Buffer to avoid hitting the exact limit

export async function checkRateLimit(userId: string, platform: string): Promise<boolean> {
  const supabase = createClientComponentClient<Database>()
  
  const { data, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single()

  if (error) {
    console.error('Error checking rate limit:', error)
    return false
  }

  if (!data) {
    // If no rate limit info exists, assume it's safe to proceed
    return true
  }

  const now = Date.now()
  if (now >= data.reset) {
    // Rate limit has reset, update the record
    await supabase
      .from('rate_limits')
      .update({ remaining: data.max - 1, reset: now + data.window })
      .eq('user_id', userId)
      .eq('platform', platform)
    return true
  }

  if (data.remaining > RATE_LIMIT_BUFFER) {
    // Decrement the remaining count
    await supabase
      .from('rate_limits')
      .update({ remaining: data.remaining - 1 })
      .eq('user_id', userId)
      .eq('platform', platform)
    return true
  }

  return false
}

export async function updateRateLimit(userId: string, platform: string, info: RateLimitInfo): Promise<void> {
  const supabase = createClientComponentClient<Database>()
  
  const { error } = await supabase
    .from('rate_limits')
    .upsert({
      user_id: userId,
      platform,
      remaining: info.remaining,
      reset: info.reset,
      max: info.remaining, // Assume the initial remaining is the max
      window: info.reset - Date.now() // Calculate the window
    })

  if (error) {
    console.error('Error updating rate limit:', error)
  }
}

