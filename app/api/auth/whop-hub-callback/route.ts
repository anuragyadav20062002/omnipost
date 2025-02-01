import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Hardcode the production URL
const PRODUCTION_URL = "https://omnipost.vercel.app"

// Remove the POST handler as we're no longer using webhooks

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")

  // If this is a checkout callback
  if (secret) {
    try {
      // Verify the checkout was successful
      const response = await fetch("https://api.whop.com/api/v2/checkout/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        },
        body: JSON.stringify({
          checkout_id: secret,
        }),
      })

      if (!response.ok) {
        console.error("Failed to validate checkout:", await response.text())
        return NextResponse.redirect(`${PRODUCTION_URL}/auth/error?error=checkout_validation_failed`)
      }

      // Checkout was successful, update user's subscription status
      const checkoutData = await response.json()
      if (checkoutData.valid) {
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            has_active_subscription: true,
            updated_at: new Date().toISOString(),
          })
          .eq("whop_id", checkoutData.user.id)

        if (updateError) {
          console.error("Error updating user subscription:", updateError)
          return NextResponse.redirect(`${PRODUCTION_URL}/auth/error?error=subscription_update_failed`)
        }
      }

      // Redirect to dashboard after successful checkout
      return NextResponse.redirect(`${PRODUCTION_URL}/dashboard`)
    } catch (error) {
      console.error("Error processing checkout callback:", error)
      return NextResponse.redirect(`${PRODUCTION_URL}/auth/error?error=checkout_callback_failed`)
    }
  }

  // Default response for endpoint verification
  return new NextResponse("Checkout callback endpoint is working", { status: 200 })
}

