import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, PinIcon as Pinterest, RssIcon as Reddit, Linkedin, Youtube, TwitterIcon as TikTok, SunMediumIcon as Medium } from 'lucide-react'

const upcomingFeatures = [
  { name: 'Instagram', icon: Instagram, description: 'Share your photos and stories with your followers' },
  { name: 'Pinterest', icon: Pinterest, description: 'Pin your ideas and inspire others' },
  { name: 'Reddit', icon: Reddit, description: 'Engage with communities and share content' },
  { name: 'LinkedIn', icon: Linkedin, description: 'Connect with professionals and share business updates' },
  { name: 'YouTube', icon: Youtube, description: 'Upload and schedule your video content' },
  { name: 'TikTok', icon: TikTok, description: 'Create and schedule short-form videos' },
  { name: 'Medium', icon: Medium, description: 'Publish and schedule your articles' },
]

export default function UpcomingFeaturesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Upcoming Features</h1>
      <p className="text-lg mb-8">We&apos;re constantly working to improve OmniPost. Here are some exciting features coming in our next update:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingFeatures.map((feature) => (
          <Card key={feature.name}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <feature.icon className="mr-2 h-6 w-6" />
                <span>{feature.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

