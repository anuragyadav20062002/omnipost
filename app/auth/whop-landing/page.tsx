'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function WhopLanding() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleWhopLanding = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // User is already authenticated, redirect to dashboard
        router.push('/dashboard')
      } else {
        // User is not authenticated, initiate Google sign-in
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        })
      }
    }

    handleWhopLanding()
  }, [router, supabase])

  return <div>Redirecting...</div>
}

