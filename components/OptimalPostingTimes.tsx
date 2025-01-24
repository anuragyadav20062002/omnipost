'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

type AnalyticsData = Database['public']['Tables']['analytics']['Row']

interface OptimalPostingTimesProps {
  platformData?: AnalyticsData[]
}

export function OptimalPostingTimes({ platformData }: OptimalPostingTimesProps) {
  const [optimalTimes, setOptimalTimes] = useState<Record<string, string>>({})
  const [selectedPlatform, setSelectedPlatform] = useState<string>('twitter')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (platformData) {
      const optimalTime = calculateOptimalTime(platformData)
      setOptimalTimes(prevTimes => ({ ...prevTimes, [selectedPlatform]: optimalTime }))
      setIsLoading(false)
    } else {
      fetchOptimalTimes()
    }
  }, [selectedPlatform, platformData])

  const fetchOptimalTimes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', selectedPlatform)

      if (error) throw error

      const optimalTime = calculateOptimalTime(data)
      setOptimalTimes(prevTimes => ({ ...prevTimes, [selectedPlatform]: optimalTime }))
    } catch (error) {
      console.error('Error fetching optimal times:', error)
      setError('Failed to fetch optimal times. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateOptimalTime = (data: AnalyticsData[]): string => {
    // Group engagements by hour
    const engagementsByHour: Record<number, number> = {}
    data.forEach(post => {
      const hour = new Date(post.created_at).getHours()
      const engagement = post.likes + post.comments + post.shares
      engagementsByHour[hour] = (engagementsByHour[hour] || 0) + engagement
    })

    // Find the hour with the highest engagement
    let maxEngagement = 0
    let optimalHour = 0
    Object.entries(engagementsByHour).forEach(([hour, engagement]) => {
      if (engagement > maxEngagement) {
        maxEngagement = engagement
        optimalHour = parseInt(hour)
      }
    })

    return `${optimalHour.toString().padStart(2, '0')}:00`
  }

  const platforms = ['twitter', 'facebook', 'instagram', 'linkedin']

  return (
    <div className="space-y-4">
      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
        <SelectTrigger>
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent>
          {platforms.map(platform => (
            <SelectItem key={platform} value={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading optimal times...</span>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : optimalTimes[selectedPlatform] ? (
        <div>
          <p>The optimal posting time for {selectedPlatform} is:</p>
          <p className="text-2xl font-bold">{optimalTimes[selectedPlatform]}</p>
        </div>
      ) : (
        <p>No data available for {selectedPlatform}</p>
      )}
      <Button onClick={fetchOptimalTimes}>Refresh</Button>
    </div>
  )
}

