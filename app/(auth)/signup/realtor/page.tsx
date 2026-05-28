'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RealtorSignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    brokerage: '',
    licenseNumber: '',
    provinceState: 'ON',
  })

  const update = (field: string, value: string) => {
    setFormData(f => ({ ...f, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'realtor',
          }
        }
      })

      if (signUpError) throw signUpError

      if (!data.user) {
        window.location.href = '/signup/confirm'
        return
      }

      // Create realtor record
      await supabase.from('realtors').insert({
        user_id: data.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        brokerage: formData.brokerage,
        license_number: formData.licenseNumber,
        province_state: formData.provinceState,
      })

      window.location.href = '/signup/confirm'

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={48} height={48} className="mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Realtor access</h1>
          <p className="text-gray-500 text-sm">Search property inspection history across Canada</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  step >= s ? 'bg-[#1D9E75] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 2 && <div className={`h-0.5 w-8 ${step > s ? 'bg-[#1D9E75]' : 'bg-gray-200'}`} />}
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-2">
              {step === 1 ? 'Account details' : 'Professional info'}
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Step 1 — Account */}
          {step === 1 && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => update('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => update('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => update('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  placeholder="jane@brokerage.com"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => update('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  placeholder="••••••••"
                />
              </div>
              <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => update('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  placeholder="613-555-0100"
                />
              </div>
              <button
                onClick={() => {
                  if (!formData.firstName || !formData.email || !formData.password) {
                    setError('Please fill in all required fields')
                    return
                  }
                  setError(null)
                  setStep(2)
                }}
                className="w-full py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Professional info */}
          {step === 2 && (
            <div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Brokerage name</label>
                <input
                  type="text"
                  value={formData.brokerage}
                  onChange={e => update('brokerage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  placeholder="RE/MAX Ottawa"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Realtor license number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={e => update('licenseNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  placeholder="RECO-12345"
                />
              </div>
              <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-1">Province / State</label>
                <select
                  value={formData.provinceState}
                  onChange={e => update('provinceState', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                >
                  <optgroup label="Canada">
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">PEI</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                  </optgroup>
                  <optgroup label="United States">
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="IL">Illinois</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="WA">Washington</option>
                  </optgroup>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 mb-6">
                <strong>$100/month</strong> subscription gives you unlimited access to search property inspection history across Canada. Your card will be charged after your account is activated.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Are you a home inspector? <Link href="/signup" className="text-[#1D9E75] hover:underline">Sign up here</Link>
        </p>
      </div>
    </main>
  )
}