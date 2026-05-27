'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getRegulatoryInfo, REGULATORY_DATA } from '@/lib/regulatory'

type AccountType = 'inspector' | 'realtor' | null

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<AccountType>(null)
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [tempLogoPath, setTempLogoPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    // Step 2
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    licenseNumber: '',
    addressLine1: '',
    city: '',
    provinceState: '',
    postalZip: '',
    country: 'CA',
    website: '',
    // Step 3
    accentColor: '#1D9E75',
    disclaimer: 'This report was prepared by a certified home inspector and reflects conditions observed at the time of inspection only. It does not constitute a warranty or guarantee.',
    // Step 4
    hasteam: false,
    teamEmails: '',
  })

  const update = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Auto-fill company name from first/last name
    if (field === 'firstName' || field === 'lastName') {
      const first = field === 'firstName' ? value : formData.firstName
      const last = field === 'lastName' ? value : formData.lastName
      setFormData(prev => ({
        ...prev,
        [field]: value,
        companyName: `${first} ${last} Inspections`.trim()
      }))
    }
  }

  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: accountType,
            company_name: formData.companyName,
            company_email: formData.companyEmail || formData.email,
            company_phone: formData.companyPhone,
            license_number: formData.licenseNumber,
            website_url: formData.website,
            address_line1: formData.addressLine1,
            city: formData.city,
            province_state: formData.provinceState,
            postal_zip: formData.postalZip,
            country: formData.country,
            accent_color: formData.accentColor,
            disclaimer: formData.disclaimer,
            temp_logo_path: tempLogoPath,
          }
        }
      })
      if (signUpError) throw signUpError
     if (!data.user) {
        // Email confirmation required - redirect to confirm page
        window.location.href = '/signup/confirm'
        return
      }

      // 2. Create company record
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          owner_user_id: data.user.id,
          name: formData.companyName,
          email: formData.companyEmail || formData.email,
          phone: formData.companyPhone,
          license_number: formData.licenseNumber,
          website_url: formData.website,
          address_line1: formData.addressLine1,
          city: formData.city,
          province_state: formData.provinceState,
          postal_zip: formData.postalZip,
          country: formData.country,
          accent_color: formData.accentColor,
          default_disclaimer: formData.disclaimer,
          is_auto_created: false,
          is_solo_operator: !formData.hasteam,
          profile_public: true,
          inspection_count: 0,
          verification_status: 'pending',
        })
        .select()
        .single()

      if (companyError) throw new Error(`Company error: ${companyError.message}`)

      // 3. Create company member record linking user to company
        const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: data.user.id,
          role: 'owner',
          invite_accepted_at: new Date().toISOString(),
          is_active: true,
        })

      if (memberError) throw new Error(`Member error: ${memberError.message}`)

      // Send verification notification to admin
      const regInfo = REGULATORY_DATA[formData.provinceState]
      const regulatorHtml = regInfo?.licenseRequired
        ? `<p><strong>Regulator:</strong> ${regInfo.regulatorName}</p>
           <p><strong>Verify at:</strong> <a href="${regInfo.regulatorUrl}">${regInfo.regulatorUrl}</a></p>`
        : `<p><strong>No mandatory licensing</strong> in ${regInfo?.region || formData.provinceState}.</p>
           <p>Please manually review their business name, website, and professional background.</p>`

      await fetch(`${window.location.origin}/api/admin/verify-inspector`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          inspectorName: `${formData.firstName} ${formData.lastName}`,
          companyName: formData.companyName,
          email: formData.email,
          phone: formData.companyPhone,
          website: formData.website,
          provinceState: formData.provinceState,
          licenseNumber: formData.licenseNumber,
          regulatorHtml,
        }),
      })

      // 4. Send team invites if needed
      if (formData.hasteam && formData.teamEmails) {
        const emails = formData.teamEmails
          .split('\n')
          .map((e: string) => e.trim())
          .filter((e: string) => e.includes('@'))
        
        // Store invite tokens for each email — we'll build the invite flow later
        console.log('Team invites to send:', emails)
      }

      window.location.href = '/dashboard'

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
          <span className="font-medium text-gray-900">Domicert</span>
        </Link>
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-[#1D9E75] hover:underline">Log in</Link>
        </p>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-12">

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s < step ? 'bg-[#1D9E75] text-white' :
                s === step ? 'bg-[#1D9E75] text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-0.5 transition-colors ${
                  s < step ? 'bg-[#1D9E75]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="flex justify-between text-xs text-gray-400 mb-8 px-1">
          <span className={step >= 1 ? 'text-[#1D9E75]' : ''}>Account</span>
          <span className={step >= 2 ? 'text-[#1D9E75]' : ''}>Company</span>
          <span className={step >= 3 ? 'text-[#1D9E75]' : ''}>Branding</span>
          <span className={step >= 4 ? 'text-[#1D9E75]' : ''}>Team</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STEP 1 — Account basics */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-xl font-medium text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500 mb-6">Choose your account type to get started</p>

            {/* Account type selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setAccountType('inspector')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  accountType === 'inspector'
                    ? 'border-[#1D9E75] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🏠</div>
                <div className="font-medium text-gray-900 text-sm">Inspector</div>
                <div className="text-xs text-gray-500 mt-1">Run inspections, generate reports</div>
              </button>
              <button
                onClick={() => setAccountType('realtor')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  accountType === 'realtor'
                    ? 'border-[#1D9E75] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🔑</div>
                <div className="font-medium text-gray-900 text-sm">Realtor</div>
                <div className="text-xs text-gray-500 mt-1">Search and purchase reports</div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">First name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => update('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Last name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => update('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                  placeholder="Smith"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => update('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                placeholder="jane@company.com"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => update('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-1">Phone number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => update('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                placeholder="(416) 555-0100"
              />
            </div>
            <button
              onClick={() => {
                if (!accountType) { setError('Please select an account type'); return }
                if (!formData.firstName || !formData.email || !formData.password) { setError('Please fill in all required fields'); return }
                setError(null)
                setStep(2)
              }}
              className="w-full py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — Company profile */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-xl font-medium text-gray-900 mb-1">Company details</h1>
            <p className="text-sm text-gray-500 mb-6">This information appears on every report you send</p>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Company name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={e => update('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                placeholder="Smith Home Inspections Ltd."
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Business email</label>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={e => update('companyEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                  placeholder="info@company.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Business phone</label>
                <input
                  type="tel"
                  value={formData.companyPhone}
                  onChange={e => update('companyPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                  placeholder="(416) 555-0100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                {(() => {
                  const regInfo = getRegulatoryInfo(formData.provinceState)
                  return (
                    <>
                      <label className="block text-xs text-gray-500 mb-1">
                        {regInfo?.licenseLabel || 'License / certification #'}
                      </label>
                      {regInfo?.regulatorName && (
                        <p className="text-xs text-blue-600 mb-1">
                          <a href={regInfo.regulatorUrl || '#'} target="_blank" rel="noopener noreferrer" className="underline">{regInfo.regulatorName}</a>
                        </p>
                      )}
                      {formData.provinceState && !regInfo?.licenseRequired && (
                        <p className="text-xs text-gray-400 mb-1">
                          Not required in {regInfo?.region || formData.provinceState}
                        </p>
                      )}
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={e => update('licenseNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                        placeholder={regInfo?.licenseRequired ? 'Required' : 'Optional'}
                      />
                    </>
                  )
                })()}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Website (optional)</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={e => update('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 mb-3">
              ⚠️ By creating an account you confirm that the information provided is accurate. False or misleading information is grounds for immediate account termination and may result in legal action.
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Street address</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={e => update('addressLine1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => update('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                  placeholder="Toronto"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Province / State</label>
                <select
                  value={formData.provinceState}
                  onChange={e => update('provinceState', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] bg-white"
                >
                  <option value="">Select...</option>
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
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Postal / ZIP code</label>
                <input
                  type="text"
                  value={formData.postalZip}
                  onChange={e => update('postalZip', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                  placeholder="M5V 2T6"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={e => update('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] bg-white"
                >
                  <option value="CA">Canada</option>
                  <option value="US">United States</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!formData.companyName) { setError('Please enter your company name'); return }
                  setError(null)
                  setStep(3)
                }}
                className="flex-1 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Branding */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-xl font-medium text-gray-900 mb-1">Logo &amp; branding</h1>
            <p className="text-sm text-gray-500 mb-6">Your logo appears on every report sent to clients</p>

            {/* Logo upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center mb-4 hover:border-[#1D9E75] transition-colors">
              <div className="text-3xl mb-2">📷</div>
              {logoPreview ? (
                <div className="mb-3">
                  <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain mx-auto rounded-lg border border-gray-200" />
                </div>
              ) : null}
              <div className="text-sm font-medium text-gray-700">Upload your company logo</div>
              <div className="text-xs text-gray-400 mt-1">PNG or JPG, max 5MB</div>
              <div className="text-xs text-gray-400 mt-1">A default logo will be generated if you skip this</div>
              <label className="mt-3 px-4 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer inline-block">
                {logoFile ? logoFile.name : 'Choose file'}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setLogoFile(file)
                      setLogoPreview(URL.createObjectURL(file))
                      // Upload to temp path immediately
                      const supabaseClient = createClient()
                      const tempPath = `logos/temp/${Date.now()}-${file.name}`
                      const { error } = await supabaseClient.storage
                        .from('company-assets')
                        .upload(tempPath, file, { upsert: true })
                      if (!error) {
                        setTempLogoPath(tempPath)
                      }
                    }
                  }}
                />
              </label>
            </div>

            {/* Accent color */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Brand accent color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={e => update('accentColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={e => update('accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-1">Default report disclaimer</label>
              <textarea
                value={formData.disclaimer}
                onChange={e => update('disclaimer', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => { setError(null); setStep(4) }}
                className="flex-1 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Team */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-xl font-medium text-gray-900 mb-1">Your team</h1>
            <p className="text-sm text-gray-500 mb-6">Do you have other inspectors you'd like to add?</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => update('hasteam', false)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  !formData.hasteam
                    ? 'border-[#1D9E75] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">👤</div>
                <div className="font-medium text-gray-900 text-sm">Just me</div>
                <div className="text-xs text-gray-500 mt-1">Independent operator</div>
              </button>
              <button
                onClick={() => update('hasteam', true)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  formData.hasteam
                    ? 'border-[#1D9E75] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-medium text-gray-900 text-sm">I have a team</div>
                <div className="text-xs text-gray-500 mt-1">Invite other inspectors</div>
              </button>
            </div>

            {formData.hasteam && (
              <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-1">
                  Team member emails (one per line)
                </label>
                <textarea
                  value={formData.teamEmails}
                  onChange={e => update('teamEmails', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] resize-none"
                  placeholder="inspector2@company.com&#10;inspector3@company.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  They'll receive an email invite to join your company account
                </p>
              </div>
            )}

            {/* TOS */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-xs text-gray-500 leading-relaxed">
              By creating an account you agree to the{' '}
              <Link href="/terms/inspector" className="text-[#1D9E75] hover:underline">
                Domicert Inspector Terms of Service
              </Link>
              {' '}including our data retention, marketplace participation, and revenue sharing policies.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
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

        <p className="text-center text-xs text-gray-400 mt-6">
          Your data is protected under Canadian privacy law (PIPEDA)
        </p>
      </div>
    </main>
  )
}