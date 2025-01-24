// import { NextResponse } from 'next/server'
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { whopServer } from '@/lib/whop'

// export async function GET(req: Request) {
//   const supabase = createServerComponentClient({ cookies })
//   const { data: { user } } = await supabase.auth.getUser()

//   if (!user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   try {
//     const { data: profile } = await supabase
//       .from('profiles')
//       .select('subscription_id')
//       .eq('id', user.id)
//       .single()

//     if (!profile?.subscription_id) {
//       return NextResponse.json({ plan_type: 'basic' })
//     }

//     const membership = await whopServer.memberships.get(profile.subscription_id)

//     return NextResponse.json({
//       plan_type: membership.product?.metadata?.plan_type || 'basic',
//       status: membership.status
//     })
//   } catch (error) {
//     console.error('Error checking subscription:', error)
//     return NextResponse.json({ error: 'Failed to check subscription' }, { status: 500 })
//   }
// }

