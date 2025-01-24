'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Loader2 } from 'lucide-react'

type ScheduledPost = Database['public']['Tables']['scheduled_posts']['Row'] & {
  posts: { title: string } | null
}

export function PublishingStatus() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchScheduledPosts()
    const interval = setInterval(fetchScheduledPosts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchScheduledPosts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*, posts(title)')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true })
        .limit(10) // Limit to the 10 most recent posts

      if (error) throw error

      setScheduledPosts(data)

      // Start the worker if there are pending posts
      if (data.some(post => post.status === 'pending')) {
        await fetch('/api/publish/worker')
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
      setError('Failed to fetch scheduled posts. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string, errorMessage?: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'processing':
        return <Badge variant="destructive">Processing</Badge>
      case 'published':
        return <Badge variant="success">Published</Badge>
      case 'failed':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive">Failed</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{errorMessage || 'Unknown error'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publishing Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading publishing status...</span>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : scheduledPosts.length > 0 ? (
          <ul className="space-y-4">
            {scheduledPosts.map((post) => (
              <li key={post.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{post.posts?.title || 'Untitled Post'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.scheduled_for).toLocaleString()} - {post.platform}
                  </p>
                </div>
                {getStatusBadge(post.status, post.error_message)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No scheduled posts found.</p>
        )}
      </CardContent>
    </Card>
  )
}

