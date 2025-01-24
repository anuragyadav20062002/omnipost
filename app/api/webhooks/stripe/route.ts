import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { Database } from '@/types/database'
import Stripe from 'stripe'

const relevantEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('Stripe-Signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) return
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (relevantEvents.has(event.type)) {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies })

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionChange(subscription, supabase)
          break
        default:
          throw new Error('Unhandled relevant event!')
      }
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { error: 'Webhook handler failed.' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0].price.id
  const status = subscription.status

  const { data: userData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!userData) {
    throw new Error('User not found')
  }

  const userId = userData.user_id

  // Determine the plan type based on the price ID
  const planType = priceId === process.env.STRIPE_BASIC_PRICE_ID ? 'basic' : 'pro'

  // Update subscriptions table
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan_type: planType,
      status: status,
      is_active: status === 'active',
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      end_date: new Date(subscription.current_period_end * 1000).toISOString(),
    })
}

