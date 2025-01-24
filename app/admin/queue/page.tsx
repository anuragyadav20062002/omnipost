import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function QueueManagementPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: queueItems, error } = await supabase
    .from('post_queue')
    .select('*, posts(title)')
    .order('priority', { ascending: false })
    .order('scheduled_for', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error fetching queue items:', error)
    return <div>Error loading queue data</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Queue Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Scheduled For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queueItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.user_email}</TableCell>
                  <TableCell>{item.posts?.title}</TableCell>
                  <TableCell>{item.platform}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.priority}</TableCell>
                  <TableCell>{new Date(item.scheduled_for).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

