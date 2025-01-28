import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Copy,
  Check,
  AlertCircle,
  ImageIcon,
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  Share2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import Image from 'next/image'

interface PlatformPreviewsProps {
  summaries: Record<string, string>
  onUpdate: (platform: string, content: string) => void
  image: string | null
  contentLength: "short" | "mid" | "long"
}

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
}

const platformColors = {
  twitter: "bg-[#1DA1F2] text-white",
  facebook: "bg-[#4267B2] text-white",
  instagram: "bg-gradient-to-r from-[#405DE6] via-[#5851DB] via-[#833AB4] via-[#C13584] to-[#E1306C] text-white",
  linkedin: "bg-[#0077B5] text-white",
}

const getRandomUsername = () => {
  const adjectives = ["Creative", "Digital", "Social", "Tech", "Innovative"]
  const nouns = ["Guru", "Ninja", "Wizard", "Maven", "Enthusiast"]
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`
}

const lengthGuide = {
  short: { min: 150, max: 300 },
  mid: { min: 300, max: 450 },
  long: { min: 400, max: 550 },
}

export function PlatformPreviews({ summaries, onUpdate, image, contentLength }: PlatformPreviewsProps) {
  const [editedContent, setEditedContent] = useState<Record<string, string>>(summaries)
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const [username] = useState(getRandomUsername())

  useEffect(() => {
    validateContent()
  }, [editedContent, contentLength])

  const handleContentChange = (platform: string, content: string) => {
    setEditedContent((prev) => ({ ...prev, [platform]: content }))
    onUpdate(platform, content)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedLinkedIn(true)
    toast({
      title: "Copied to clipboard",
      description: "LinkedIn post content has been copied.",
    })
    setTimeout(() => setCopiedLinkedIn(false), 2000)
  }

  const validateContent = () => {
    const newErrors: Record<string, string> = {}
    const { min, max } = lengthGuide[contentLength]
    Object.entries(editedContent).forEach(([platform, content]) => {
      const wordCount = content.split(/\s+/).length
      if (wordCount < min) {
        newErrors[platform] = `Content is too short. Minimum ${min} words required.`
      } else if (wordCount > max) {
        newErrors[platform] = `Content exceeds the ${max} word limit for ${contentLength} posts.`
      }
    })
    setErrors(newErrors)
  }

  const renderTwitterPreview = (content: string) => (
    <motion.div
      className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-[375px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-2">
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src="/placeholder.svg" alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold dark:text-white">{username}</p>
          <p className="text-gray-500 dark:text-gray-400">@{username.toLowerCase()}</p>
        </div>
      </div>
      <p className="mb-2 dark:text-white whitespace-pre-wrap">{content}</p>
      {image && (
        <Image
          src={image}
          alt="Preview"
          width={400}
          height={300}
          className="rounded-lg"
        />
      )}
      <div className="flex justify-between text-gray-500 dark:text-gray-400">
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <MessageCircle className="mr-1" /> 0
        </motion.span>
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <Repeat className="mr-1" /> 0
        </motion.span>
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <Heart className="mr-1" /> 0
        </motion.span>
      </div>
    </motion.div>
  )

  const renderFacebookPreview = (content: string) => (
    <motion.div
      className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-[375px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-2">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src="/placeholder.svg" alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold dark:text-white">{username}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Just now · 🌍</p>
        </div>
      </div>
      <p className="mb-4 dark:text-white whitespace-pre-wrap">{content}</p>
      {image ? (
        <Image
          src={image}
          alt="Preview"
          width={400}
          height={300}
          className="rounded-lg"
        />
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 h-40 flex items-center justify-center mb-2">
          <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
        </div>
      )}
      <div className="flex justify-between text-gray-500 dark:text-gray-400 border-t pt-2 dark:border-gray-700">
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <Heart className="mr-1" /> Like
        </motion.span>
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <MessageCircle className="mr-1" /> Comment
        </motion.span>
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <Share2 className="mr-1" /> Share
        </motion.span>
      </div>
    </motion.div>
  )

  const renderInstagramPreview = (content: string) => (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-[375px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center p-4">
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src="/placeholder.svg" alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <p className="font-bold dark:text-white">{username.toLowerCase()}</p>
      </div>
      {image ? (
        <Image
          src={image}
          alt="Preview"
          width={400}
          height={300}
          className="rounded-lg"
        />
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 h-80 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <motion.span whileHover={{ scale: 1.1 }}>
              <Heart />
            </motion.span>
            <motion.span whileHover={{ scale: 1.1 }}>
              <MessageCircle />
            </motion.span>
            <motion.span whileHover={{ scale: 1.1 }}>
              <Share2 />
            </motion.span>
          </div>
          <motion.span whileHover={{ scale: 1.1 }}>
            <Bookmark />
          </motion.span>
        </div>
        <p className="dark:text-white whitespace-pre-wrap">
          <span className="font-bold mr-2">{username.toLowerCase()}</span>
          {content}
        </p>
      </div>
    </motion.div>
  )

  const renderLinkedInPreview = (content: string) => (
    <motion.div
      className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-[375px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-2">
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src="/placeholder.svg" alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold dark:text-white">{username}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Digital Marketing Specialist · Just now</p>
        </div>
      </div>
      <p className="mb-4 dark:text-white whitespace-pre-wrap">{content}</p>
      {image ? (
        <Image
          src={image}
          alt="Preview"
          width={400}
          height={300}
          className="rounded-lg"
        />
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 h-40 flex items-center justify-center mb-2">
          <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
        </div>
      )}
      <div className="flex justify-between text-gray-500 dark:text-gray-400 border-t pt-2 dark:border-gray-700">
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <Heart className="mr-1" /> Like
        </motion.span>
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <MessageCircle className="mr-1" /> Comment
        </motion.span>
        <motion.span whileHover={{ scale: 1.1 }} className="flex items-center">
          <Share2 className="mr-1" /> Share
        </motion.span>
      </div>
    </motion.div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Platform Previews</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="twitter">
          <TabsList className="grid w-full grid-cols-4">
            {Object.keys(summaries).map((platform) => (
              <TabsTrigger
                key={platform}
                value={platform}
                className={`capitalize ${platformColors[platform as keyof typeof platformColors]}`}
              >
                {React.createElement(platformIcons[platform as keyof typeof platformIcons], {
                  className: "mr-2 h-4 w-4",
                })}
                {platform}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(summaries).map(([platform]) => (
            <TabsContent key={platform} value={platform}>
              <div className="space-y-4">
                <Textarea
                  value={editedContent[platform]}
                  onChange={(e) => handleContentChange(platform, e.target.value)}
                  rows={6}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {editedContent[platform].split(/\s+/).length} / {lengthGuide[contentLength].min}-
                    {lengthGuide[contentLength].max} words
                  </span>
                  {platform === "linkedin" && (
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(editedContent[platform])}>
                      {copiedLinkedIn ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {errors[platform] && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errors[platform]}</AlertDescription>
                  </Alert>
                )}
                <div className="mt-4">
                  {platform === "twitter" && renderTwitterPreview(editedContent[platform])}
                  {platform === "facebook" && renderFacebookPreview(editedContent[platform])}
                  {platform === "instagram" && renderInstagramPreview(editedContent[platform])}
                  {platform === "linkedin" && renderLinkedInPreview(editedContent[platform])}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

