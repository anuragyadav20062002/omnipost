import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import crypto from "crypto"

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  const headersList = await headers()
  const whopSignature = headersList.get("whop-signature")

  if (!whopSignature) {
    console.error("No Whop signature found")
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Get the raw body
    const rawBody = await request.text()

    // Verify Whop webhook signature
    const hmac = crypto.createHmac("sha256", process.env.WHOP_CLIENT_SECRET!)
    hmac.update(rawBody)
    const computedSignature = hmac.digest("hex")

    if (computedSignature !== whopSignature) {
      console.error("Invalid Whop signature")
      return new NextResponse("Invalid signature", { status: 401 })
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody)

    // Handle different webhook events
    switch (payload.event) {
      case "membership.went_valid":
      case "membership.created":
      case "membership.renewed": {
        // Update user's subscription status to true
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            has_active_subscription: true,
            updated_at: new Date().toISOString(),
          })
          .eq("whop_id", payload.data.user.id)

        if (updateError) {
          console.error("Error updating user subscription:", updateError)
          return new NextResponse("Error updating subscription", { status: 500 })
        }
        break
      }
      case "membership.expired":
      case "membership.cancelled":
      case "membership.went_invalid": {
        // Update user's subscription status to false
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            has_active_subscription: false,
            updated_at: new Date().toISOString(),
          })
          .eq("whop_id", payload.data.user.id)

        if (updateError) {
          console.error("Error updating user subscription:", updateError)
          return new NextResponse("Error updating subscription", { status: 500 })
        }
        break
      }
      default:
        console.log("Unhandled webhook event:", payload.event)
    }

    return new NextResponse("Webhook processed", { status: 200 })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

// Also handle GET requests for initial setup verification
export async function GET(request: Request) {
  return new NextResponse("Webhook endpoint is working", { status: 200 })
}

