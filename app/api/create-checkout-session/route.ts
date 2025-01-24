import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe, createOrRetrieveCustomer } from '@/lib/stripe'
import { Database } from '@/types/database'

export async function POST(req: Request) {
  try {
    const { planType } = await req.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const customerId = await createOrRetrieveCustomer(user.id, user.email!)

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: planType === 'pro' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_BASIC_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        metadata: {
          supabaseUUID: user.id,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}

