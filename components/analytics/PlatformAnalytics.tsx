import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PostsOverTimeChart } from './PostsOverTimeChart'
import { EngagementRateChart } from './EngagementRateChart'
import { TopPerformingPostsTable } from './TopPerformingPostsTable'
import { OptimalPostingTimes } from '../OptimalPostingTimes'
import { Database } from '@/types/database'

type AnalyticsData = Database['public']['Tables']['analytics']['Row']

interface PlatformAnalyticsProps {
  platform: string
  data: AnalyticsData[]
  userPlan: 'basic' | 'pro' | null
}

export function PlatformAnalytics({ platform, data, userPlan }: PlatformAnalyticsProps) {
  const totalPosts = data.length
  const totalEngagements = data.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0)
  const averageEngagementRate = totalPosts > 0 ? (totalEngagements / totalPosts).toFixed(2) : '0'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEngagements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageEngagementRate}%</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Posts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <PostsOverTimeChart data={data} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Engagement Rate Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <EngagementRateChart data={data} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <TopPerformingPostsTable data={data} />
        </CardContent>
      </Card>
      {userPlan === 'pro' && (
        <Card>
          <CardHeader>
            <CardTitle>Optimal Posting Times</CardTitle>
          </CardHeader>
          <CardContent>
            <OptimalPostingTimes platformData={data} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

