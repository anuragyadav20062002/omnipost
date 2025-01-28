'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { User } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Notification } from '@/types/notifications'
import { BarChart, Clock, TrendingUp, Zap, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Twitter, Facebook, Instagram, Linkedin, LinkIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DashboardClientProps {
  user: User
  profile: Database['public']['Tables']['profiles']['Row'] | null
  usage: Database['public']['Tables']['usage_tracking']['Row'] & {
    tweets: number
    facebook_posts: number
  } | null
  planType: string
  planLimits: {
    repurposes: number
    scheduled: number
    tweets: number
    facebook_posts: number
  }
  statCards: Array<{
    title: string
    value: string
    change: string
    icon: string
    color: string
  }>
  recentPosts: Database['public']['Tables']['posts']['Row'][]
  upcomingPosts: (Database['public']['Tables']['scheduled_posts']['Row'] & {
    posts: Database['public']['Tables']['posts']['Row'] | null
  })[]
  socialAccounts: Record<string, any>
}

export default function DashboardClient({
  usage,
  planType,
  planLimits,
  statCards,
  recentPosts,
  upcomingPosts,
  socialAccounts,
}: DashboardClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const checkTokenExpirations = useCallback(async () => {
    const newNotifications: Notification[] = []
    
    if (socialAccounts) {
      Object.entries(socialAccounts).forEach(([platform, account]) => {
        const socialAccount = account as { expires_at: number | null, access_token: string }
        if (socialAccount.expires_at === null && platform === 'facebook') {
          // Facebook tokens don't expire, so we don't need to show a warning
          return
        }
        if (socialAccount.expires_at && Date.now() > socialAccount.expires_at) {
          newNotifications.push({
            id: `${platform}-token-expired`,
            type: 'warning',
            message: `Your ${platform} token has expired. Please refresh it to continue posting.`,
            actionLink: '/dashboard/settings/social-accounts',
            actionText: 'Refresh Token'
          })
        }
      })
    }
    
    setNotifications(newNotifications)
  }, [socialAccounts])

  useEffect(() => {
    checkTokenExpirations()
    const interval = setInterval(checkTokenExpirations, 3600000)
    return () => clearInterval(interval)
  }, [checkTokenExpirations])

  const IconComponent = {
    BarChart: BarChart,
    Clock: Clock,
    TrendingUp: TrendingUp
  }

  const handleDeletePost = async (postId: string) => {
    try {
      // ... existing code
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to delete post");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-10"
    >
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.map((notification) => (
            <Alert key={notification.id} variant={notification.type === 'warning' ? 'default' : 'default'}>
              <AlertTitle>{notification.type === 'warning' ? 'Warning' : 'Notice'}</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <span>{notification.message}</span>
                {notification.actionLink && (
                  <a
                    href={notification.actionLink}
                    className="text-sm font-medium underline hover:no-underline"
                  >
                    {notification.actionText}
                  </a>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Connected Social Accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Connected Accounts
            <Link href="/dashboard/settings/social-accounts">
              <Button variant="ghost" size="sm">
                <LinkIcon className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            {Object.keys(socialAccounts).map((platform) => (
              <motion.div
                key={platform}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {platform === 'twitter' && <Twitter className="w-8 h-8 text-blue-400" />}
                {platform === 'facebook' && <Facebook className="w-8 h-8 text-blue-600" />}
                {platform === 'instagram' && <Instagram className="w-8 h-8 text-pink-500" />}
                {platform === 'linkedin' && <Linkedin className="w-8 h-8 text-blue-700" />}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {statCards.map((card, index) => {
          const Icon = IconComponent[card.icon as keyof typeof IconComponent]
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.change} from last month
                </p>
              </CardContent>
            </Card>
          )}
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="capitalize text-sm">{post.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent posts</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPosts.length > 0 ? (
              <div className="space-y-4">
                {upcomingPosts.map((post) => (
                  <div key={post.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{post.posts?.title || 'Untitled'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.scheduled_for).toLocaleString()} - {post.platform}
                      </p>
                    </div>
                    <div className="capitalize text-sm">{post.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming posts</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Content Repurposes</p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{usage?.content_repurposes || 0} used</span>
                <span>{planLimits.repurposes} limit</span>
              </div>
              <div className="h-2 bg-secondary/20 rounded-full mt-1">
                <div 
                  className="h-full bg-secondary rounded-full"
                  style={{ 
                    width: `${((usage?.content_repurposes || 0) / planLimits.repurposes) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Scheduled Posts</p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{usage?.scheduled_posts || 0} used</span>
                <span>{planLimits.scheduled} limit</span>
              </div>
              <div className="h-2 bg-primary/20 rounded-full mt-1">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ 
                    width: `${((usage?.scheduled_posts || 0) / planLimits.scheduled) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Tweets</p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{usage?.tweets || 0} used</span>
                <span>{planLimits.tweets} limit</span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full mt-1">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ 
                    width: `${((usage?.tweets || 0) / planLimits.tweets) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Facebook Posts</p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{usage?.facebook_posts || 0} used</span>
                <span>{planLimits.facebook_posts} limit</span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full mt-1">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ 
                    width: `${((usage?.facebook_posts || 0) / planLimits.facebook_posts) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
          {planType === 'basic' && (
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href="https://whop.com">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/repurpose">
              <Button className="w-full">
                <Zap className="mr-2 h-4 w-4" />
                Repurpose Content
              </Button>
            </Link>
            <Link href="/dashboard/schedule">
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Posts
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

