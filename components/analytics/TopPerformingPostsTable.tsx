import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  
  interface PostPerformance {
    id: string;
    title: string;
    engagement: number;
    platform: string;
  }
  
  interface TopPerformingPostsTableProps {
    data: PostPerformance[]
  }
  
  export function TopPerformingPostsTable({ data }: TopPerformingPostsTableProps) {
    // Sort posts by total engagements (likes + comments + shares)
    const sortedPosts = [...data].sort((a, b) => 
      (b.engagement) - (a.engagement)
    ).slice(0, 10) // Get top 10 posts
  
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Engagement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post, index) => (
            <TableRow key={index}>
              <TableCell>{post.platform}</TableCell>
              <TableCell>{post.title.substring(0, 50)}...</TableCell>
              <TableCell>{post.engagement}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  
  