import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Fetch the list of enabled auth providers from Supabase
  const { data, error } = await supabase.auth.getSession()
  console.log(data)

  if (error) {
    console.error("Error fetching auth providers:", error)
    return NextResponse.json({ error: "Failed to fetch auth providers" }, { status: 500 })
  }

  // For Supabase, we'll return a simplified list of providers
  // You may need to adjust this based on your Supabase configuration
  const providers = [
    { id: "google", name: "Google" },
    // Add other providers here if you've configured them in Supabase
    // { id: "github", name: "GitHub" },
    // { id: "facebook", name: "Facebook" },
  ]

  return NextResponse.json(providers)
}

