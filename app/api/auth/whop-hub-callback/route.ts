import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Hardcode the production URL
const PRODUCTION_URL = "https://omnipost.vercel.app"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")
  const checkoutId = searchParams.get("checkout_id")

  // If this is a checkout callback
  if (secret || checkoutId) {
    // Store the checkout completion in cookies
    const cookieStore = cookies()
    ;(await cookieStore).set("whop_checkout_completed", "true", {
      path: "/",
      secure: true,
      sameSite: "lax",
      maxAge: 3600, // 1 hour expiry
    })

    try {
      // Verify the checkout was successful
      const response = await fetch("https://api.whop.com/api/v2/checkout/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        },
        body: JSON.stringify({
          checkout_id: secret || checkoutId,
        }),
      })

      if (!response.ok) {
        console.error("Failed to validate checkout:", await response.text())
        return NextResponse.redirect(`${PRODUCTION_URL}/auth/error?error=checkout_validation_failed`)
      }

      const checkoutData = await response.json()
      if (!checkoutData.valid) {
        return NextResponse.redirect(`${PRODUCTION_URL}/auth/error?error=invalid_checkout`)
      }

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
      return NextResponse.redirect(`${PRODUCTION_URL}/auth/error?error=checkout_processing_failed`)
    }
  }

  // If no secret or checkout_id is provided, redirect to the homepage
  return NextResponse.redirect(PRODUCTION_URL)
}

