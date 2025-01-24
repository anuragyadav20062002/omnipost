'use client'

export function getWhopAuthUrl() {
  if (!process.env.NEXT_PUBLIC_WHOP_CLIENT_ID) {
    console.error('Missing NEXT_PUBLIC_WHOP_CLIENT_ID environment variable')
    throw new Error('Configuration error: Missing Whop client ID')
  }

  // Get the current origin for the redirect URI
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL
  
  // Use the same protocol as the current page
  const redirectUri = `${origin}/api/auth/whop-callback`

  // Simplified URL with only client_id and redirect_uri
  return `https://whop.com/oauth?client_id=${process.env.NEXT_PUBLIC_WHOP_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`
}

