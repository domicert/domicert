'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ReportData {
  id: string
  haz_count: number
  def_count: number
  mon_count: number
  ok_count: number
  clean_report_badge: boolean
  web_token_expires_at: string
  pdf_storage_path: string
  generated_at: string
  inspections: {
    id: string
    client_name: string
    client_email: string
    inspection_date: string
    tier: string
    floor_count: number
    bedroom_count: number
    full_bath_count: number
    half_bath_count: number
    basement_type: string
    properties: {
      address_line1: string
      city: string
      province_state: string
      postal_zip: string
    }
    companies: {
      name: string
      license_number: string
      phone: string
      email: string
    } | null
    inspection_sections: {
      id: string
      section_label: string
      inspector_notes: string
      checklist_items: {
        id: string
        item_label: string
        rating: string | null
        notes: string
      }[]
    }[]
  }
}

export default function ReportPage() {
  const params = useParams()
  const token = params.token as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tosAccepted, setTosAccepted] = useState(false)
  const [tosChecked, setTosChecked] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data, error: reportError } = await supabase
          .from('reports')
          .select(`
            id,
            haz_count,
            def_count,
            mon_count,
            ok_count,
            clean_report_badge,
            web_token_expires_at,
            pdf_storage_path,
            generated_at,
            inspections (
              id,
              client_name,
              client_email,
              inspection_date,
              tier,
              floor_count,
              bedroom_count,
              full_bath_count,
              half_bath_count,
              basement_type,
              properties (
                address_line1,
                city,
                province_state,
                postal_zip
              ),
              companies (
                name,
                license_number,
                phone,
                email
              ),
              inspection_sections (
                id,
                section_label,
                inspector_notes,
                checklist_items (
                  id,
                  item_label,
                  rating,
                  notes
                )
              )
            )
          `)
          .eq('web_token', token)
          .single()

        if (reportError || !data) {
          setError('Report not found or link has expired.')
          return
        }

        // Check expiry
        const expiry = new Date(data.web_token_expires_at)
        if (expiry < new Date()) {
          setError('This report link has expired. Please contact your inspector to request a new link.')
          return
        }

        setReport(data as unknown as ReportData)

        // Check if TOS already accepted this session
        const accepted = sessionStorage.getItem(`tos_accepted_${token}`)
        if (accepted) setTosAccepted(true)

      } catch (err) {
        setError('Something went wrong loading your report.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [token])

  const handleTosAccept = () => {
    sessionStorage.setItem(`tos_accepted_${token}`, 'true')
    setTosAccepted(true)
  }

  const ratingColor = (rating: string | null) => {
    switch (rating) {
      case 'ok': return 'bg-green-100 text-green-700'
      case 'mon': return 'bg-yellow-100 text-yellow-700'
      case 'def': return 'bg-red-100 text-red-700'
      case 'haz': return 'bg-gray-900 text-white'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const ratingLabel = (rating: string | null) => {
    switch (rating) {
      case 'ok': return 'OK'
      case 'mon': return 'MON'
      case 'def': return 'DEF'
      case 'haz': return 'HAZ'
      default: return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/brand/domicert-mark.svg" alt="Domicert" width={48} height={48} className="mx-auto mb-4" />
          <div className="text-gray-400 text-sm">Loading your report...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-8">
          <Image src="/brand/domicert-mark.svg" alt="Domicert" width={48} height={48} className="mx-auto mb-6" />
          <h1 className="text-xl font-medium text-gray-900 mb-3">Report unavailable</h1>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link href="/" className="text-[#1D9E75] text-sm hover:underline">Return to Domicert →</Link>
        </div>
      </div>
    )
  }

  if (!report) return null

  const inspection = report.inspections
  const property = inspection.properties
  const company = inspection.companies

  // TOS gate
  if (!tosAccepted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={48} height={48} className="mx-auto mb-4" />
            <h1 className="text-xl font-medium text-gray-900 mb-2">Your inspection report is ready</h1>
            <p className="text-gray-500 text-sm">
              {property.address_line1}, {property.city}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-3">Before you view your report</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-xs text-gray-600 leading-relaxed max-h-48 overflow-y-auto">
              <p className="font-medium mb-2">Terms of Access</p>
              <p className="mb-2">This inspection report was prepared exclusively for you by a certified home inspector. By accessing this report you agree to the following:</p>
              <p className="mb-2">1. This report reflects conditions observed at the time of inspection only. Conditions may have changed since the inspection date.</p>
              <p className="mb-2">2. This report does not constitute a warranty, guarantee, or insurance policy of any kind.</p>
              <p className="mb-2">3. This report is for your personal use only. It was prepared for the property address shown above and should not be shared with third parties or used for purposes other than your personal property evaluation.</p>
              <p className="mb-2">4. Your personal information has been securely stored by Domicert. It will never be sold or shared with third parties. If this report is ever accessed as a historical record, your personal details will be removed.</p>
              <p>5. This web link is valid for 2 years from the date of your inspection. Your PDF report was emailed to you separately and is yours to keep permanently.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={tosChecked}
                onChange={e => setTosChecked(e.target.checked)}
                className="w-4 h-4 accent-[#1D9E75] mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-gray-700">
                I have read and agree to the terms above
              </span>
            </label>

            <button
              onClick={handleTosAccept}
              disabled={!tosChecked}
              className="w-full py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
            >
              View my report →
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Powered by Domicert · Certified · Lasting · Trusted
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1D9E75] text-white">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-xs opacity-60 uppercase tracking-widest mb-2">
                Home Inspection Report
              </div>
              <h1 className="text-2xl font-medium mb-1">
                {property.address_line1}
              </h1>
              <p className="opacity-80 text-sm">
                {property.city}, {property.province_state} {property.postal_zip}
              </p>
            </div>
            <Image
              src="/brand/domicert-logo-dark.svg"
              alt="Domicert"
              width={120}
              height={40}
              className="opacity-80"
            />
          </div>

          <div className="flex gap-6 text-xs opacity-75">
            <div>
              <div className="opacity-60 mb-0.5">CLIENT</div>
              <div>{inspection.client_name}</div>
            </div>
            <div>
              <div className="opacity-60 mb-0.5">DATE</div>
              <div>{new Date(inspection.inspection_date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div>
              <div className="opacity-60 mb-0.5">INSPECTOR</div>
              <div>{company?.name || 'Verified Inspector'}</div>
            </div>
            {company?.license_number && company.license_number !== 'N/A' && (
              <div>
                <div className="opacity-60 mb-0.5">LICENSE</div>
                <div>{company.license_number}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Summary counts */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-medium">{report.haz_count}</div>
            <div className="text-xs opacity-70 mt-0.5">Safety hazards</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-medium text-red-700">{report.def_count}</div>
            <div className="text-xs text-red-500 mt-0.5">Defects</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-medium text-yellow-700">{report.mon_count}</div>
            <div className="text-xs text-yellow-600 mt-0.5">Monitor</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-medium text-green-700">{report.ok_count}</div>
            <div className="text-xs text-green-600 mt-0.5">Acceptable</div>
          </div>
        </div>

        {/* Property overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-medium text-gray-900 mb-4">Property overview</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Floors', value: inspection.floor_count },
              { label: 'Bedrooms', value: inspection.bedroom_count },
              { label: 'Full bathrooms', value: inspection.full_bath_count },
              { label: 'Half bathrooms', value: inspection.half_bath_count },
              { label: 'Basement', value: inspection.basement_type === 'none' ? 'None' : inspection.basement_type },
              { label: 'Report tier', value: inspection.tier },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-500 w-32">{label}:</span>
                <span className="text-gray-900 capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issues requiring attention */}
        {(report.haz_count > 0 || report.def_count > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Items requiring attention</h2>
            <div className="space-y-3">
              {inspection.inspection_sections.flatMap(section =>
                section.checklist_items
                  .filter(item => item.rating === 'haz' || item.rating === 'def')
                  .map(item => (
                    <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                      item.rating === 'haz' ? 'border-gray-200 bg-gray-50' : 'border-red-100 bg-red-50'
                    }`}>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${ratingColor(item.rating)}`}>
                        {ratingLabel(item.rating)}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.item_label}</div>
                        <div className="text-xs text-gray-500">{section.section_label}</div>
                        {item.notes && <div className="text-xs text-gray-600 mt-1 italic">{item.notes}</div>}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Full section breakdown */}
        <div className="space-y-4 mb-8">
          {inspection.inspection_sections.map(section => (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="font-medium text-gray-900 text-sm">{section.section_label}</h3>
                <div className="flex gap-1">
                  {section.checklist_items.some(i => i.rating === 'haz') && (
                    <span className="px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded">HAZ</span>
                  )}
                  {section.checklist_items.some(i => i.rating === 'def') && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">DEF</span>
                  )}
                  {!section.checklist_items.some(i => i.rating === 'haz' || i.rating === 'def') &&
                   section.checklist_items.some(i => i.rating === 'ok') && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">✓ Clean</span>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {section.checklist_items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 mt-0.5 ${ratingColor(item.rating)}`}>
                      {ratingLabel(item.rating)}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{item.item_label}</div>
                      {item.notes && (
                        <div className="text-xs text-gray-500 mt-0.5 italic">{item.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
                {section.inspector_notes && (
                  <div className="px-5 py-3 bg-blue-50">
                    <div className="text-xs font-medium text-blue-700 mb-1">Inspector notes</div>
                    <div className="text-xs text-blue-800">{section.inspector_notes}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={20} height={20} />
            <span className="text-sm text-gray-500">Powered by Domicert</span>
          </div>
          <p className="text-xs text-gray-400 mb-1">
            {company?.name} · {company?.license_number}
          </p>
          <p className="text-xs text-gray-400">
            This report reflects conditions at time of inspection only · domicert.ca
          </p>
        </div>
      </div>
    </main>
  )
}