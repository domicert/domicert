'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function SurveyPage() {
  const params = useParams()
  const token = params.token as string

  const [survey, setSurvey] = useState<{id: string, completed_at: string | null} | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [ratings, setRatings] = useState({
    domicert_rating: 0,
    inspector_rating: 0,
    timely_delivery: null as boolean | null,
    would_recommend: '' as 'yes' | 'maybe' | 'no' | '',
    comments: '',
  })

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('id, completed_at, token_expires_at')
        .eq('token', token)
        .single()

      if (error || !data) {
        setError('Survey not found or link has expired.')
      } else if (data.completed_at) {
        setSubmitted(true)
      } else {
        setSurvey(data)
      }
      setLoading(false)
    }
    load()
  }, [token])

  const handleSubmit = async () => {
    if (!survey) return
    if (ratings.domicert_rating === 0 || ratings.inspector_rating === 0) {
      setError('Please rate both your Domicert experience and your inspector')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('surveys')
        .update({
          domicert_rating: ratings.domicert_rating,
          inspector_rating: ratings.inspector_rating,
          timely_delivery: ratings.timely_delivery,
          would_recommend: ratings.would_recommend || null,
          comments: ratings.comments || null,
          completed_at: new Date().toISOString(),
        })
        .eq('id', survey.id)

      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-2xl transition-transform hover:scale-110 ${
            star <= value ? 'text-yellow-400' : 'text-gray-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Image src="/brand/domicert-mark.svg" alt="Domicert" width={48} height={48} className="mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 mb-2">Thank you for your feedback!</h1>
          <p className="text-gray-500 text-sm">
            Your response helps us improve Domicert for inspectors and homeowners across Canada.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Image src="/brand/domicert-mark.svg" alt="Domicert" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-xl font-medium text-gray-900 mb-2">How was your inspection?</h1>
          <p className="text-gray-500 text-sm">4 quick questions — takes about 60 seconds</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-1">
              How satisfied were you with your Domicert report experience?
            </h2>
            <p className="text-xs text-gray-500 mb-4">The report format, delivery, and web portal</p>
            <StarRating
              value={ratings.domicert_rating}
              onChange={v => setRatings(r => ({ ...r, domicert_rating: v }))}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-1">
              How would you rate the professionalism of your inspector?
            </h2>
            <p className="text-xs text-gray-500 mb-4">Communication, thoroughness, and conduct</p>
            <StarRating
              value={ratings.inspector_rating}
              onChange={v => setRatings(r => ({ ...r, inspector_rating: v }))}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-3">
              Was your report delivered in a timely manner?
            </h2>
            <div className="flex gap-3">
              {[
                { value: true, label: '✓ Yes' },
                { value: false, label: '✗ No' },
              ].map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => setRatings(r => ({ ...r, timely_delivery: value }))}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                    ratings.timely_delivery === value
                      ? 'border-[#1D9E75] bg-green-50 text-[#1D9E75]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-3">
              Would you recommend Domicert to a friend or family member?
            </h2>
            <div className="flex gap-3">
              {[
                { value: 'yes', label: '👍 Yes' },
                { value: 'maybe', label: '🤔 Maybe' },
                { value: 'no', label: '👎 No' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setRatings(r => ({ ...r, would_recommend: value as 'yes' | 'maybe' | 'no' }))}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                    ratings.would_recommend === value
                      ? 'border-[#1D9E75] bg-green-50 text-[#1D9E75]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-1">
              Any additional comments? <span className="text-gray-400 font-normal">(optional)</span>
            </h2>
            <textarea
              value={ratings.comments}
              onChange={e => setRatings(r => ({ ...r, comments: e.target.value }))}
              rows={3}
              placeholder="Tell us about your experience..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400 resize-none mt-3"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit feedback →'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Your feedback is anonymous to the public · Domicert · Certified · Lasting · Trusted
          </p>
        </div>
      </div>
    </main>
  )
}