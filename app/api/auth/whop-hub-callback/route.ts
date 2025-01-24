import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error fetching user:", userError)
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Update user data in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({
        has_active_subscription: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating user data:", updateError)
      return NextResponse.redirect(new URL("/auth/error?error=update_failed", request.url))
    }

    console.log("User subscription status updated successfully")

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error in Whop hub callback:", error)
    return NextResponse.redirect(new URL("/auth/error?error=whop_hub_callback_failed", request.url))
  }
}

