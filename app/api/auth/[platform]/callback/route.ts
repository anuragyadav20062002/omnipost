import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { handleCallback } from "@/lib/social-media/oauth"
import type { Database } from "@/types/database"

interface FacebookPage {
  id: string
  instagram_account?: {
    id: string
    username: string
  } | null
  access_token: string
}

export async function GET(req: NextRequest, { params }: { params: { platform: string } }): Promise<NextResponse> {
  const platform = params.platform.toLowerCase()

  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error || !code) {
      console.error(`${platform} auth error:`, error)
      return NextResponse.redirect(
        new URL(
          `/dashboard/settings/social-accounts?error=${encodeURIComponent(error || "No code provided")}`,
          req.url,
        ),
      )
    }

    const cookieStore = await cookies()
    const storedState = cookieStore.get(`${platform}_state`)?.value
    const codeVerifier = cookieStore.get(`${platform}_code_verifier`)?.value

    if (!storedState || state !== storedState) {
      console.error("Invalid state")
      return NextResponse.redirect(new URL("/dashboard/settings/social-accounts?error=Invalid state", req.url))
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error(userError?.message || "User not authenticated")
    }

    console.log("Attempting to get token data for platform:", platform)
    const tokenData = await handleCallback(platform, code, user.id, codeVerifier)
    console.log("Token data received:", JSON.stringify(tokenData, null, 2))

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("social_accounts")
      .eq("id", user.id)
      .single()

    if (profileError) {
      throw profileError
    }

    const currentAccounts = profile?.social_accounts || {}

    if (platform === "facebook") {
      currentAccounts.facebook = {
        access_token: tokenData.access_token,
        expires_at: tokenData.expires_at,
        user_id: tokenData.user_id,
        name: tokenData.name,
        pages: tokenData.pages,
      }

      if (tokenData.pages && tokenData.pages.length > 0) {
        currentAccounts.instagram = tokenData.pages
          .filter((page: FacebookPage) => page.instagram_account)
          .map((page: FacebookPage) => ({
            page_id: page.id,
            instagram_account_id: page.instagram_account?.id,
            instagram_username: page.instagram_account?.username,
            access_token: page.access_token,
          }))
      }
    } else {
      currentAccounts[platform] = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        user_id: tokenData.user_id,
      }
    }

    console.log("Updating profile with accounts:", JSON.stringify(currentAccounts, null, 2))

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        social_accounts: currentAccounts,
      })
      .eq("id", user.id)

    if (updateError) {
      throw updateError
    }

    console.log("Profile updated successfully")

    const response = NextResponse.redirect(new URL("/dashboard/settings/social-accounts?success=true", req.url))

    response.cookies.set(`${platform}_state`, "", { maxAge: 0 })
    response.cookies.set(`${platform}_code_verifier`, "", { maxAge: 0 })

    return response
  } catch (error) {
    console.error("Error in callback:", error)
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/social-accounts?error=${encodeURIComponent((error as Error).message || "Unknown error occurred")}`,
        req.url,
      ),
    )
  }
}

