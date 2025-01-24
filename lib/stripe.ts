import Stripe from 'stripe'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

const supabase = createClientComponentClient<Database>()
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const createOrRetrieveCustomer = async (userId: string, email: string) => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (subscription && subscription.stripe_customer_id) {
    return subscription.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabaseUUID: userId,
    },
  })

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customer.id,
    })

  return customer.id
}

