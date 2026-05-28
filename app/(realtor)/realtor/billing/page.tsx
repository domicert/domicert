'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function SubscriptionForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/realtor/subscribe', { method: 'POST' })
      const { clientSecret, error: apiError } = await response.json()
      if (apiError) throw new Error(apiError)

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      })

      if (stripeError) throw new Error(stripeError.message)

      await fetch('/api/realtor/confirm-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: setupIntent?.payment_method }),
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <CardElement options={{ style: { base: { fontSize: '14px', color: '#111827', '::placeholder': { color: '#9CA3AF' } } } }} />
      </div>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
      <button
        onClick={handleSubmit}
        disabled={loading || !stripe}
        className="w-full py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] disabled:opacity-50"
      >
        {loading ? 'Activating...' : 'Activate subscription — $100/month →'}
      </button>
    </div>
  )
}

export default function RealtorBillingPage() {
  const [activated, setActivated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [alreadyActive, setAlreadyActive] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: realtor } = await supabase
        .from('realtors')
        .select('subscription_status')
        .eq('user_id', user.id)
        .single()
      if (realtor?.subscription_status === 'active') setAlreadyActive(true)
      setLoading(false)
    }
    check()
  }, [])

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400 text-sm">Loading...</div></div>

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-lg mx-auto px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Activate realtor access</h1>
          <p className="text-gray-500 text-sm">$100/month — unlimited property history searches</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activated || alreadyActive ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-medium text-gray-900 mb-2">Subscription active!</h2>
              <p className="text-sm text-gray-500 mb-4">You now have full access to property history search.</p>
              <Link href="/realtor/dashboard" className="text-sm text-[#1D9E75] hover:underline">Go to dashboard →</Link>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <SubscriptionForm onSuccess={() => setActivated(true)} />
            </Elements>
          )}
        </div>
      </div>
    </main>
  )
}