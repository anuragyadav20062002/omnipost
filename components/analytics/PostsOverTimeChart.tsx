import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PostsOverTimeChartProps {
  data: any[]
}

export function PostsOverTimeChart({ data }: PostsOverTimeChartProps) {
  // Process the data to get posts count over time
  const processedData = data.reduce((acc: any[], item: any) => {
    const date = new Date(item.created_at).toLocaleDateString()
    const existingEntry = acc.find(entry => entry.date === date)
    if (existingEntry) {
      existingEntry.count += 1
    } else {
      acc.push({ date, count: 1 })
    }
    return acc
  }, [])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#8884d8" name="Posts" />
      </LineChart>
    </ResponsiveContainer>
  )
}

