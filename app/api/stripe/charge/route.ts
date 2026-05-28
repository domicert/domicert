import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const TIER_PRICES: Record<string, number> = {
  text: 1000,      // $10.00
  basic: 1500,     // $15.00
  pro: 2000,       // $20.00
  pro_plus: 2500,  // $25.00
  unlimited: 3500, // $35.00
}

export async function POST(request: NextRequest) {
  try {
    const { inspectionId, tier, companyId } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get company stripe customer id
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_customer_id, name, email')
      .eq('id', companyId)
      .single()

    if (!company?.stripe_customer_id) {
      return NextResponse.json({ error: 'No payment method on file' }, { status: 400 })
    }

    // Get default payment method
    const customer = await stripe.customers.retrieve(company.stripe_customer_id) as Stripe.Customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: company.stripe_customer_id,
      type: 'card',
    })

    if (!paymentMethods.data.length) {
      return NextResponse.json({ error: 'No payment method found' }, { status: 400 })
    }

    const amount = TIER_PRICES[tier] || TIER_PRICES.pro
    const paymentMethod = paymentMethods.data[0]

    // Create and confirm payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      customer: company.stripe_customer_id,
      payment_method: paymentMethod.id,
      confirm: true,
      off_session: true,
      description: `Domicert inspection report - ${tier} tier`,
      metadata: {
        inspection_id: inspectionId,
        company_id: companyId,
        tier,
      },
    })

    // Record the charge in database
    await supabase
      .from('companies')
      .update({
        [`last_charge_at`]: new Date().toISOString(),
      })
      .eq('id', companyId)

    return NextResponse.json({
      success: true,
      chargeId: paymentIntent.id,
      amount: amount / 100,
    })

  } catch (err) {
    console.error('Charge error:', err)
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Charge failed' }, { status: 500 })
  }
}