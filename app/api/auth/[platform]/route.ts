import { NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/social-media/oauth"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const platform = request.nextUrl.pathname.split("/")[3] // Get platform from URL

  try {
    const { url, state, codeVerifier } = await getAuthUrl(platform)

    // Set cookies for state verification
    const response = NextResponse.redirect(url)
    response.cookies.set(`${platform}_state`, state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
    })

    if (codeVerifier) {
      response.cookies.set(`${platform}_code_verifier`, codeVerifier, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
      })
    }

    return response
  } catch (error) {
    console.error(`Error initiating ${platform} auth:`, error)
    return NextResponse.redirect(
      new URL(`/dashboard/settings/social-accounts?error=${encodeURIComponent((error as Error).message)}`, request.url),
    )
  }
}

