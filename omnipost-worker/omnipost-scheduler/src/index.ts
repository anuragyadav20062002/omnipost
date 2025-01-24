import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Twitter rate limit constants
const TWITTER_RATE_LIMIT = {
  tweets_per_15_min: 50,
  tweets_per_3_hours: 300,
}

// Add a delay between post processing
const POST_PROCESSING_DELAY = 5000 // 5 seconds

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  TWITTER_CLIENT_ID: string
  TWITTER_CLIENT_SECRET: string
  FACEBOOK_APP_ID: string
  FACEBOOK_APP_SECRET: string
}

interface Post {
  id: string
  created_at: string
  updated_at: string
  post_id: string | null
  user_id: string
  platform: "twitter" | "facebook" | "instagram"
  scheduled_for: string
  published_at: string | null
  status: "pending" | "published" | "failed"
  error_message: string | null
  recurring_schedule: string | null
  platform_post_id: string | null
  metadata: Record<string, any>
  content: string
  image_url: string | null
}

interface Profile {
  id: string
  social_accounts: {
    twitter?: {
      access_token: string
      refresh_token: string
      expires_at: number
    }
    facebook?: {
      access_token: string
      page_id: string
      page_access_token: string
      expires_at: number
      pages: { id: string; access_token: string; name: string }[]
    }
    instagram?: {
      access_token: string
      page_access_token: string
      page_id: string
      instagram_account_id: string
      expires_at: number
    }
  }
}

interface TwitterPostResponse {
  data: {
    id: string
    text: string
  }
}

interface FacebookPostResponse {
  id: string
  post_id?: string
}

interface InstagramPostResponse {
  id: string
  status?: string
}

interface ScheduledEvent {
  cron: string
  scheduledTime: number
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void
}

function createSupabaseClient(env: Env): SupabaseClient {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    db: { schema: "public" },
  })
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  if (url.pathname === "/debug") {
    return handleDebug(env)
  }

  if (url.pathname === "/process") {
    await processScheduledPosts(env)
    return new Response("Processing complete")
  }

  return new Response("OmniPost Scheduler Worker is running")
}

async function handleDebug(env: Env): Promise<Response> {
  console.log("=== DEBUG START ===")
  const supabase = createSupabaseClient(env)
  const now = new Date()

  console.log("Current time:", now.toISOString())

  const { data: posts, error } = await supabase.rpc("get_pending_posts")

  if (error) {
    console.error("Query failed:", error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!posts || posts.length === 0) {
    console.log("No posts found to process.")
    return new Response(JSON.stringify({ timestamp: now.toISOString(), results: { posts: [] } }, null, 2), {
      headers: { "Content-Type": "application/json" },
    })
  }

  console.log(`Found ${posts.length} posts to process`)

  const results = {
    postsProcessed: [] as string[],
    errors: [] as string[],
  }

  for (const post of posts) {
    try {
      console.log(`Processing post: ${post.id}`)
      await publishPost(post, env)
      results.postsProcessed.push(post.id)

      await supabase
        .from("scheduled_posts")
        .update({
          status: "published",
          published_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", post.id)

      console.log(`Updated post ${post.id} status to published`)
    } catch (error) {
      console.error(`Failed to process post ${post.id}:`, error)
      results.errors.push(`Post ${post.id}: ${error instanceof Error ? error.message : String(error)}`)

      await supabase
        .from("scheduled_posts")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
          updated_at: now.toISOString(),
        })
        .eq("id", post.id)

      console.log(`Updated post ${post.id} status to failed`)
    }

    // Add delay between processing posts
    await new Promise((resolve) => setTimeout(resolve, POST_PROCESSING_DELAY))
  }

  return new Response(JSON.stringify({ timestamp: now.toISOString(), results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  })
}

async function processScheduledPosts(env: Env) {
  console.log("=== PROCESS START ===")
  const supabase = createSupabaseClient(env)
  const now = new Date()

  console.log("Fetching pending and failed posts...")
  console.log("Supabase URL:", env.NEXT_PUBLIC_SUPABASE_URL)

  try {
    const { data: posts, error } = await supabase.rpc("get_pending_posts")

    if (error) {
      console.error("Query failed:", error)
      console.error("Error details:", JSON.stringify(error, null, 2))
      return
    }

    console.log("Raw response from get_pending_posts:", JSON.stringify(posts, null, 2))

    if (!posts || posts.length === 0) {
      console.log("No posts found to process.")
      return
    }

    console.log(`Found ${posts.length} posts to process`)
    const postsToProcess = posts.slice(0, 10) // Process up to 10 posts per run
    console.log(`Processing ${postsToProcess.length} posts`)

    for (const post of postsToProcess) {
      try {
        console.log(
          `Processing post: ${post.id}, platform: ${post.platform}, scheduled_for: ${post.scheduled_for}, current time: ${now.toISOString()}`,
        )
        await publishPost(post, env)

        await supabase
          .from("scheduled_posts")
          .update({
            status: "published",
            published_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", post.id)

        console.log(`Updated post ${post.id} status to published`)
      } catch (error) {
        console.error(`Failed to process post ${post.id}:`, error)

        await supabase
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : String(error),
            updated_at: now.toISOString(),
          })
          .eq("id", post.id)

        console.log(`Updated post ${post.id} status to failed`)
      }

      // Add delay between processing posts
      await new Promise((resolve) => setTimeout(resolve, POST_PROCESSING_DELAY))
    }

    console.log("Finished processing posts")
  } catch (error) {
    console.error("Unexpected error in processScheduledPosts:", error)
  }
}

async function publishPost(post: Post, env: Env) {
  console.log(`Publishing ${post.platform} post: ${post.id}`)

  const supabase = createSupabaseClient(env)

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("social_accounts")
    .eq("id", post.user_id)
    .single()

  if (profileError) {
    console.error(`Error fetching user profile: ${profileError.message}`)
    throw new Error(`Failed to fetch user profile: ${profileError.message}`)
  }

  if (!profile) {
    console.error(`User profile not found for user_id: ${post.user_id}`)
    throw new Error(`User profile not found`)
  }

  const socialAccounts = profile.social_accounts as Profile["social_accounts"]

  switch (post.platform) {
    case "twitter":
      return publishToTwitter(post, env, socialAccounts.twitter)
    case "facebook":
      return publishToFacebook(post, socialAccounts.facebook)
    case "instagram":
      return publishToInstagram(post, socialAccounts.instagram)
    default:
      throw new Error(`Unsupported platform: ${post.platform}`)
  }
}

async function publishToTwitter(
  post: Post,
  env: Env,
  twitterAuth?: Profile["social_accounts"]["twitter"],
): Promise<TwitterPostResponse> {
  console.log("Attempting to publish to Twitter...")

  if (!twitterAuth || !twitterAuth.access_token) {
    throw new Error("Twitter authentication not found for user. Please reconnect your Twitter account.")
  }

  if (Date.now() >= twitterAuth.expires_at) {
    console.log("Twitter token expired, refreshing...")
    try {
      const newAccessToken = await refreshTwitterToken(twitterAuth.refresh_token, env)
      twitterAuth.access_token = newAccessToken
      twitterAuth.expires_at = Date.now() + 7200 * 1000 // Set new expiration 2 hours from now
    } catch (error) {
      console.error("Failed to refresh Twitter token:", error)
      throw new Error("Failed to refresh Twitter token. Please reconnect your Twitter account.")
    }
  }

  const url = "https://api.twitter.com/2/tweets"
  const headers = {
    Authorization: `Bearer ${twitterAuth.access_token}`,
    "Content-Type": "application/json",
  }

  const tweetData: any = { text: post.content }

  if (post.image_url) {
    const mediaId = await uploadTwitterImage(post.image_url, twitterAuth.access_token)
    tweetData.media = { media_ids: [mediaId] }
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(tweetData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Twitter API error:", errorText)
    if (response.status === 429) {
      throw new Error("Twitter rate limit exceeded. Please try again later.")
    } else if (response.status === 403) {
      throw new Error("Twitter API permission denied. Please check your app permissions and user token scopes.")
    }
    throw new Error(`Twitter API error: ${errorText}`)
  }

  const result = (await response.json()) as TwitterPostResponse
  console.log("Tweet posted successfully:", result)
  return result
}

async function uploadTwitterImage(imageUrl: string, accessToken: string): Promise<string> {
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()

  const formData = new FormData()
  formData.append("media", new Blob([imageBuffer]), "image.jpg")

  const uploadResponse = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    console.error("Twitter image upload error:", errorText)
    throw new Error(`Twitter image upload error: ${errorText}`)
  }

  const uploadResult = (await uploadResponse.json()) as { media_id_string: string }
  return uploadResult.media_id_string
}

async function refreshTwitterToken(refreshToken: string, env: Env): Promise<string> {
  const tokenUrl = "https://api.twitter.com/2/oauth2/token"
  const basicAuth = btoa(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`)

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Twitter token refresh error:", errorText)
    throw new Error(`Twitter token refresh error: ${errorText}`)
  }

  const data = (await response.json()) as { access_token: string }
  if (!data.access_token) {
    throw new Error("No access token received from Twitter")
  }
  return data.access_token
}

async function publishToFacebook(
  post: Post,
  facebookAuth?: Profile["social_accounts"]["facebook"],
): Promise<FacebookPostResponse> {
  console.log("Attempting to publish to Facebook...")

  if (!facebookAuth || !facebookAuth.pages || facebookAuth.pages.length === 0) {
    throw new Error("Facebook authentication or pages not found for user. Please reconnect your Facebook account.")
  }

  // Use the first page
  const page = facebookAuth.pages[0]

  let url = `https://graph.facebook.com/v18.0/${page.id}/feed`
  let body: any = {}

  if (post.image_url) {
    url = `https://graph.facebook.com/v18.0/${page.id}/photos`
    body = {
      message: post.content,
      url: post.image_url,
      published: true,
    }
  } else {
    body = {
      message: post.content,
      published: true,
    }
  }

  console.log(`Publishing to Facebook page ${page.name} (${page.id})`)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${page.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Facebook API error:", errorText)
    throw new Error(`Facebook API error: ${errorText}`)
  }

  const result = await response.json()
  console.log("Facebook publish result:", result)

  return result as FacebookPostResponse
}

async function publishToInstagram(
  post: Post,
  instagramAuth?: Profile["social_accounts"]["instagram"],
): Promise<InstagramPostResponse> {
  console.log("Attempting to publish to Instagram...")

  if (!instagramAuth || !instagramAuth.access_token) {
    throw new Error("Instagram authentication not found for user. Please connect your Instagram account.")
  }

  if (Date.now() >= instagramAuth.expires_at) {
    console.log("Instagram token expired")
    throw new Error("Instagram token expired. Please reconnect your Instagram account.")
  }

  let url = `https://graph.instagram.com/${instagramAuth.instagram_account_id}/media`
  let body: any = {
    caption: post.content,
    access_token: instagramAuth.access_token,
  }

  if (post.image_url) {
    body.image_url = post.image_url
  } else {
    throw new Error("Instagram posts require an image.")
  }

  const createMediaResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!createMediaResponse.ok) {
    const errorText = await createMediaResponse.text()
    console.error("Instagram API error (create media):", errorText)
    throw new Error(`Instagram API error: ${errorText}`)
  }

  const createMediaResult = (await createMediaResponse.json()) as { id: string }

  if (!createMediaResult.id) {
    throw new Error("Failed to create Instagram media: No creation ID received")
  }

  // Publish the created media
  url = `https://graph.instagram.com/${instagramAuth.instagram_account_id}/media_publish`
  body = {
    creation_id: createMediaResult.id,
    access_token: instagramAuth.access_token,
  }

  const publishResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!publishResponse.ok) {
    const errorText = await publishResponse.text()
    console.error("Instagram API error (publish media):", errorText)
    throw new Error(`Instagram API error: ${errorText}`)
  }

  const publishResult = (await publishResponse.json()) as InstagramPostResponse
  console.log("Instagram publish result:", publishResult)

  return publishResult
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env)
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log("Scheduled event triggered at:", new Date().toISOString())
    console.log("Event:", JSON.stringify(event))

    try {
      await processScheduledPosts(env)
      console.log("Finished processing scheduled posts")
    } catch (error) {
      console.error("Error processing scheduled posts:", error)
    }
  },
}

