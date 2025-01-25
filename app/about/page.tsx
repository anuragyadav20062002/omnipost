import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center gradient-text">About OmniPost</h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p>At OmniPost, we're on a mission to simplify social media management for content creators and businesses. We believe in the power of efficient, targeted communication across multiple platforms.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Founded in 2023, OmniPost was born out of the need for a more streamlined approach to multi-platform content distribution. Our team of passionate developers and social media experts came together to create a solution that saves time and maximizes impact.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We leverage cutting-edge AI and machine learning technologies to analyze, optimize, and distribute your content. Our platform is built on a robust, scalable architecture to ensure reliability and performance.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p>OmniPost is powered by a diverse team of experts in social media, content creation, and software development. We're united by our passion for innovation and our commitment to our users' success.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Innovation: We're always pushing the boundaries of what's possible.</li>
              <li>User-Centric: Our users' needs drive every decision we make.</li>
              <li>Integrity: We believe in transparent, ethical business practices.</li>
              <li>Collaboration: We thrive on teamwork and community engagement.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Ready to revolutionize your social media strategy? Join thousands of content creators and businesses who trust OmniPost.</p>
            <Link href="/auth/signup">
              <Button className="w-full">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

