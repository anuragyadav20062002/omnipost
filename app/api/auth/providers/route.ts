import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  return NextResponse.json(authOptions.providers)
}

