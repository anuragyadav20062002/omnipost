import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?error=missing_code", request.url))
  }

  if (!process.env.NEXT_PUBLIC_WHOP_CLIENT_ID || !process.env.WHOP_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/auth/error?error=missing_env_vars", request.url))
  }

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/auth/whop-callback`

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    // Fetch Whop user data
    const userResponse = await fetch("https://api.whop.com/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Whop user data")
    }

    const userData = await userResponse.json()

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error("No authenticated user found")
    }

    // Update user data in Supabase
    const { error: updateError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        whop_id: userData.id,
        whop_username: userData.username,
        whop_access_token: tokenData.access_token,
        whop_refresh_token: tokenData.refresh_token,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (updateError) {
      console.error("Error updating user data:", updateError)
      throw updateError
    }

    // Fetch the updated user data
    const { data: updatedUser, error: fetchError } = await supabase
      .from("users")
      .select("has_active_subscription")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching updated user data:", fetchError)
      throw fetchError
    }

    // Redirect based on subscription status
    if (updatedUser?.has_active_subscription) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/checkout", request.url))
    }
  } catch (error) {
    console.error("Error in Whop callback:", error)
    return NextResponse.redirect(new URL("/auth/error?error=whop_callback_failed", request.url))
  }
}

