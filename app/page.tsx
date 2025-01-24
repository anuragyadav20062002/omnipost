import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Zap,
  Calendar,
  BarChart,
  Share2,
  Repeat,
  Users,
  Shield,
  ChevronRight,
  Check,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 gradient-text">
              Repurpose, Schedule, Analyze: Your All-in-One Social Media Solution
            </h1>
            <p className="text-xl mb-8 text-foreground">
              OmniPost transforms your long-form content into engaging posts for Twitter, LinkedIn, Instagram, and
              Facebook - all powered by AI.
            </p>
            <div className="gradient-border inline-block">
              <Button size="lg" className="text-lg bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* OmniPost Workflow Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">The OmniPost Workflow</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-12 w-12 mb-4 text-primary" />,
                  title: "1. AI-Powered Repurposing",
                  description:
                    "Upload your blog or paste your content. Our AI transforms it into platform-specific posts in seconds.",
                },
                {
                  icon: <Calendar className="h-12 w-12 mb-4 text-secondary" />,
                  title: "2. Smart Scheduling",
                  description: "Use our intuitive calendar to schedule posts across all platforms at optimal times.",
                },
                {
                  icon: <BarChart className="h-12 w-12 mb-4 text-accent" />,
                  title: "3. Comprehensive Analytics",
                  description: "Track performance with real-time engagement metrics and visual reports.",
                },
              ].map((step, index) => (
                <Card key={index} className="p-6 flex flex-col items-center text-center">
                  <CardContent>
                    {step.icon}
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-foreground/80">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Content Repurposing Showcase */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Content Repurposing Magic</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">From Blog to Social Media in Seconds</h3>
                <p className="text-lg">
                  Watch how OmniPost transforms a single blog post into tailored content for each platform:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-primary mr-2" /> Concise tweets with hashtags for Twitter
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-primary mr-2" /> Professional updates for LinkedIn
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-primary mr-2" /> Engaging captions for Instagram
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-primary mr-2" /> Shareable snippets for Facebook
                  </li>
                </ul>
                <Button size="lg" className="mt-4">
                  Try Content Repurposing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="bg-background p-6 rounded-lg shadow-lg border border-primary/20">
                <div className="aspect-w-16 aspect-h-9">
                  <video className="w-full h-full rounded-md" controls>
                    <source src="../demo/Repurpose.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Scheduling Feature */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Smart Scheduling for Maximum Impact</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="bg-card p-6 rounded-lg shadow-lg border border-primary/20">
                <div className="aspect-w-16 aspect-h-9">
                  <video className="w-full h-full rounded-md" controls>
                    <source src="../demo/Scheduling.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Optimize Your Posting Schedule</h3>
                <p className="text-lg">
                  OmniPost's smart scheduling feature ensures your content reaches your audience at the perfect time:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-secondary mr-2" /> AI-powered best time to post
                    recommendations
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-secondary mr-2" /> Custom scheduling for each platform
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-secondary mr-2" /> Bulk scheduling for efficient planning
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-secondary mr-2" /> Time zone management for global reach
                  </li>
                </ul>
                <Button size="lg" className="mt-4">
                  Explore Smart Scheduling
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Dashboard Preview */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">
              Comprehensive Analytics at Your Fingertips
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Data-Driven Content Strategy</h3>
                <p className="text-lg">
                  Gain valuable insights into your social media performance across all platforms:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-accent mr-2" /> Unified dashboard for all social media metrics
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-accent mr-2" /> Engagement rate and reach analysis
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-accent mr-2" /> Content performance comparisons
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-accent mr-2" /> Customizable reports and export options
                  </li>
                </ul>
                <Button size="lg" className="mt-4">
                  View Analytics Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="bg-background p-6 rounded-lg shadow-lg border border-primary/20">
                <div className="aspect-w-16 aspect-h-9">
                  <video className="w-full h-full rounded-md" controls>
                    <source src="../demo/Analytics.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Logos */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Seamless Integrations</h2>
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="text-center">
                <Twitter className="h-16 w-16 mx-auto mb-2 text-[#1DA1F2]" />
                <p className="font-semibold">Twitter (X)</p>
              </div>
              <div className="text-center">
                <Facebook className="h-16 w-16 mx-auto mb-2 text-[#4267B2]" />
                <p className="font-semibold">Facebook</p>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mt-12 mb-6 text-center">Coming Soon</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center opacity-50">
                <Instagram className="h-16 w-16 mx-auto mb-2" />
                <p className="font-semibold">Instagram</p>
              </div>
              <div className="text-center opacity-50">
                <Linkedin className="h-16 w-16 mx-auto mb-2" />
                <p className="font-semibold">LinkedIn</p>
              </div>
              <div className="text-center opacity-50">
                <Youtube className="h-16 w-16 mx-auto mb-2" />
                <p className="font-semibold">YouTube</p>
              </div>
              <div className="text-center opacity-50">
                <MessageCircle className="h-16 w-16 mx-auto mb-2" />
                <p className="font-semibold">TikTok</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">
              Trusted by Content Creators Worldwide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "OmniPost has cut my content management time in half. The AI repurposing is incredibly accurate!",
                  author: "Alex Chen",
                  title: "Content Creator, Tech Insider",
                  avatar: "/avatars/alex-chen.jpg",
                },
                {
                  quote:
                    "The smart scheduling feature has boosted our engagement rates by 40%. It's like having an AI assistant.",
                  author: "Samantha Lee",
                  title: "Social Media Manager, Fashion Forward",
                  avatar: "/avatars/samantha-lee.jpg",
                },
                {
                  quote:
                    "As a small business owner, OmniPost has been a game-changer. I can now maintain a consistent social media presence effortlessly.",
                  author: "Michael Johnson",
                  title: "Founder, Eco Solutions",
                  avatar: "/avatars/michael-johnson.jpg",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="flex flex-col">
                  <CardContent className="flex-grow flex flex-col justify-between p-6">
                    <blockquote className="text-lg italic mb-4 flex-grow text-foreground">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center mt-4">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        <AvatarFallback>
                          {testimonial.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is OmniPost?</AccordionTrigger>
                <AccordionContent>
                  OmniPost is an AI-powered social media management platform that helps content creators repurpose,
                  schedule, and analyze their content across multiple social media platforms.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Which social media platforms does OmniPost support?</AccordionTrigger>
                <AccordionContent>
                  OmniPost currently supports Twitter, Facebook, Instagram, and LinkedIn. We're working on adding
                  support for TikTok, Pinterest, YouTube, and Medium in the near future.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How does the AI content repurposing work?</AccordionTrigger>
                <AccordionContent>
                  Our AI analyzes your long-form content and automatically generates platform-specific posts optimized
                  for each social media platform. It considers factors like character limits, hashtag usage, and
                  platform-specific best practices.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What are the pricing options for OmniPost?</AccordionTrigger>
                <AccordionContent>
                  We offer flexible pricing plans to suit businesses of all sizes. Please visit our pricing page or
                  contact our sales team for detailed information on our current pricing options.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Is there a limit to how many posts I can schedule?</AccordionTrigger>
                <AccordionContent>
                  The number of posts you can schedule depends on your chosen plan. Our plans are designed to
                  accommodate various posting frequencies, from small businesses to large enterprises.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 gradient-text">
              Ready to Revolutionize Your Social Media Strategy?
            </h2>
            <p className="text-xl mb-8 text-foreground">
              Join thousands of content creators who are saving time, increasing reach, and boosting engagement with
              OmniPost.
            </p>
            <div className="gradient-border inline-block">
              <Button size="lg" className="text-lg bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

