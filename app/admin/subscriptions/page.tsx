import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function SubscriptionsManagementPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching subscriptions:', error)
    return <div>Error loading subscription data</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Subscriptions Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{subscription.user_email}</TableCell>
                  <TableCell>{subscription.plan_type}</TableCell>
                  <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(subscription.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{subscription.is_active ? 'Active' : 'Inactive'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

