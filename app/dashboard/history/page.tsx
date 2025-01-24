"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trash2, Calendar, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SchedulePosts } from "@/components/SchedulePosts"
import type { Database } from "@/types/database"
import { schedulePost } from "@/lib/social-media/scheduler"
import { checkAndPublishDuePosts } from "@/lib/social-media/publish"
import { PlatformPreviews } from "@/components/PlatformPreviews"
import { motion, AnimatePresence } from "framer-motion"

type Post = Database["public"]["Tables"]["posts"]["Row"]

function UTCClock() {
  const [time, setTime] = useState(new Date().toUTCString())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Current UTC Time</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{time}</p>
      </CardContent>
    </Card>
  )
}

export default function HistoryPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchedule = async (postId: string, scheduledPosts: Record<string, string>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const post = posts.find((p) => p.id === postId)
      if (!post) throw new Error("Post not found")

      const schedulingResults = await Promise.all(
        Object.entries(scheduledPosts).map(async ([platform, scheduledFor]) => {
          const content = JSON.parse(post.content)[platform]
          const metadata = post.metadata as { image_url?: string }

          try {
            const { data, error } = await schedulePost({
              userId: user.id,
              postId: post.id,
              platform,
              content,
              scheduledFor,
              imageUrl: metadata?.image_url || null,
            })

            if (error) {
              console.error(`Error scheduling for ${platform}:`, error)
              return { platform, result: "error", error }
            }

            return { platform, result: "scheduled" }
          } catch (error) {
            console.error(`Error scheduling for ${platform}:`, error)
            return { platform, result: "error", error }
          }
        }),
      )

      const successCount = schedulingResults.filter((r) => r.result === "scheduled").length
      const errorCount = schedulingResults.filter((r) => r.result === "error").length

      if (successCount > 0) {
        await supabase.from("posts").update({ status: "scheduled" }).eq("id", postId)

        // Update local state
        setPosts(posts.map((p) => (p.id === postId ? { ...p, status: "scheduled" } : p)))
      }

      let message = ""
      if (successCount > 0) {
        message += `Successfully scheduled for ${successCount} platform(s). `
      }
      if (errorCount > 0) {
        message += `Failed to schedule for ${errorCount} platform(s). `
      }

      toast({
        title: successCount > 0 ? "Success" : "Error",
        description: message.trim(),
        variant: successCount > 0 ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error scheduling posts:", error)
      toast({
        title: "Error",
        description: "Failed to schedule posts. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId)

      if (error) throw error

      setPosts(posts.filter((post) => post.id !== postId))
      toast({
        title: "Success",
        description: "Post deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const togglePostExpansion = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Post History</h1>
      <UTCClock />
      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <ul className="space-y-4">
              {posts.map((post) => (
                <motion.li
                  key={post.id}
                  className="border rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(post.created_at).toUTCString()}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {post.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => togglePostExpansion(post.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {expandedPost === post.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Schedule Post</DialogTitle>
                          </DialogHeader>
                          <SchedulePosts
                            summaries={JSON.parse(post.content)}
                            imageUrl={(post.metadata as { image_url?: string })?.image_url}
                            onClose={() => {}}
                            onSchedule={(scheduledPosts) => handleSchedule(post.id, scheduledPosts)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedPost === post.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <PlatformPreviews
                          summaries={JSON.parse(post.content)}
                          onUpdate={() => {}}
                          image={(post.metadata as { image_url?: string })?.image_url || null}
                          contentLength={
                            (post.metadata as { content_length?: "short" | "mid" | "long" })?.content_length || "mid"
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts found. Start by creating a new post!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

