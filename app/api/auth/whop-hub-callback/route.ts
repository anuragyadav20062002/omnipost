import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Hardcode the production URL
const PRODUCTION_URL = "https://omnipost.vercel.app"

export async function GET(request: Request) {
  // Set the checkout completion cookie
  const cookieStore = cookies()
  ;(await cookieStore).set("whop_checkout_completed", "true", {
    path: "/",
    secure: true,
    sameSite: "lax",
    maxAge: 3600, // 1 hour expiry
  })

  // Redirect to sign in page
  return NextResponse.redirect(`${PRODUCTION_URL}/auth/signin`)
}

