import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET!

export async function POST(req: Request) {
const body = await req.text()
const signature = req.headers.get('whop-signature')

if (!signature) {
 return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
}

const hmac = crypto.createHmac('sha256', WHOP_WEBHOOK_SECRET)
const digest = hmac.update(body).digest('hex')

if (signature !== digest) {
 return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}

const event = JSON.parse(body)

const supabase = createServerComponentClient({ cookies })

switch (event.event) {
 case 'membership.created':
 case 'membership.updated':
   // Update user's subscription status
   await supabase
     .from('profiles')
     .update({ 
       plan_type: event.data.product.metadata.plan_type,
       subscription_id: event.data.id
     })
     .eq('id', event.data.custom.user_id)
   break
 case 'membership.cancelled':
 case 'membership.expired':
   // Update user's subscription status to 'basic'
   await supabase
     .from('profiles')
     .update({ 
       plan_type: 'basic',
       subscription_id: null
     })
     .eq('id', event.data.custom.user_id)
   break
 // Add more cases as needed
}

return NextResponse.json({ received: true })
}

