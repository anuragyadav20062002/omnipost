import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Hardcode the production URL
const PRODUCTION_URL = "https://omnipost.vercel.app"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")

  // If this is a checkout callback
  if (secret) {
    // Store the checkout completion in cookies
    const cookieStore =await cookies()
    cookieStore.set("whop_checkout_completed", "true", {
      path: "/",
      secure: true,
      sameSite: "lax",
      maxAge: 3600, // 1 hour expiry
    })
  }

  try {
    // Check if user is authenticated
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // User is authenticated, update their subscription status
      const { error: updateError } = await supabase
        .from("users")
        .update({
          has_active_subscription: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Error updating subscription status:", updateError)
      }

      // Redirect to dashboard
      return NextResponse.redirect(`${PRODUCTION_URL}/dashboard`)
    } else {
      // User is not authenticated, redirect to sign in
      return NextResponse.redirect(`${PRODUCTION_URL}/auth/signin`)
    }
  } catch (error) {
    console.error("Error in whop-hub-callback:", error)
    return NextResponse.redirect(`${PRODUCTION_URL}/auth/signin`)
  }
}

