import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get company
    const { data: memberData } = await supabase
      .from('company_members')
      .select('company_id, companies(id, name, email, stripe_customer_id)')
      .eq('user_id', user.id)
      .single()

    const company = memberData?.companies as unknown as {
      id: string
      name: string
      email: string
      stripe_customer_id: string | null
    }

    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    // Create or retrieve Stripe customer
    let customerId = company.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: company.email || user.email || '',
        name: company.name,
        metadata: { company_id: company.id },
      })
      customerId = customer.id

      await supabase
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', company.id)
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret })

  } catch (err) {
    console.error('Stripe setup error:', err)
    return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 })
  }
}