'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/setup', { method: 'POST' })
      const { clientSecret, error: apiError } = await response.json()
      if (apiError) throw new Error(apiError)

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      })

      if (stripeError) throw new Error(stripeError.message)

      // Mark payment method as added
      await fetch('/api/stripe/confirm-setup', { method: 'POST' })
      onSuccess()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#111827',
                '::placeholder': { color: '#9CA3AF' },
              },
            },
          }}
        />
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || !stripe}
        className="w-full py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save payment method →'}
      </button>
    </div>
  )
}

export default function BillingPage() {
  const [saved, setSaved] = useState(false)
  const [alreadyAdded, setAlreadyAdded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: memberData } = await supabase
        .from('company_members')
        .select('company_id, companies(payment_method_added, trial_reports_used)')
        .eq('user_id', user.id)
        .single()

      const company = memberData?.companies as unknown as {
        payment_method_added: boolean
        trial_reports_used: number
      }

      if (company?.payment_method_added) setAlreadyAdded(true)
      setLoading(false)
    }
    check()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Payment method</h1>
          <p className="text-gray-500 text-sm">
            Your card will be charged per report after your free trial ends.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {saved || alreadyAdded ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-medium text-gray-900 mb-2">Payment method saved</h2>
              <p className="text-sm text-gray-500 mb-4">
                You're all set. Reports will be charged automatically after your trial ends.
              </p>
              <Link
                href="/dashboard"
                className="text-sm text-[#1D9E75] hover:underline"
              >
                Back to dashboard →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-medium text-gray-900 mb-1">Add your card</h2>
                <p className="text-xs text-gray-400">
                  Secured by Stripe. Domicert never stores your card details.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Per-report pricing after trial:</h3>
                <div className="space-y-1">
                  {[
                    { tier: 'Text', price: '$10' },
                    { tier: 'Basic', price: '$15' },
                    { tier: 'Pro', price: '$20' },
                    { tier: 'Pro+', price: '$25' },
                    { tier: 'Unlimited', price: '$35' },
                  ].map(({ tier, price }) => (
                    <div key={tier} className="flex justify-between text-xs text-gray-600">
                      <span>{tier}</span>
                      <span className="font-medium">{price} / report</span>
                    </div>
                  ))}
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm onSuccess={() => setSaved(true)} />
              </Elements>
            </>
          )}
        </div>
      </div>
    </main>
  )
}