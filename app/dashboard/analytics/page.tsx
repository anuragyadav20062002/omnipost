"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { CustomTable } from '@/components/ui/custom-table'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { addDays } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalyticsData {
  contentGeneration: {
    date: string
    total: number
    twitter: number
    facebook: number
    instagram: number
    linkedin: number
  }[]
  publishing: {
    date: string
    published: number
    failed: number
    pending: number
  }[]
  engagement: {
    platform: string
    likes: number
    comments: number
    shares: number
  }[]
}

const contentGenerationColumns: any[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    accessorKey: "twitter",
    header: "Twitter",
  },
  {
    accessorKey: "facebook",
    header: "Facebook",
  },
  {
    accessorKey: "instagram",
    header: "Instagram",
  },
  {
    accessorKey: "linkedin",
    header: "LinkedIn",
  },
]

const publishingColumns: any[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "published",
    header: "Published",
  },
  {
    accessorKey: "failed",
    header: "Failed",
  },
  {
    accessorKey: "pending",
    header: "Pending",
  },
]

const engagementColumns: any[] = [
  {
    accessorKey: "platform",
    header: "Platform",
  },
  {
    accessorKey: "likes",
    header: "Likes",
  },
  {
    accessorKey: "comments",
    header: "Comments",
  },
  {
    accessorKey: "shares",
    header: "Shares",
  },
]

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    contentGeneration: [],
    publishing: [],
    engagement: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [selectedMetric, setSelectedMetric] = useState<string>("total")
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      // Fetch content generation analytics
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: true })

      if (postsError) throw postsError

      // Fetch publishing analytics
      const { data: scheduledPosts, error: scheduledError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_for', dateRange.from.toISOString())
        .lte('scheduled_for', dateRange.to.toISOString())
        .order('scheduled_for', { ascending: true })

      if (scheduledError) throw scheduledError

      // Process content generation data
      const contentGeneration = processContentGenerationData(posts || [])
      const publishing = processPublishingData(scheduledPosts || [])
      const engagement = processEngagementData(scheduledPosts || [])

      setData({
        contentGeneration,
        publishing,
        engagement
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: "Error",
        description: "Failed to fetch analytics data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const processContentGenerationData = (posts: any[]) => {
    const dateMap = new Map()

    posts.forEach(post => {
      const date = new Date(post.created_at).toISOString().split('T')[0]
      const platforms = JSON.parse(post.content)

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          total: 0,
          twitter: 0,
          facebook: 0,
          instagram: 0,
          linkedin: 0
        })
      }

      const entry = dateMap.get(date)
      entry.total++
      
      Object.keys(platforms).forEach(platform => {
        entry[platform.toLowerCase()]++
      })
    })

    return Array.from(dateMap.values())
  }

  const processPublishingData = (scheduledPosts: any[]) => {
    const dateMap = new Map()

    scheduledPosts.forEach(post => {
      const date = new Date(post.scheduled_for).toISOString().split('T')[0]

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          published: 0,
          failed: 0,
          pending: 0
        })
      }

      const entry = dateMap.get(date)
      entry[post.status]++
    })

    return Array.from(dateMap.values())
  }

  const processEngagementData = (scheduledPosts: any[]) => {
    const platformMap = new Map()

    scheduledPosts.forEach(post => {
      if (!platformMap.has(post.platform)) {
        platformMap.set(post.platform, {
          platform: post.platform,
          likes: 0,
          comments: 0,
          shares: 0
        })
      }

      const entry = platformMap.get(post.platform)
      if (post.metadata?.engagement) {
        entry.likes += post.metadata.engagement.likes || 0
        entry.comments += post.metadata.engagement.comments || 0
        entry.shares += post.metadata.engagement.shares || 0
      }
    })

    return Array.from(platformMap.values())
  }

  const calculateTotalEngagement = () => {
    return data.engagement.reduce((total, platform) => {
      return total + platform.likes + platform.comments + platform.shares
    }, 0)
  }

  const calculateAveragePostsPerDay = () => {
    const totalDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24))
    const totalPosts = data.contentGeneration.reduce((sum, day) => sum + day.total, 0)
    return (totalPosts / totalDays).toFixed(2)
  }

  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <DatePickerWithRange 
            date={{
              from: dateRange.from,
              to: dateRange.to
            }} 
            setDate={(newDate) => {
              if (newDate?.from && newDate?.to) {
                setDateRange({ from: newDate.from, to: newDate.to });
              }
            }}
          />
          <Button onClick={fetchAnalytics}>Refresh Data</Button>
        </div>
      </div>

      {data.contentGeneration.length === 0 && data.publishing.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            Start creating and publishing posts to see your analytics here.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.contentGeneration.reduce((sum, day) => sum + day.total, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {calculateTotalEngagement()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg. Posts per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {calculateAveragePostsPerDay()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Generation Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Total</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.contentGeneration}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric}
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.publishing}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="published" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="failed" 
                    fill="hsl(var(--destructive))" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="pending" 
                    fill="hsl(var(--muted-foreground))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.engagement}>
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="likes" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="comments" 
                    fill="hsl(var(--secondary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="shares" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="generation" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                  <TabsTrigger value="generation" className="rounded-lg">Content Generation</TabsTrigger>
                  <TabsTrigger value="publishing" className="rounded-lg">Publishing</TabsTrigger>
                  <TabsTrigger value="engagement" className="rounded-lg">Engagement</TabsTrigger>
                </TabsList>
                
                <TabsContent value="generation">
                  <CustomTable columns={contentGenerationColumns} data={data.contentGeneration} />
                </TabsContent>

                <TabsContent value="publishing">
                  <CustomTable columns={publishingColumns} data={data.publishing} />
                </TabsContent>

                <TabsContent value="engagement">
                  <CustomTable columns={engagementColumns} data={data.engagement} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

