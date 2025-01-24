'use client'

import React, { useEffect, useState } from 'react'
import { getRecentErrors } from '@/lib/error-logging'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ErrorLogEntry = {
  id: string
  user_id: string
  timestamp: string
  error_message: string
  context: {
    platform?: string
    postId?: string
    action?: string
  }
}

export function RecentErrors({ userId }: { userId: string }) {
  const [errors, setErrors] = useState<ErrorLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchErrors() {
      setIsLoading(true)
      const recentErrors = await getRecentErrors(userId)
      setErrors(recentErrors)
      setIsLoading(false)
    }

    fetchErrors()
  }, [userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Errors</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading recent errors...</p>
        ) : errors.length > 0 ? (
          <ul className="space-y-4">
            {errors.map((error) => (
              <li key={error.id} className="border-b pb-2">
                <p className="font-medium">{error.error_message}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(error.timestamp).toLocaleString()}
                </p>
                <div className="mt-1">
                  {error.context.platform && (
                    <Badge variant="outline" className="mr-2">
                      {error.context.platform}
                    </Badge>
                  )}
                  {error.context.action && (
                    <Badge variant="outline">
                      {error.context.action}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent errors found.</p>
        )}
      </CardContent>
    </Card>
  )
}

