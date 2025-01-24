'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { publishPost } from '@/lib/social-media/publish'

type FailedPost = Database['public']['Tables']['scheduled_posts']['Row'] & {
  posts: { title: string } | null
}

export function FailedPosts() {
  const [failedPosts, setFailedPosts] = useState<FailedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [retrying, setRetrying] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    fetchFailedPosts()
  }, [])

  const fetchFailedPosts = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*, posts(title)')
        .eq('user_id', user.id)
        .eq('status', 'failed')
        .order('scheduled_for', { ascending: false })

      if (error) throw error

      setFailedPosts(data)
    } catch (error) {
      console.error('Error fetching failed posts:', error)
      toast({
        title: "Error",
        description: "Failed to fetch failed posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async (post: FailedPost) => {
    setRetrying(post.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { data: postContent } = await supabase
        .from('posts')
        .select('content')
        .eq('id', post.post_id)
        .single()

      if (!postContent) throw new Error('Post content not found')

      const result = await publishPost(postContent.content, [post.platform], user.id)

      if (result[post.platform].startsWith('Error')) {
        throw new Error(result[post.platform])
      }

      await supabase
        .from('scheduled_posts')
        .update({ status: 'published', error_message: null })
        .eq('id', post.id)

      toast({
        title: "Success",
        description: `Successfully republished to ${post.platform}`,
      })

      setFailedPosts(failedPosts.filter(p => p.id !== post.id))
    } catch (error) {
      console.error('Error retrying post:', error)
      toast({
        title: "Error",
        description: `Failed to republish to ${post.platform}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setRetrying(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Failed Posts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading failed posts...</p>
        ) : failedPosts.length > 0 ? (
          <ul className="space-y-4">
            {failedPosts.map((post) => (
              <li key={post.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{post.posts?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.scheduled_for).toLocaleString()} - {post.platform}
                  </p>
                  <Badge variant="destructive" className="mt-1">
                    Failed
                  </Badge>
                </div>
                <Button
                  onClick={() => handleRetry(post)}
                  disabled={retrying === post.id}
                >
                  {retrying === post.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Retry
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No failed posts found.</p>
        )}
      </CardContent>
    </Card>
  )
}

