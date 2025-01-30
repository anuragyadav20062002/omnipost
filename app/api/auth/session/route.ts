import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          session: null,
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      authenticated: true,
      session,
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json(
      {
        error: "Failed to get session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

