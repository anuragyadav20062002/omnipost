"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import { SchedulingCalendar } from "@/components/SchedulingCalendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, CalendarIcon, Twitter, Facebook, Instagram, Linkedin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database } from "@/types/database"
import { Badge } from "@/components/ui/badge"
import { UTCClock } from "@/components/UTCClock"

type ScheduledPost = Database["public"]["Tables"]["scheduled_posts"]["Row"] & {
  posts: { title: string } | null
}

interface ScheduleClientProps {
  initialScheduledPosts: ScheduledPost[]
}

export function ScheduleClient({ initialScheduledPosts }: ScheduleClientProps) {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(initialScheduledPosts)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  const handleSchedule = async (date: Date, time: string, platform: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const [hours, minutes] = time.split(":").map(Number)
      const scheduledDate = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes),
      )

      const { data, error } = await supabase.rpc("create_scheduled_post", {
        p_user_id: user.id,
        p_post_id: null,
        p_platform: platform,
        p_content: "Sample content for scheduled post",
        p_scheduled_for: scheduledDate.toISOString(),
        p_image_url: null,
        p_metadata: {},
      })

      if (error) throw error

      if (data && data.length > 0) {
        const newPost = data[0]
        setScheduledPosts([...scheduledPosts, newPost])
        toast({
          title: "Success",
          description: "Post scheduled successfully!",
        })
      } else {
        toast({
          title: "Warning",
          description: "A post is already scheduled for this time and platform.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error scheduling post:", error)
      toast({
        title: "Error",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (postId: string, newDate: Date, newTime: string, newPlatform: string) => {
    try {
      const scheduledFor = new Date(`${newDate.toDateString()} ${newTime}`)
      const utcScheduledFor = new Date(scheduledFor.getTime() - scheduledFor.getTimezoneOffset() * 60000)

      const { data, error } = await supabase
        .from("scheduled_posts")
        .update({
          platform: newPlatform,
          scheduled_for: utcScheduledFor.toISOString(),
        })
        .eq("id", postId)
        .select()

      if (error) throw error

      setScheduledPosts(
        scheduledPosts.map((post) =>
          post.id === postId ? { ...data[0], scheduled_for: data[0].scheduled_for } : post,
        ),
      )
      toast({
        title: "Success",
        description: "Post updated successfully!",
      })
    } catch (error) {
      console.error("Error updating post:", error)
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase.from("scheduled_posts").delete().eq("id", postId)

      if (error) throw error

      setScheduledPosts(scheduledPosts.filter((post) => post.id !== postId))
      toast({
        title: "Success",
        description: "Scheduled post deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting scheduled post:", error)
      toast({
        title: "Error",
        description: "Failed to delete scheduled post. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Schedule Posts</h1>
      <UTCClock />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <SchedulingCalendar onSchedule={handleSchedule} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledPosts.length > 0 ? (
              <ul className="space-y-4">
                {scheduledPosts.map((post) => (
                  <li key={post.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{post.posts?.title || "Untitled Post"}</p>
                      <p className="text-sm text-muted-foreground">{new Date(post.scheduled_for).toUTCString()}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="mr-2 capitalize">
                          {post.status}
                        </Badge>
                        {post.platform === "twitter" && <Twitter className="h-4 w-4 text-blue-400" />}
                        {post.platform === "facebook" && <Facebook className="h-4 w-4 text-blue-600" />}
                        {post.platform === "instagram" && <Instagram className="h-4 w-4 text-pink-500" />}
                        {post.platform === "linkedin" && <Linkedin className="h-4 w-4 text-blue-700" />}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Scheduled Post</DialogTitle>
                          </DialogHeader>
                          <EditPostForm post={post} onEdit={handleEdit} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled posts</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by scheduling a new post.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface EditPostFormProps {
  post: ScheduledPost
  onEdit: (postId: string, newDate: Date, newTime: string, newPlatform: string) => void
}

function EditPostForm({ post, onEdit }: EditPostFormProps) {
  const [date, setDate] = useState<Date>(new Date(post.scheduled_for))
  const [time, setTime] = useState(new Date(post.scheduled_for).toUTCString().slice(16, 21))
  const [platform, setPlatform] = useState(post.platform)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(post.id, date, time, platform)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date (UTC)
        </label>
        <input
          type="date"
          id="date"
          value={date.toISOString().split("T")[0]}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
          Time (UTC)
        </label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
          Platform
        </label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Update Post</Button>
    </form>
  )
}

