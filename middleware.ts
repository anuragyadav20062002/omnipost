import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const origin = process.env.NODE_ENV === "production" ? "https://omnipost.vercel.app" : "http://localhost:3000"

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there's no session and the user is trying to access a protected route
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/api/auth/session"))
  ) {
    const redirectUrl = new URL("/auth/signin", origin)
    redirectUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/auth/session"],
}

