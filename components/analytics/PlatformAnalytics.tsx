import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PostsOverTimeChart } from './PostsOverTimeChart'
import  EngagementRateChart  from './EngagementRateChart'
import { TopPerformingPostsTable } from './TopPerformingPostsTable'
import { OptimalPostingTimes } from '../OptimalPostingTimes'
import { Database } from '@/types/database'

type AnalyticsData = Database['public']['Tables']['analytics']['Row'] & { title?: string };

interface PlatformAnalyticsProps {
  platform: string
  data: AnalyticsData[]
  userPlan: 'basic' | 'pro' | null
}

type PostPerformance = {
  id: string;
  user_id: string;
  post_id: string;
  platform: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  updated_at: string;
  title: string;
  engagement: number;
};

export function PlatformAnalytics({ platform, data, userPlan }: PlatformAnalyticsProps) {
  console.log(platform)
  const totalPosts = data.length
  const totalEngagements = data.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0)
  const averageEngagementRate = totalPosts > 0 ? (totalEngagements / totalPosts).toFixed(2) : '0'

  const topPerformingPosts: PostPerformance[] = data.map(post => ({
    id: post.id,
    user_id: post.user_id,
    post_id: post.post_id,
    platform: post.platform,
    content: post.content,
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
    created_at: post.created_at,
    updated_at: post.updated_at,
    title: post.title || "Untitled",
    engagement: post.likes + post.comments + post.shares
  }))

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
          <TopPerformingPostsTable data={topPerformingPosts} />
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

