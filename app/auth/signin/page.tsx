'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'

export default function SignIn() {
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold gradient-text">Sign in to OmniPost</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your Google account to get started
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          {error && (
            <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

