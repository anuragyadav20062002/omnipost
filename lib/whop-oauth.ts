"use client"

export function getWhopAuthUrl() {
  if (!process.env.NEXT_PUBLIC_WHOP_CLIENT_ID) {
    console.error("Missing NEXT_PUBLIC_WHOP_CLIENT_ID environment variable")
    throw new Error("Configuration error: Missing Whop client ID")
  }

  // Update to use production URL
  const redirectUri = `https://omnipost.vercel.app/api/auth/whop-callback`

  return `https://whop.com/oauth?client_id=${process.env.NEXT_PUBLIC_WHOP_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`
}

