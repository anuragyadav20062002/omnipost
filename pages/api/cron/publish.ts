import { startPublishingWorker } from '@/lib/workers/publish-worker'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify the request is from a valid source (e.g., Vercel Cron)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Start the publishing worker
    await startPublishingWorker()
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error in publishing cron job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

