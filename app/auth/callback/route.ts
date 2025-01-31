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

      // First, ensure the users table exists and create it if it doesn't
      const { error: tableCheckError } = await supabase.rpc("ensure_tables_exist")

      if (tableCheckError) {
        console.error("Error checking/creating tables:", tableCheckError)
        return NextResponse.redirect(
          new URL(
            `/auth/error?error=database_setup_failed&details=${encodeURIComponent(tableCheckError.message)}`,
            origin,
          ),
        )
      }

      // Create or update user in users table
      const { error: userUpsertError } = await supabase.from("users").upsert(
        {
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          has_active_subscription: false,
        },
        {
          onConflict: "id",
        },
      )

      if (userUpsertError) {
        console.error("Error upserting user:", userUpsertError)
        return NextResponse.redirect(
          new URL(
            `/auth/error?error=user_creation_failed&details=${encodeURIComponent(userUpsertError.message)}`,
            origin,
          ),
        )
      }

      // Create or update profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (profileError) {
        console.error("Error updating profile:", profileError)
        return NextResponse.redirect(
          new URL(
            `/auth/error?error=profile_update_failed&details=${encodeURIComponent(profileError.message)}`,
            origin,
          ),
        )
      }

      // Now fetch the user data to check subscription status
      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("id, has_active_subscription")
        .eq("id", data.user.id)
        .maybeSingle()

      if (userFetchError) {
        console.error("Error fetching user data:", userFetchError)
        return NextResponse.redirect(
          new URL(`/auth/error?error=user_fetch_failed&details=${encodeURIComponent(userFetchError.message)}`, origin),
        )
      }

      // Redirect based on subscription status
      if (userData?.has_active_subscription) {
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

