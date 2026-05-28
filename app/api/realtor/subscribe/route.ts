import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: realtor } = await supabase
      .from('realtors')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!realtor) return NextResponse.json({ error: 'Realtor not found' }, { status: 404 })

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: realtor.email || user.email || '',
      name: `${realtor.first_name} ${realtor.last_name}`,
      metadata: { realtor_id: realtor.id },
    })

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    })

    // Save customer ID
    await supabase
      .from('realtors')
      .update({ stripe_customer_id: customer.id })
      .eq('id', realtor.id)

    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}