import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Define an interface for the session structure
interface Session {
  access_token: string;
  // Add other properties as needed
}

export async function checkAndPublishDuePosts(serverSession?: Session) {
  console.log('Checking and publishing due posts...')
  console.log('Current time:', new Date().toISOString())
  try {
    console.log('Triggering publishing worker...')
    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL
    const url = `${origin}/api/publish/worker`
    
    let session
    if (serverSession) {
      session = serverSession
    } else {
      const supabase = createClientComponentClient()
      const { data } = await supabase.auth.getSession()
      session = data.session
    }

    if (!session) {
      throw new Error('No active session')
    }

    console.log('Checking for due posts...')
    console.log('Current time:', new Date().toISOString())
    console.log('Session:', session ? 'Valid' : 'Invalid')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
    })

    console.log('Worker response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to trigger publishing worker: ${response.status} ${response.statusText}`)
      console.error('Error details:', errorText)
      throw new Error(`Failed to trigger publishing worker: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Worker response:', result)
    console.log('Publishing worker result:', result)

    return result
  } catch (error) {
    console.error('Error triggering publishing worker:', error)
    throw error
  }
}

