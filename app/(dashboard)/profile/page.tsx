'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Company {
  id: string
  name: string
  email: string
  phone: string
  license_number: string
  website_url: string
  address_line1: string
  city: string
  province_state: string
  postal_zip: string
  country: string
  accent_color: string
  default_disclaimer: string
  logo_storage_path: string | null
  inspection_count: number
  profile_public: boolean
  is_solo_operator: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<{id: string, email?: string | null, user_metadata?: {first_name?: string, last_name?: string}} | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'company' | 'branding' | 'account'>('company')

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return

      const { data: memberData } = await supabase
        .from('company_members')
        .select('company_id, companies(*)')
        .eq('user_id', user.id)
        .single()

      if (memberData?.companies) {
        const companyData = memberData.companies as unknown as Company
        setCompany(companyData)

        // Generate signed URL for logo if exists
        if (companyData.logo_storage_path) {
          const { data: signedData } = await supabase.storage
            .from('company-assets')
            .createSignedUrl(companyData.logo_storage_path, 3600)
          if (signedData?.signedUrl) {
            setLogoPreview(signedData.signedUrl)
          }
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const updateCompany = (field: string, value: string | boolean) => {
    setCompany(prev => prev ? { ...prev, [field]: value } : prev)
    setSaved(false)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo must be under 5MB')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!company || !user) return
    setSaving(true)
    setError(null)
    try {
      let logoPath = company.logo_storage_path

      // Upload logo if changed
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `logos/${company.id}/logo.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('company-assets')
          .upload(path, logoFile, { upsert: true })
        if (uploadError) throw new Error(`Logo upload failed: ${uploadError.message}`)
        logoPath = path
      }

      // Update company record
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: company.name,
          email: company.email,
          phone: company.phone,
          license_number: company.license_number,
          website_url: company.website_url,
          address_line1: company.address_line1,
          city: company.city,
          province_state: company.province_state,
          postal_zip: company.postal_zip,
          country: company.country,
          accent_color: company.accent_color,
          default_disclaimer: company.default_disclaimer,
          profile_public: company.profile_public,
          logo_storage_path: logoPath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id)

      if (updateError) throw new Error(updateError.message)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  const firstName = user?.user_metadata?.first_name || ''
  const lastName = user?.user_metadata?.last_name || ''

  // Generate initials avatar if no logo
  const initials = company?.name
    ? company.name.split(' ').map(w => w[0]).slice(0, 3).join('').toUpperCase()
    : 'DC'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</Link>
            <Link href="/inspections/new" className="text-sm text-gray-500 hover:text-gray-900">New inspection</Link>
            <Link href="/profile" className="text-sm text-[#1D9E75] font-medium">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Company profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              This information appears on every report you send
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Saved</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Profile card at top */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-6">
            {/* Logo / avatar */}
            <div className="relative">
              {logoPreview || company?.logo_storage_path ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={logoPreview || '/brand/domicert-mark.svg'}
                    alt="Company logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: company?.accent_color || '#1D9E75' }}
                >
                  {initials}
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm">
                <span className="text-xs">📷</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1">
              <div className="text-lg font-medium text-gray-900">{company?.name}</div>
              <div className="text-sm text-gray-500 mt-0.5">{user?.email}</div>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                  {company?.is_solo_operator ? 'Independent inspector' : 'Company account'}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {company?.inspection_count || 0} inspections
                </span>
                {company?.profile_public && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                    Public profile active
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Inspector</div>
              <div className="text-sm font-medium text-gray-900">{firstName} {lastName}</div>
              {company?.license_number && (
                <div className="text-xs text-gray-500 mt-0.5">{company.license_number}</div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'company', label: 'Company details' },
            { id: 'branding', label: 'Branding' },
            { id: 'account', label: 'Account' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Company details tab */}
        {activeTab === 'company' && company && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Business information</h2>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Company name</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={e => updateCompany('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Business email</label>
                  <input
                    type="email"
                    value={company.email || ''}
                    onChange={e => updateCompany('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Business phone</label>
                  <input
                    type="tel"
                    value={company.phone || ''}
                    onChange={e => updateCompany('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">License / certification #</label>
                  <input
                    type="text"
                    value={company.license_number || ''}
                    onChange={e => updateCompany('license_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                    placeholder="OCHI-12345"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Website (optional)</label>
                  <input
                    type="url"
                    value={company.website_url || ''}
                    onChange={e => updateCompany('website_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Business address</h2>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Street address</label>
                <input
                  type="text"
                  value={company.address_line1 || ''}
                  onChange={e => updateCompany('address_line1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">City</label>
                  <input
                    type="text"
                    value={company.city || ''}
                    onChange={e => updateCompany('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Province / State</label>
                  <select
                    value={company.province_state || ''}
                    onChange={e => updateCompany('province_state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white"
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
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Postal / ZIP</label>
                  <input
                    type="text"
                    value={company.postal_zip || ''}
                    onChange={e => updateCompany('postal_zip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Country</label>
                <select
                  value={company.country || 'CA'}
                  onChange={e => updateCompany('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white"
                >
                  <option value="CA">Canada</option>
                  <option value="US">United States</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-gray-900">Public profile</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Show your company on the Domicert inspector directory with a link to your website
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={company.profile_public}
                    onChange={e => updateCompany('profile_public', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1D9E75]"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Branding tab */}
        {activeTab === 'branding' && company && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Company logo</h2>
              <div className="flex items-start gap-6">
                <div>
                  {logoPreview || company.logo_storage_path ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={logoPreview || ''}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-24 h-24 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: company.accent_color || '#1D9E75' }}
                    >
                      {initials}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 text-center">Current logo</p>
                </div>
                <div className="flex-1">
                  <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#1D9E75] transition-colors">
                    <div className="text-2xl mb-2">📷</div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Upload new logo</div>
                    <div className="text-xs text-gray-400">PNG or JPG, max 5MB</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Appears on every inspection report cover page
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  {logoFile && (
                    <p className="text-xs text-green-600 mt-2">✓ {logoFile.name} ready to upload — click Save changes</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Brand color</h2>
              <p className="text-xs text-gray-500 mb-4">
                Used for your default logo initials and report accents when no logo is uploaded
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={company.accent_color || '#1D9E75'}
                  onChange={e => updateCompany('accent_color', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={company.accent_color || '#1D9E75'}
                  onChange={e => updateCompany('accent_color', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#1D9E75] text-gray-900"
                />
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: company.accent_color || '#1D9E75' }}
                >
                  {initials.slice(0, 2)}
                </div>
                <span className="text-xs text-gray-400">Preview</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-2">Default disclaimer</h2>
              <p className="text-xs text-gray-500 mb-4">
                Appears at the bottom of every report. Can be customized per inspection.
              </p>
              <textarea
                value={company.default_disclaimer || ''}
                onChange={e => updateCompany('default_disclaimer', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 resize-none"
              />
            </div>
          </div>
        )}

        {/* Account tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Account details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">First name</label>
                  <input
                    type="text"
                    defaultValue={firstName}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Last name</label>
                  <input
                    type="text"
                    defaultValue={lastName}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email address</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed — contact support if needed</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-2">Change password</h2>
              <p className="text-xs text-gray-500 mb-4">
                Leave blank to keep your current password
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">New password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Confirm new password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-1">Your plan</h2>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                  Free period active
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                You are currently in your free trial period. Per-report fees will apply after your trial ends based on the tier you select for each inspection.
              </p>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[
                  { tier: 'Text', price: '$10', photos: 'No photos' },
                  { tier: 'Basic', price: '$15', photos: '1–5 photos' },
                  { tier: 'Pro', price: '$20', photos: '6–15 photos' },
                  { tier: 'Pro+', price: '$25', photos: '16–30 photos' },
                  { tier: 'Unlimited', price: '$35+', photos: '31+ photos' },
                ].map(t => (
                  <div key={t.tier} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-1">{t.tier}</div>
                    <div className="text-[#1D9E75] font-medium">{t.price}</div>
                    <div className="text-gray-400 mt-1">{t.photos}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h2 className="font-medium text-red-700 mb-2">Danger zone</h2>
              <p className="text-xs text-red-600 mb-4">
                Cancelling your account will deactivate your login. Your inspection records and reports will remain in the Domicert database and may still generate marketplace revenue paid to you at the email on file.
              </p>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors">
                Cancel account
              </button>
            </div>
          </div>
        )}

        {/* Save button at bottom */}
        <div className="mt-6 flex justify-end gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium self-center">✓ All changes saved</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </main>
  )
}