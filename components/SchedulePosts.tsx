'use client'

import React, { useState, useEffect } from 'react'
import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

interface SchedulePostsProps {
  summaries: Record<string, string>
  imageUrl?: string | null
  onClose: () => void
  onSchedule: (scheduledPosts: Record<string, string>) => void 
  connectedPlatforms?: string[]
  socialAccounts?: Record<string, any>
}

export function SchedulePosts({
  summaries,
  imageUrl,
  onClose,
  onSchedule,
  connectedPlatforms = [],
  socialAccounts,
}: SchedulePostsProps) {
  const [scheduledPosts, setScheduledPosts] = useState<Record<string, { date: string; pageId?: string }>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false) 
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  console.log("imageUrl: "+imageUrl)

  useEffect(() => {
    const fetchConnectedPlatforms = async () => {
      if (connectedPlatforms.length === 0) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data } = await supabase
              .from('profiles')
              .select('social_accounts')
              .eq('id', user.id)
              .single()

            if (data?.social_accounts) {
              setAvailablePlatforms(Object.keys(data.social_accounts))
            }
          }
        } catch (error) {
          console.error('Error fetching connected platforms:', error)
        }
      } else {
        setAvailablePlatforms(connectedPlatforms)
      }
    }

    fetchConnectedPlatforms()
  }, [connectedPlatforms])

  const handleScheduleChange = (platform: string, localDate: string, pageId?: string) => {
    setScheduledPosts(prev => ({
      ...prev,
      [platform]: { date: localDate, pageId }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setIsLoading(true)
    setErrors({})

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const scheduledPostsData = Object.entries(scheduledPosts).map(([platform, { date }]) => {
        // Convert local date to UTC
        const localDate = new Date(date)
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
        return [platform, utcDate.toISOString()]
      })

      onSchedule(Object.fromEntries(scheduledPostsData))
      onClose()
    } catch (error) {
      console.error('Error scheduling posts:', error)
      toast({
        title: "Error",
        description: "Failed to schedule posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>UTC Time Zone</AlertTitle>
        <AlertDescription>
          All times are in UTC. Please adjust accordingly for your local time zone.
        </AlertDescription>
      </Alert>
      
      {Object.keys(summaries)
        .filter(platform => availablePlatforms.includes(platform))
        .map(platform => (
          <div key={platform} className="mb-4">
            <Label htmlFor={`schedule-${platform}`} className="capitalize">{platform}</Label>
            <Input
              id={`schedule-${platform}`}
              type="datetime-local"
              onChange={(e) => handleScheduleChange(platform, e.target.value)}
              required
            />
            {platform === 'facebook' && socialAccounts?.facebook?.pages && (
              <Select
                onValueChange={(value) => handleScheduleChange(
                  platform,
                  scheduledPosts[platform]?.date || '',
                  value
                )}
                defaultValue={socialAccounts?.facebook?.pages[0]?.id}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {socialAccounts?.facebook?.pages.map((page: any) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors[platform] && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors[platform]}</AlertDescription>
              </Alert>
            )}
          </div>
        ))}
      {availablePlatforms.length === 0 && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Connected Accounts</AlertTitle>
          <AlertDescription>
            Please connect your social media accounts in the settings page.
          </AlertDescription>
        </Alert>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isSubmitting || availablePlatforms.length === 0} 
        >
          {isLoading ? 'Scheduling...' : 'Schedule Posts'}
        </Button>
      </DialogFooter>
    </form>
  )
}

