import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    })
    
    try {
      const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError || !data.user) {
        console.error('Authentication error:', authError)
        return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin))
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Error updating profile:', profileError)
        return NextResponse.redirect(new URL('/auth/error?error=profile_update_failed', requestUrl.origin))
      }

      // Redirect to Whop connect page
      return NextResponse.redirect(new URL('/auth/whop-connect', requestUrl.origin))
      
    } catch (error) {
      console.error('Error in callback:', error)
      return NextResponse.redirect(new URL('/auth/error?error=callback_error', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

