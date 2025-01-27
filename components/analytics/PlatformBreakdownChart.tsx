import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Define specific types for the props and data
interface PlatformData {
  platform: string;
  value: number;
}

interface PlatformBreakdownChartProps {
  data: PlatformData[];
}

export function PlatformBreakdownChart({ data }: PlatformBreakdownChartProps) {
  // Process the data to get post count by platform
  const processedData = data.reduce((acc: { [key: string]: { name: string; value: number } }, item: PlatformData) => {
    const platform = item.platform
    if (!acc[platform]) {
      acc[platform] = { name: platform, value: 0 }
    }
    acc[platform].value += 1
    return acc
  }, {})

  const chartData = Object.values(processedData)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry: { name: string; value: number }, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default PlatformBreakdownChart

