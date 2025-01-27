import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Define specific types for the props and data
interface EngagementData {
  platform: string;
  likes: number;
  comments: number;
  shares: number;
}

interface EngagementRateChartProps {
  data: EngagementData[];
}

interface ProcessedData {
  [key: string]: {
    platform: string;
    engagements: number;
    posts: number;
  };
}

const EngagementRateChart: React.FC<EngagementRateChartProps> = ({ data }) => {
  // Process the data to get engagement rate by platform
  const processedData = data.reduce((acc: ProcessedData, item: EngagementData) => {
    const platform = item.platform;
    if (!acc[platform]) {
      acc[platform] = { platform, engagements: 0, posts: 0 };
    }
    acc[platform].engagements += item.likes + item.comments + item.shares;
    acc[platform].posts += 1;
    return acc;
  }, {} as ProcessedData);

  const chartData = Object.values(processedData).map((item) => ({
    ...item,
    engagementRate: (item.engagements / item.posts).toFixed(2),
  }));

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

export default EngagementRateChart;

