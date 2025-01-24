import React from 'react'
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'warning' | 'error' | 'success'
  message: string
  actionLink?: string
  actionText?: string
}

interface NotificationsPanelProps {
  notifications: Notification[]
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification.id} className="flex items-start space-x-2">
              {notification.type === 'warning' && (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              {notification.type === 'error' && (
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              {notification.type === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              )}
              <div className="flex-grow">
                <p className="text-sm">{notification.message}</p>
                {notification.actionLink && notification.actionText && (
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href={notification.actionLink}>
                      {notification.actionText}
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

