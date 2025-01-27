import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

interface ErrorLogEntry {
  user_id: string
  error_message: string
  stack_trace?: string
  context?: {
    platform?: string
    postId?: string
    action?: string
  }
  timestamp?: string
}

export async function logError(entry: ErrorLogEntry) {
  const supabase = createClientComponentClient<Database>()

  try {
    const { data, error } = await supabase
      .from('error_logs')
      .insert([entry])

    console.log(data)

    if (error) {
      console.error('Failed to log error:', error)
    }
  } catch (error) {
    console.error('Error in logError function:', error)
  }
}

export async function getRecentErrors(userId: string, limit: number = 10) {
  const supabase = createClientComponentClient<Database>()

  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch recent errors:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error in getRecentErrors function:', error)
    return []
  }
}

