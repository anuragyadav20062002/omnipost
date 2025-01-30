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
    const origin = process.env.NODE_ENV === "production" ? "https://omnipost.vercel.app" : "http://localhost:3000"

    try {
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

      // Update profiles table
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

      // Check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, has_active_subscription")
        .eq("id", data.user.id)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
        return NextResponse.redirect(
          new URL(`/auth/error?error=user_fetch_failed&details=${encodeURIComponent(userError.message)}`, origin),
        )
      }

      if (!userData) {
        // User doesn't exist in users table, create a new entry
        const { error: createUserError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (createUserError) {
          console.error("Error creating user:", createUserError)
          return NextResponse.redirect(
            new URL(
              `/auth/error?error=user_creation_failed&details=${encodeURIComponent(createUserError.message)}`,
              origin,
            ),
          )
        }

        // Redirect to Whop connect page for new users
        return NextResponse.redirect(new URL("/auth/whop-connect", origin))
      }

      // User exists, check subscription status
      if (userData.has_active_subscription) {
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

