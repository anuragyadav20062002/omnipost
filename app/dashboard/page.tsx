import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"
import DashboardClient from "./DashboardClient"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch user data
  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (userError || !userData) {
    console.error("Error fetching user data:", userError)
    redirect("/auth/error?error=user_data_fetch_failed")
  }

  // Check if the user has an active subscription
  if (!userData.has_active_subscription) {
    redirect("/checkout")
  }

  // Get user profile with proper error handling
  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Profile error:", profileError)
    redirect("/auth/error?error=profile_fetch_failed")
  }

  // If no Whop ID, redirect to connect
  if (!userData.whop_id) {
    redirect("/auth/whop-connect")
  }

  // Fetch usage statistics
  const { data: usage } = await supabase.from("usage_tracking").select("*").eq("user_id", user.id).single()

  const planType = userProfile?.plan_type || "basic"
  const planLimits =
    planType === "pro" || planType === "admin"
      ? { repurposes: 180, scheduled: 90, tweets: 15, facebook_posts: 40 }
      : { repurposes: 90, scheduled: 45, tweets: 5, facebook_posts: 20 }

  // Fetch current period stats
  const currentPeriodStart = new Date()
  currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1)

  const previousPeriodStart = new Date(currentPeriodStart)
  previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)

  // Fetch current period posts
  const { data: currentPosts } = await supabase
    .from("posts")
    .select("id, status, created_at, platforms")
    .eq("user_id", userProfile.id)
    .gte("created_at", currentPeriodStart.toISOString())

  // Fetch current period published posts from scheduled_posts table
  const { data: currentPublishedPosts } = await supabase
    .from("scheduled_posts")
    .select("id, status, published_at, platform")
    .eq("user_id", userProfile.id)
    .eq("status", "published")
    .gte("published_at", currentPeriodStart.toISOString())

  // Fetch previous period posts
  const { data: previousPosts } = await supabase
    .from("posts")
    .select("id, status, created_at, platforms")
    .eq("user_id", userProfile.id)
    .gte("created_at", previousPeriodStart.toISOString())
    .lt("created_at", currentPeriodStart.toISOString())

  // Fetch previous period published posts from scheduled_posts table
  const { data: previousPublishedPosts } = await supabase
    .from("scheduled_posts")
    .select("id, status, published_at, platform")
    .eq("user_id", userProfile.id)
    .eq("status", "published")
    .gte("published_at", previousPeriodStart.toISOString())
    .lt("published_at", currentPeriodStart.toISOString())

  // Calculate stats and changes
  const currentTotalPosts = currentPosts?.length || 0
  const currentScheduledPosts = currentPosts?.filter((post) => post.status === "scheduled").length || 0
  const currentPublishedPostsCount = currentPublishedPosts?.length || 0

  const previousTotalPosts = previousPosts?.length || 0
  const previousScheduledPosts = previousPosts?.filter((post) => post.status === "scheduled").length || 0
  const previousPublishedPostsCount = previousPublishedPosts?.length || 0

  // Calculate tweet and Facebook post counts
  const currentTweets = currentPublishedPosts?.filter((post) => post.platform === "twitter").length || 0
  const currentFacebookPosts = currentPublishedPosts?.filter((post) => post.platform === "facebook").length || 0

  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%"
    const change = ((current - previous) / previous) * 100
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
  }

  const statCards = [
    {
      title: "Total Posts",
      value: currentTotalPosts.toString(),
      change: calculatePercentageChange(currentTotalPosts, previousTotalPosts),
      icon: "BarChart",
      color: "text-blue-500",
    },
    {
      title: "Scheduled Posts",
      value: currentScheduledPosts.toString(),
      change: calculatePercentageChange(currentScheduledPosts, previousScheduledPosts),
      icon: "Clock",
      color: "text-yellow-500",
    },
    {
      title: "Published Posts",
      value: currentPublishedPostsCount.toString(),
      change: calculatePercentageChange(currentPublishedPostsCount, previousPublishedPostsCount),
      icon: "TrendingUp",
      color: "text-green-500",
    },
  ]

  // Fetch recent and upcoming posts
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userProfile.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: upcomingPosts } = await supabase
    .from("scheduled_posts")
    .select("*, posts(title)")
    .eq("user_id", userProfile.id)
    .gte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(5)


  return (
    <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <DashboardClient
        user={userData}
        profile={userProfile}
        usage={{
          ...usage,
          tweets: currentTweets,
          facebook_posts: currentFacebookPosts,
        }}
        planType={planType}
        planLimits={planLimits}
        statCards={statCards}
        recentPosts={recentPosts || []}
        upcomingPosts={upcomingPosts || []}
        socialAccounts={userProfile?.social_accounts || {}}
      />
    </main>
  )
}

