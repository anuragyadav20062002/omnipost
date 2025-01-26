import { createClient } from "@/lib/supabase"


type SubscriptionPlan = "basic" | "pro"

export type UsageType = "content_repurposes" | "scheduled_posts" | "tweets" | "facebook_posts"

export type UsageTracking = {
  [key in UsageType]: number
} & {
  id: number
  user_id: string
  reset_date: string
}

type PlanLimits = {
  [key in SubscriptionPlan]: {
    [key in UsageType]: number
  }
}

const PLAN_LIMITS: PlanLimits = {
  basic: {
    content_repurposes: 90,
    scheduled_posts: 45,
    tweets: 5,
    facebook_posts: 20,
  },
  pro: {
    content_repurposes: 180,
    scheduled_posts: 90,
    tweets: 15,
    facebook_posts: 40,
  },
}

export async function incrementUsage(userId: string, type: UsageType): Promise<boolean> {
  const supabase = createClient()

  try {
    // Get the user's current plan type
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return false
    }

    if (!profile) {
      console.error("No profile found for user:", userId)
      return false
    }

    const planType = (profile.plan_type || "basic") as SubscriptionPlan

    // Get the current usage
    const { data: usage, error: usageError } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (usageError) {
      console.error("Error fetching usage:", usageError)
      return false
    }

    if (!usage) {
      // Create a new usage record if it doesn't exist
      const { error: insertError } = await supabase.from("usage_tracking").insert({
        user_id: userId,
        [type]: 1,
        reset_date: getNextResetDate(),
      })

      if (insertError) {
        console.error("Error creating new usage record:", insertError)
        return false
      }
    } else {
      // Check if we need to reset the usage
      if (new Date() >= new Date(usage.reset_date)) {
        const { error: resetError } = await supabase
          .from("usage_tracking")
          .update({
            content_repurposes: 0,
            scheduled_posts: 0,
            tweets: 0,
            facebook_posts: 0,
            reset_date: getNextResetDate(),
          })
          .eq("id", usage.id)

        if (resetError) {
          console.error("Error resetting usage:", resetError)
          return false
        }

        usage.content_repurposes = 0
        usage.scheduled_posts = 0
        usage.tweets = 0
        usage.facebook_posts = 0
      }

      // Check if the user has reached their limit
      if (usage[type] >= PLAN_LIMITS[planType][type]) {
        console.log(`User ${userId} has reached their ${type} limit for the ${planType} plan`)
        return false
      }

      // Increment the usage
      const { error: updateError } = await supabase
        .from("usage_tracking")
        .update({ [type]: usage[type] + 1 })
        .eq("id", usage.id)

      if (updateError) {
        console.error("Error updating usage:", updateError)
        if (updateError.message.includes("Could not find")) {
          console.error("Column not found in the database. Please check your database schema.")
        }
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error incrementing usage:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return false
  }
}

function getNextResetDate(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
}

export async function getUserUsage(userId: string): Promise<UsageTracking | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("usage_tracking").select("*").eq("user_id", userId).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching user usage:", error)
    return null
  }
}

export async function getUserPlanLimits(userId: string): Promise<{ [key in UsageType]: number } | null> {
  const supabase = createClient()

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", userId)
      .single()

    if (profileError) throw profileError

    if (!profile) {
      console.error("No profile found for user:", userId)
      return null
    }

    const planType = (profile.plan_type || "basic") as SubscriptionPlan
    return PLAN_LIMITS[planType]
  } catch (error) {
    console.error("Error fetching user plan limits:", error)
    return null
  }
}

