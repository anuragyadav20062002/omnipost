import { createClient } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Define a specific type for profiles
interface Profile {
  email: string;
  // Add other relevant fields as necessary
}

// Define a specific type for the data field
interface NotificationData {
  platform?: string;
  result?: string;
  error?: string;
  percentage?: number;
  type?: string;
  // Add other relevant fields as necessary
}

interface EmailNotification {
  profiles: Profile; // Updated type
  id: string;
  user_id: string;
  type: string;
  data: NotificationData; // Updated type
  status: 'pending' | 'sent' | 'failed';
}

export async function processEmailNotifications() {
  const supabase = createClient()

  while (true) {
    try {
      // Get pending notifications
      const { data: notifications, error } = await supabase
        .from('email_notifications')
        .select('*, profiles!inner(*)')
        .eq('status', 'pending')
        .limit(50)

      if (error) throw error

      if (!notifications || notifications.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 30000))
        continue
      }

      // Process each notification
      for (const notification of notifications) {
        try {
          await sendEmail(notification)
          
          // Mark as sent
          await supabase
            .from('email_notifications')
            .update({ status: 'sent' })
            .eq('id', notification.id)

        } catch (error) {
          console.error(`Error sending notification ${notification.id}:`, error)
          
          // Mark as failed
          await supabase
            .from('email_notifications')
            .update({ 
              status: 'failed',
              data: { ...notification.data, error: (error as Error).message }
            })
            .eq('id', notification.id)
        }
      }
    } catch (error) {
      console.error('Notification processing error:', error)
      await new Promise(resolve => setTimeout(resolve, 60000))
    }
  }
}

export async function sendEmail(notification: EmailNotification) {
  const templates: Record<string, (data: NotificationData) => { subject: string, html: string }> = {
    post_published: (data) => ({
      subject: 'Your post has been published!',
      html: `
        <h1>Post Published Successfully</h1>
        <p>Your post has been published to ${data.platform}.</p>
        <p>${data.result}</p>
      `
    }),
    post_failed: (data) => ({
      subject: 'Post Publishing Failed',
      html: `
        <h1>Post Publishing Failed</h1>
        <p>We were unable to publish your post to ${data.platform}.</p>
        <p>Error: ${data.error}</p>
        <p>Please try again or contact support if the problem persists.</p>
      `
    }),
    usage_limit: (data) => ({
      subject: 'Usage Limit Alert',
      html: `
        <h1>Usage Limit Alert</h1>
        <p>You have reached ${data.percentage}% of your ${data.type} limit.</p>
        <p>Consider upgrading to our Pro plan for higher limits.</p>
      `
    })
  }

  const template = templates[notification.type]
  if (!template) {
    throw new Error(`Unknown notification type: ${notification.type}`)
  }

  const { subject, html } = template(notification.data)

  await resend.emails.send({
    from: 'OmniPost <notifications@omnipost.com>',
    to: notification.profiles.email,
    subject,
    html
  })
}

