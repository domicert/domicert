import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { paymentMethodId } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: realtor } = await supabase
      .from('realtors')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!realtor?.stripe_customer_id) return NextResponse.json({ error: 'No customer found' }, { status: 404 })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: realtor.stripe_customer_id,
      items: [{ price: process.env.STRIPE_REALTOR_PRICE_ID! }],
      default_payment_method: paymentMethodId,
    })

    // Update realtor record
    await supabase
      .from('realtors')
      .update({
        subscription_status: 'active',
        subscription_id: subscription.id,
      })
      .eq('id', realtor.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Confirm subscription error:', err)
    return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 })
  }
}