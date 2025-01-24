import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'
import type { Database } from '@/types/database'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    console.error('No code provided in Whop callback')
    return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.whop.com/v5/oauth/token', {
      code,
      client_id: process.env.NEXT_PUBLIC_WHOP_CLIENT_ID,
      client_secret: process.env.WHOP_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/whop/callback`
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    const { access_token } = tokenResponse.data

    // Fetch user data from Whop
    const userResponse = await axios.get('https://api.whop.com/v5/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    })

    const whopUser = userResponse.data

    // Create or update user in Supabase
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check if user exists by whop_id
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('whop_id', whopUser.id)
      .single()

    if (!existingUser) {
      // Generate a secure random password for the new user
      const randomPassword = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 32)

      // Create new user in Supabase Auth
      const { data: authData, error: createError } = await supabase.auth.signUp({
        email: whopUser.email,
        password: randomPassword,
        options: {
          data: {
            full_name: whopUser.username,
            avatar_url: whopUser.profile_pic_url,
            whop_id: whopUser.id
          }
        }
      })

      if (createError) throw createError

      if (authData.user) {
        // Create profile
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email: whopUser.email,
          full_name: whopUser.username,
          avatar_url: whopUser.profile_pic_url,
          whop_id: whopUser.id,
          plan_type: 'basic' // Default to basic plan
        })
      }
    } else {
      // Update existing user's profile
      await supabase
        .from('profiles')
        .update({
          email: whopUser.email,
          full_name: whopUser.username,
          avatar_url: whopUser.profile_pic_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
    }

    // Fetch Whop membership data
    const membershipResponse = await axios.get('https://api.whop.com/v5/me/memberships', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    })

    const memberships = membershipResponse.data.data

    // Update user's plan based on membership
    if (memberships && memberships.length > 0) {
      const activeMembership = memberships.find((m: any) => m.status === 'active')
      if (activeMembership) {
        await supabase
          .from('profiles')
          .update({
            plan_type: activeMembership.product.metadata.plan_type || 'basic'
          })
          .eq('whop_id', whopUser.id)
      }
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } catch (error) {
    console.error('Whop authentication error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=whop_auth_failed', requestUrl.origin))
  }
}

