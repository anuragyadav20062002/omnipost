import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface EngagementRateChartProps {
  data: any[]
}

export function EngagementRateChart({ data }: EngagementRateChartProps) {
  // Process the data to get engagement rate by platform
  const processedData = data.reduce((acc: any, item: any) => {
    const platform = item.platform
    if (!acc[platform]) {
      acc[platform] = { platform, engagements: 0, posts: 0 }
    }
    acc[platform].engagements += item.likes + item.comments + item.shares
    acc[platform].posts += 1
    return acc
  }, {})

  const chartData = Object.values(processedData).map((item: any) => ({
    ...item,
    engagementRate: (item.engagements / item.posts).toFixed(2)
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="platform" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="engagementRate" fill="#82ca9d" name="Engagement Rate" />
      </BarChart>
    </ResponsiveContainer>
  )
}

