import { createClient } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailNotification {
  profiles: any
  id: string
  user_id: string
  type: string
  data: any
  status: 'pending' | 'sent' | 'failed'
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
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

export const sendEmail = async (options: EmailOptions) => {
  // Ensure that the options parameter is used correctly
  // ... existing code
}

