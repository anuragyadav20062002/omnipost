import { NextResponse } from "next/server"

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "development") {
    console.log("NextAuth.js logging:", await req.json())
  }
  return NextResponse.json({ success: true })
}

