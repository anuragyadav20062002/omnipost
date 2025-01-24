import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  
  interface TopPerformingPostsTableProps {
    data: any[]
  }
  
  export function TopPerformingPostsTable({ data }: TopPerformingPostsTableProps) {
    // Sort posts by total engagements (likes + comments + shares)
    const sortedPosts = [...data].sort((a, b) => 
      (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
    ).slice(0, 10) // Get top 10 posts
  
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead>Total Engagements</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post, index) => (
            <TableRow key={index}>
              <TableCell>{post.platform}</TableCell>
              <TableCell>{post.content.substring(0, 50)}...</TableCell>
              <TableCell>{post.likes}</TableCell>
              <TableCell>{post.comments}</TableCell>
              <TableCell>{post.shares}</TableCell>
              <TableCell>{post.likes + post.comments + post.shares}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  
  