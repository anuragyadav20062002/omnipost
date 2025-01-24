'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UTCClock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toUTCString())
    }

    updateTime() // Set initial time
    const timer = setInterval(updateTime, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Current UTC Time</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{time || 'Loading...'}</p>
      </CardContent>
    </Card>
  )
}

