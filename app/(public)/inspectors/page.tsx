'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Badge {
  badge_code: string
  badge_definitions: {
    name: string
    icon: string
    color: string
    category: string
    sort_order: number
  }
}

interface Inspector {
  id: string
  name: string
  email: string
  phone: string
  license_number: string
  website_url: string
  city: string
  province_state: string
  accent_color: string
  logo_storage_path: string | null
  inspection_count: number
  profile_public: boolean
  created_at: string
  inspector_badges: Badge[]
  avg_rating: number
  review_count: number
  is_verified: boolean
}

const badgeColors: Record<string, { bg: string, border: string, text: string }> = {
  teal: { bg: '#E1F5EE', border: '#1D9E75', text: '#0F6E56' },
  amber: { bg: '#FAEEDA', border: '#BA7517', text: '#854F0B' },
  blue: { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
}

export default function InspectorDirectoryPage() {
  const [inspectors, setInspectors] = useState<Inspector[]>([])
  const [filtered, setFiltered] = useState<Inspector[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          email,
          phone,
          license_number,
          website_url,
          city,
          province_state,
          accent_color,
          logo_storage_path,
          inspection_count,
          profile_public,
          created_at,
          inspector_badges (
            badge_code,
            badge_definitions (
              name,
              icon,
              color,
              category,
              sort_order
            )
          )
        `)
        .eq('profile_public', true)
        .order('inspection_count', { ascending: false })

      if (data) {
        const enriched = await Promise.all(data.map(async (company) => {
          const { data: surveys } = await supabase
            .from('surveys')
            .select('inspector_rating')
            .not('inspector_rating', 'is', null)
            .eq('inspection_id', supabase
              .from('inspections')
              .select('id')
              .eq('company_id', company.id)
            )

          const ratings = surveys?.map(s => s.inspector_rating).filter(Boolean) || []
          const avg = ratings.length > 0
            ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
            : 0

          const hasVerified = company.inspector_badges?.some(
            (b: Badge) => b.badge_code === 'verified_pro'
          )

          return {
            ...company,
            avg_rating: Math.round(avg * 10) / 10,
            review_count: ratings.length,
            is_verified: hasVerified,
          }
        }))

        setInspectors(enriched as unknown as Inspector[])
        setFiltered(enriched as unknown as Inspector[])
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let results = inspectors
    if (search) {
      const q = search.toLowerCase()
      results = results.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.city?.toLowerCase().includes(q) ||
        i.province_state?.toLowerCase().includes(q)
      )
    }
    if (province) {
      results = results.filter(i => i.province_state === province)
    }
    setFiltered(results)
  }, [search, province, inspectors])

  const renderStars = (rating: number) => {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    const empty = 5 - full - (half ? 1 : 0)
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty)
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DC'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading inspectors...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/inspectors" className="text-sm text-[#1D9E75] font-medium">Find an inspector</Link>
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">Inspector login</Link>
            <Link href="/signup" className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56]">
              Join as inspector
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Find a home inspector</h1>
          <p className="text-gray-500">Certified inspectors across Canada, powered by Domicert</p>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by city, name, or province..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400 bg-white"
          />
          <select
            value={province}
            onChange={e => setProvince(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white"
          >
            <option value="">All provinces</option>
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
          </select>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          {filtered.length} inspector{filtered.length !== 1 ? 's' : ''} found
          {province ? ` in ${province}` : ''}
          {search ? ` matching "${search}"` : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">No inspectors found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(inspector => {
              const badges = inspector.inspector_badges
                ?.sort((a, b) => (b.badge_definitions?.sort_order || 0) - (a.badge_definitions?.sort_order || 0))
                .slice(0, 4) || []

              return (
                <div key={inspector.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                          style={{ backgroundColor: inspector.accent_color || '#1D9E75' }}
                        >
                          {getInitials(inspector.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 truncate">{inspector.name}</span>
                            {inspector.is_verified && (
                              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded-full flex-shrink-0">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            📍 {inspector.city}, {inspector.province_state}
                          </div>
                          {inspector.review_count > 0 && (
                            <div className="text-xs mt-0.5">
                              <span className="text-yellow-500">{renderStars(inspector.avg_rating)}</span>
                              <span className="text-gray-400 ml-1">{inspector.avg_rating} ({inspector.review_count})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 flex-wrap mb-3">
                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600">
                          {inspector.inspection_count || 0} inspections
                        </span>
                        {inspector.license_number && (
                          <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600">
                            {inspector.license_number}
                          </span>
                        )}
                        {inspector.created_at && (
                          <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600">
                            Since {new Date(inspector.created_at).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>

                    {badges.length > 0 && (
                      <div className="w-20 flex-shrink-0 border-l border-gray-100 pl-3">
                        <p className="text-xs text-gray-400 mb-2 text-center">Badges</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {badges.map((badge, idx) => {
                            const colors = badgeColors[badge.badge_definitions?.color || 'teal']
                            return (
                              <div
                                key={idx}
                                title={badge.badge_definitions?.name}
                                className="relative flex items-center justify-center"
                                style={{ width: 28, height: 28 }}
                              >
                                <svg viewBox="0 0 28 28" width="28" height="28" style={{ position: 'absolute' }}>
                                  <polygon
                                    points="14,2 24,8 24,20 14,26 4,20 4,8"
                                    fill={colors.bg}
                                    stroke={colors.border}
                                    strokeWidth="1.5"
                                  />
                                </svg>
                                <i
                                  className={`ti ${badge.badge_definitions?.icon}`}
                                  style={{ fontSize: 11, color: colors.text, position: 'relative', zIndex: 1 }}
                                  aria-hidden="true"
                                />
                              </div>
                            )
                          })}
                        </div>
                        {(inspector.inspector_badges?.length || 0) > 4 && (
                          <p className="text-xs text-gray-400 text-center mt-1">
                            +{(inspector.inspector_badges?.length || 0) - 4} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    {inspector.email && (
                      <Link
                        href={'mailto:' + inspector.email}
                        className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 text-center transition-colors"
                      >
                        Email
                      </Link>
                    )}
                    {inspector.website_url && (
                      <Link
                        href={inspector.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 text-center transition-colors"
                      >
                        Website
                      </Link>
                    )}
                    <div className="flex-1 py-1.5 bg-[#1D9E75] rounded-lg text-xs text-white text-center">
                      View profile
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}