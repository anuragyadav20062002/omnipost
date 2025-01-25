import { type NextRequest, NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/social-media/oauth"

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const platform = params.platform
  console.log("Auth route entered for platform:", platform)

  if (!["twitter", "facebook", "instagram"].includes(platform)) {
    console.error("Unsupported platform:", platform)
    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
  }

  try {
    const { url, state, codeVerifier } = await getAuthUrl(platform)

    const response = NextResponse.json({ url })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    }

    response.cookies.set(`${platform}_state`, state, cookieOptions)

    if (codeVerifier) {
      response.cookies.set(`${platform}_code_verifier`, codeVerifier, cookieOptions)
    }

    console.log(`Generated ${platform} auth URL:`, url)
    return response
  } catch (error) {
    console.error("Error generating auth URL:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}

