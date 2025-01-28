'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from "@/hooks/use-toast"
import { Loader2, LinkIcon, FileText, ImageIcon, Sparkles } from 'lucide-react'
import type { Database } from "@/types/database"
import { PlatformPreviews } from '@/components/PlatformPreviews'
import { getUserUsage, incrementUsage, type UsageTracking } from "@/lib/usage-tracking"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { motion } from 'framer-motion'

export default function RepurposeContent() {
  const [originalContent, setOriginalContent] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [platforms, setPlatforms] = useState({
    twitter: false,
    facebook: false,
  })
  const [activeTab, setActiveTab] = useState('content')
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [userUsage, setUserUsage] = useState<UsageTracking | null>(null)
  const [summaryType, setSummaryType] = useState('')
  const [tone, setTone] = useState('neutral')
  const [contentLength, setContentLength] = useState<'short' | 'mid' | 'long'>('mid')
  const [image, setImage] = useState<File | null>(null)
  const [userPlan, setUserPlan] = useState<'basic' | 'pro'>('basic')
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUserUsage() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          let usage = await getUserUsage(user.id)
          if (!usage) {
            const { data, error } = await supabase
              .from("usage_tracking")
              .insert({
                user_id: user.id,
                content_repurposes: 0,
                scheduled_posts: 0,
                tweets: 0,
                facebook_posts: 0,
                reset_date: new Date().toISOString(),
              })
              .select()

            if (error) throw error
            usage = data[0]
          }
          setUserUsage(usage)

          // Fetch user's plan from the profiles table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("plan_type")
            .eq("id", user.id)
            .single()

          if (profileError) {
            console.error("Error fetching user profile:", profileError)
            toast({
              title: "Error",
              description: "Failed to fetch user plan. Using basic plan as default.",
              variant: "destructive",
            })
          } else {
            setUserPlan(profileData.plan_type || "basic")
          }
        }
      } catch (error) {
        console.error("Error fetching user usage:", error)
        toast({
          title: "Error",
          description: "Failed to fetch usage data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchUserUsage()
  }, [supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const canIncrement = await incrementUsage(user.id, 'content_repurposes')
      if (!canIncrement) {
        setErrors(prev => ({ ...prev, usage: "You have reached your content repurpose limit for this month." }))
        toast({
          title: "Usage Limit Reached",
          description: "You have reached your content repurpose limit for this month. Please upgrade your plan to continue.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const selectedPlatforms = Object.entries(platforms)
        .filter(([, isSelected]) => isSelected)
        .map(([platform]) => platform)

        

      if (selectedPlatforms.length === 0) {
        setErrors(prev => ({ ...prev, platforms: "Please select at least one platform." }))
        toast({
          title: "Error",
          description: "Please select at least one platform.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check platform-specific limits
      if (platforms.twitter && userUsage && userUsage.tweets >= (userPlan === 'pro' ? 15 : 5)) {
        setErrors(prev => ({ ...prev, twitter: "You have reached your Twitter posts limit for this month." }))
        toast({
          title: "Usage Limit Reached",
          description: "You have reached your Twitter posts limit for this month.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (platforms.facebook && userUsage && userUsage.facebook_posts >= (userPlan === 'pro' ? 40 : 20)) {
        setErrors(prev => ({ ...prev, facebook: "You have reached your Facebook posts limit for this month." }))
        toast({
          title: "Usage Limit Reached",
          description: "You have reached your Facebook posts limit for this month.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('content', activeTab === 'content' ? originalContent : '')
      formData.append('url', activeTab === 'url' ? url : '')
      formData.append('summaryType', summaryType)
      formData.append('tone', tone)
      formData.append('contentLength', contentLength)
      if (image) {
        formData.append('image', image)
      }
      formData.append('platforms', JSON.stringify(selectedPlatforms))

      const response = await fetch('/api/process-content', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process content')
      }

      const data = await response.json()
      setSummaries(data.summaries)
      setShowPreview(true)
    } catch (error) {
      console.error('Error processing content:', error)
      toast({
        title: "Error",
        description: "Failed to process content. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('User not found')

      const originalContentToSave = activeTab === 'url' ? url : activeTab === 'content' ? originalContent : file ? file.name : '';

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userData.user.id,
          title: url ? 'Repurposed from URL' : file ? file.name : 'Repurposed content',
          content: JSON.stringify(summaries),
          original_content: originalContentToSave,
          platforms: Object.keys(summaries),
          status: 'draft',
          metadata: { 
            source_url: url, 
            file_type: file ? file.type : null,
            summary_type: summaryType,
            tone: tone,
            content_length: contentLength
          }
        })
        .select()

      if (error) throw error
      if (!data || data.length === 0) throw new Error('Failed to insert post')

      const postId = data[0].id

      if (image) {
        const { error: uploadError } = await supabase
          .storage
          .from('post-media')
          .upload(`${postId}/${image.name}`, image)

        if (uploadError) throw uploadError
      }

      // Increment usage for specific platforms
      if (platforms.twitter) {
        await incrementUsage(userData.user.id, 'tweets')
      }
      if (platforms.facebook) {
        await incrementUsage(userData.user.id, 'facebook_posts')
      }

      toast({
        title: "Success",
        description: "Content saved successfully!",
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving content:', error)
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleUpdateSummary = (content: string) => {
    setSummaries(prev => ({ ...prev, [content]: content }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div className="container mx-auto py-10">
      {userUsage && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Content Repurposes</CardTitle>
            <CardDescription>Track your content repurpose usage</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(userUsage.content_repurposes / (userPlan === 'pro' ? 180 : 90)) * 100} 
              className="h-2 w-full" 
            />
            <p className="mt-2 text-sm text-muted-foreground">
              {userUsage.content_repurposes} / {userPlan === 'pro' ? '180' : '90'} used
            </p>
          </CardContent>
        </Card>
      )}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
          <CardTitle className="text-3xl font-extrabold">Repurpose Your Content</CardTitle>
          <CardDescription>Transform your content for multiple platforms with AI-powered assistance</CardDescription>
        </CardHeader>
        {!showPreview ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
                  <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-background">
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Paste Content</span>
                    </motion.div>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-background">
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      <span>Paste URL</span>
                    </motion.div>
                  </TabsTrigger>
                  <TabsTrigger value="file" className="rounded-lg data-[state=active]:bg-background">
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      <span>Upload File</span>
                    </motion.div>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                  <div className="space-y-2">
                    <Label htmlFor="content">Original Content</Label>
                    <Textarea
                      id="content"
                      value={originalContent}
                      onChange={(e) => setOriginalContent(e.target.value)}
                      rows={10}
                      placeholder="Paste your long-form content here..."
                      required={activeTab === 'content'}
                      className="resize-none border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="url">
                  <div className="space-y-2">
                    <Label htmlFor="url">Content URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/your-content"
                      required={activeTab === 'url'}
                      className="border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="file">
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload Image or Video</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      required={activeTab === 'file'}
                      className="border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="summaryType">Summary Type (Optional)</Label>
                  <Input
                    id="summaryType"
                    value={summaryType}
                    onChange={(e) => setSummaryType(e.target.value)}
                    placeholder="E.g., 'I'm launching my SaaS named XYZ. Take ideas from this content and make a post.'"
                    className="border-2 border-muted focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone" className="border-2 border-muted focus:border-primary transition-colors">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentLength">Content Length</Label>
                  <Select 
                    value={contentLength} 
                    onValueChange={(value: 'short' | 'mid' | 'long') => setContentLength(value)}
                  >
                    <SelectTrigger id="contentLength" className="border-2 border-muted focus:border-primary transition-colors">
                      <SelectValue placeholder="Select content length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="mid">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image</Label>
                  <Input
                    id="image"
                    type="file"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    accept="image/*"
                    className="border-2 border-muted focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Select Platforms</Label>
                {Object.entries(platforms).map(([platform, isChecked]) => (
                  <Card key={platform} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            setPlatforms(prev => ({ ...prev, [platform]: checked === true }))
                          }
                        />
                        <Label htmlFor={platform} className="capitalize">{platform}</Label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
            <div className="p-6 bg-muted/50">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Summaries
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <CardContent className="space-y-4 p-6">
            <PlatformPreviews 
              summaries={summaries} 
              onUpdate={handleUpdateSummary} 
              image={image ? URL.createObjectURL(image) : null}
              contentLength={contentLength}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Back
              </Button>
              <Button onClick={handleSave} disabled={isLoading || Object.keys(errors).length > 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Summaries'
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

