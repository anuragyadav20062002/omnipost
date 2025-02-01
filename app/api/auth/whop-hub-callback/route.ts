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

export async function GET(request: Request) {
  try {
    // Get the current user's session
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (userId) {
      // Update user's subscription status to true
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          has_active_subscription: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating subscription status:", updateError)
      }
    }

    // Always redirect to dashboard, regardless of any parameters or validation
    return NextResponse.redirect(`${PRODUCTION_URL}/dashboard`)
  } catch (error) {
    console.error("Error in whop-hub-callback:", error)
    // Even if there's an error, redirect to dashboard
    return NextResponse.redirect(`${PRODUCTION_URL}/dashboard`)
  }
}

