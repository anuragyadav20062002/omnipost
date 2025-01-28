import { getSession } from "../actions/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"
import { redirect } from "next/navigation"

export async function DashboardData() {
  const session = await getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return { session, profile }
}

