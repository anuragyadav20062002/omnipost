import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/types/database"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    const origin = "https://omnipost.vercel.app"

    // Check if user completed checkout
    const checkoutCompleted = (await cookieStore).get("whop_checkout_completed")?.value === "true"

    try {
      // Exchange code for session
      const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError || !data.user) {
        console.error("Authentication error:", authError)
        return NextResponse.redirect(
          new URL(
            `/auth/error?error=authentication_failed&details=${encodeURIComponent(authError?.message || "Unknown error")}`,
            origin,
          ),
        )
      }

      // Ensure the users table exists and create it if it doesn't
      await supabase.rpc("ensure_tables_exist")

      // Create or update user in users table with subscription status from checkout
      await supabase.from("users").upsert(
        {
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          has_active_subscription: checkoutCompleted,
        },
        { onConflict: "id" },
      )

      // Create or update profile
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      // Clear the checkout completion cookie if it exists
      if (checkoutCompleted) {
        (await cookieStore).delete("whop_checkout_completed")
      }

      // Redirect based on subscription status
      if (checkoutCompleted) {
        return NextResponse.redirect(new URL("/dashboard", origin))
      } else {
        return NextResponse.redirect(new URL("/auth/whop-connect", origin))
      }
    } catch (error) {
      console.error("Error in callback:", error)
      return NextResponse.redirect(
        new URL(`/auth/error?error=callback_error&details=${encodeURIComponent((error as Error).message)}`, origin),
      )
    }
  }

  return NextResponse.redirect(new URL("/", origin))
}

