import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ScheduleClient } from "./ScheduleClient"
import { redirect } from "next/navigation"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

export default async function SchedulePage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  const { data: scheduledPosts, error } = await supabase
    .from("scheduled_posts")
    .select("*, posts(title)")
    .eq("user_id", session.user.id)
    .order("scheduled_for", { ascending: true })

  if (error) {
    console.error("Error fetching scheduled posts:", error)
  }

  return <ScheduleClient initialScheduledPosts={scheduledPosts || []} />
}

