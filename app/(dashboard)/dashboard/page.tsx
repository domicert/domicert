'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Inspection {
  id: string
  client_name: string
  client_email: string
  inspection_date: string
  status: string
  tier: string
  submitted_at: string
  properties: {
    address_line1: string
    city: string
    province_state: string
  }
  reports: {
    id: string
    web_token: string
    haz_count: number
    def_count: number
    mon_count: number
    ok_count: number
  } | null
}

interface Company {
  name: string
  inspection_count: number
  payment_method_added?: boolean
  trial_reports_used?: number
  trial_reminder_6_sent?: boolean
  trial_reminder_8_sent?: boolean
  trial_reminder_10_sent?: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<{email?: string | null, user_metadata?: {first_name?: string}} | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    revenue: 0,
    purchased: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (!user) return

        // Get company
        const { data: memberData } = await supabase
          .from('company_members')
          .select('company_id, companies(id, name, inspection_count, verification_status, verification_notified_at, license_number, phone, email, website_url, province_state, payment_method_added, trial_reports_used, trial_reminder_6_sent, trial_reminder_8_sent, trial_reminder_10_sent)')
          .eq('user_id', user.id)
          .single()

        if (!memberData?.companies) {
          // Company doesn't exist yet — create it from user metadata
          const meta = user.user_metadata
          const { data: newCompany } = await supabase
            .from('companies')
            .insert({
              owner_user_id: user.id,
              name: meta?.company_name || 'My Company',
              slug: (meta?.company_name || 'my-company').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              email: meta?.company_email || user.email,
              phone: meta?.company_phone || null,
              license_number: meta?.license_number || null,
              website_url: meta?.website_url || null,
              address_line1: meta?.address_line1 || null,
              city: meta?.city || null,
              province_state: meta?.province_state || null,
              postal_zip: meta?.postal_zip || null,
              country: meta?.country || 'CA',
              accent_color: meta?.accent_color || '#1D9E75',
              default_disclaimer: meta?.disclaimer || null,
              verification_status: 'pending',
              inspection_count: 0,
              profile_public: true,
              is_solo_operator: true,
              is_auto_created: false,
            })
            .select()
            .single()

          if (newCompany) {
            await supabase
              .from('company_members')
              .insert({
                company_id: newCompany.id,
                user_id: user.id,
                role: 'owner',
                invite_accepted_at: new Date().toISOString(),
                is_active: true,
              })
            setCompany(newCompany as unknown as Company)
// Move temp logo to permanent path if exists
            if (meta?.temp_logo_path) {
              const ext = meta.temp_logo_path.split('.').pop()
              const finalPath = `logos/${newCompany.id}/logo.${ext}`
              await supabase.storage
                .from('company-assets')
                .move(meta.temp_logo_path, finalPath)
              await supabase
                .from('companies')
                .update({ logo_storage_path: finalPath })
                .eq('id', newCompany.id)
            }
            // Send verification notification
            await fetch(`${window.location.origin}/api/admin/verify-inspector`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                companyId: newCompany.id,
                inspectorName: meta?.first_name
                  ? `${meta.first_name} ${meta.last_name || ''}`.trim()
                  : user.email,
                companyName: newCompany.name,
                email: newCompany.email || user.email,
                phone: newCompany.phone || 'Not provided',
                website: newCompany.website_url || 'Not provided',
                provinceState: newCompany.province_state || 'Not provided',
                licenseNumber: newCompany.license_number || 'Not provided',
                regulatorHtml: newCompany.license_number
                  ? `<p>License number provided: <strong>${newCompany.license_number}</strong></p>`
                  : `<p>No license number provided.</p>`,
              }),
            })

            await supabase
              .from('companies')
              .update({ verification_notified_at: new Date().toISOString() })
              .eq('id', newCompany.id)
          }
        } else {
          const companyData = memberData.companies as unknown as Company & {
            id: string
            verification_notified_at: string | null
            verification_status: string
            license_number: string
            phone: string
            email: string
            website_url: string
            province_state: string
          }
          setCompany(companyData)

          // Send verification notification if not yet sent
          if (companyData && !companyData.verification_notified_at) {
            await fetch(`${window.location.origin}/api/admin/verify-inspector`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                companyId: memberData.company_id,
                inspectorName: user.user_metadata?.first_name
                  ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
                  : user.email,
                companyName: companyData.name,
                email: companyData.email || user.email,
                phone: companyData.phone || 'Not provided',
                website: companyData.website_url || 'Not provided',
                provinceState: companyData.province_state || 'Not provided',
                licenseNumber: companyData.license_number || 'Not provided',
                regulatorHtml: companyData.license_number
                  ? `<p>License number provided: <strong>${companyData.license_number}</strong></p>`
                  : `<p>No license number provided.</p>`,
              }),
            })

            await supabase
              .from('companies')
              .update({ verification_notified_at: new Date().toISOString() })
              .eq('id', memberData.company_id)
          }
        }

        // Get inspections with property and report data
        const { data: inspectionData } = await supabase
          .from('inspections')
          .select(`
            id,
            client_name,
            client_email,
            inspection_date,
            status,
            tier,
            submitted_at,
            properties (
              address_line1,
              city,
              province_state
            ),
            reports (
              id,
              web_token,
              haz_count,
              def_count,
              mon_count,
              ok_count
            )
          `)
          .eq('inspector_user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(10)

        if (inspectionData) {
          setInspections(inspectionData as unknown as Inspection[])

          // Calculate stats
          const now = new Date()
          const thisMonth = inspectionData.filter(i => {
            const date = new Date(i.submitted_at)
            return date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear()
          }).length

          setStats({
            total: inspectionData.length,
            thisMonth,
            revenue: 0,
            purchased: 0,
          })
        }
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])
const handleResend = async (
    inspectionId: string,
    clientEmail: string,
    clientName: string,
    address: string
  ) => {
    if (!confirm(`Resend the report to ${clientEmail}?`)) return
    try {
      const response = await fetch('/api/inspections/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId, clientEmail, clientName, address }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      alert(`Report resent to ${clientEmail}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Resend failed')
    }
  }
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  const firstName = user?.user_metadata?.first_name || 'there'
  const companyName = company?.name || 'Your Company'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-[#1D9E75] font-medium">Dashboard</Link>
            <Link href="/inspections/new" className="text-sm text-gray-500 hover:text-gray-900">New inspection</Link>
            <Link href="/profile" className="text-sm text-gray-500 hover:text-gray-900">Profile</Link>
            <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-gray-600">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
       {/* Trial banners */}
        {company && (
          <>
            {(company.trial_reports_used || 0) >= 10 && !company.payment_method_added && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-medium text-red-800 text-sm">Free trial complete</div>
                  <div className="text-xs text-red-600 mt-0.5">Add a payment method to continue submitting reports.</div>
                </div>
                <Link href="/billing" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                  Add payment method →
                </Link>
              </div>
            )}
            {(company.trial_reports_used || 0) === 8 && !company.payment_method_added && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-800 text-sm">2 free reports remaining</div>
                  <div className="text-xs text-yellow-600 mt-0.5">Add your payment method now for uninterrupted service.</div>
                </div>
                <Link href="/billing" className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700">
                  Add card →
                </Link>
              </div>
            )}
            {(company.trial_reports_used || 0) === 6 && !company.payment_method_added && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-800 text-sm">4 free reports remaining</div>
                  <div className="text-xs text-blue-600 mt-0.5">You have 4 reports left in your free trial.</div>
                </div>
                <Link href="/billing" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  View billing →
                </Link>
              </div>
            )}
          </>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{companyName}</p>
          </div>
          <Link
            href="/inspections/new"
            className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
          >
            + New inspection
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-medium text-gray-900 mb-1">{stats.total}</div>
            <div className="text-xs text-gray-500">total inspections</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-medium text-gray-900 mb-1">{stats.thisMonth}</div>
            <div className="text-xs text-gray-500">this month</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-medium text-[#1D9E75] mb-1">${stats.revenue}</div>
            <div className="text-xs text-gray-500">report revenue</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-medium text-gray-900 mb-1">{stats.purchased}</div>
            <div className="text-xs text-gray-500">reports purchased</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent inspections */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900">Recent inspections</h2>
              <Link href="/inspections/new" className="text-sm text-[#1D9E75] hover:underline">
                + New
              </Link>
            </div>

            {inspections.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🏠</div>
                <div className="text-sm font-medium text-gray-700 mb-1">No inspections yet</div>
                <div className="text-xs text-gray-400 mb-4">
                  Start your first inspection to see it here
                </div>
                <Link
                  href="/inspections/new"
                  className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
                >
                  Start first inspection →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {inspections.map(inspection => (
                  <div key={inspection.id} className="py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {inspection.properties?.address_line1}, {inspection.properties?.city}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{inspection.client_name}</span>
                        <span>·</span>
                        <span>{new Date(inspection.inspection_date).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span>·</span>
                        <span className="capitalize">{inspection.tier}</span>
                      </div>
                      {inspection.reports && (
                        <div className="flex items-center gap-2 mt-1">
                          {inspection.reports.haz_count > 0 && (
                            <span className="px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded">
                              {inspection.reports.haz_count} HAZ
                            </span>
                          )}
                          {inspection.reports.def_count > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                              {inspection.reports.def_count} DEF
                            </span>
                          )}
                          {inspection.reports.mon_count > 0 && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                              {inspection.reports.mon_count} MON
                            </span>
                          )}
                          {inspection.reports.haz_count === 0 && inspection.reports.def_count === 0 && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              ✓ Clean
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        inspection.status === 'submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inspection.status}
                      </span>
                      {inspection.reports?.web_token && (
  <div className="flex items-center gap-1">
    <Link
      href={`/report/${inspection.reports.web_token}`}
      className="px-3 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
    >
      view
    </Link>
    <button
      onClick={() => handleResend(inspection.id, inspection.client_email, inspection.client_name, inspection.properties?.address_line1)}
      className="px-3 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
      title="Resend report email"
    >
      resend
    </button>
  </div>
)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Quick actions</h2>
              <div className="flex flex-col gap-2">
                <Link
                  href="/inspections/new"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  <span className="text-lg">📋</span>
                  Start new inspection
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  <span className="text-lg">🏢</span>
                  Update company profile
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  <span className="text-lg">🖼️</span>
                  Upload company logo
                </Link>
                <Link
                  href="/billing"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  <span className="text-lg">💳</span>
                  Manage billing
                </Link>
              </div>
            </div>

            {/* Marketplace */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-2">Marketplace</h2>
              <p className="text-xs text-gray-400 mb-4">
                Historical report purchases appear here once available
              </p>
              <div className="text-center py-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-xs text-gray-400">No activity yet</div>
              </div>
            </div>

            {/* Plan status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-1">Your plan</h2>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                  Free period active
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Submit inspections free during your trial period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}