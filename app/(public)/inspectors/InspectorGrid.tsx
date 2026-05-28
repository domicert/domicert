'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Badge {
  badge_code: string
  badge_definitions: {
    name: string
    icon: string
    color: string
    sort_order: number
  } | null
}

interface Company {
  id: string
  slug: string
  name: string
  email: string
  website_url: string
  city: string
  province_state: string
  accent_color: string
  inspection_count: number
  updated_at: string
  license_number: string
  inspector_badges: Badge[]
}

const badgeColors: Record<string, { bg: string, border: string, text: string }> = {
  teal: { bg: '#E1F5EE', border: '#1D9E75', text: '#0F6E56' },
  amber: { bg: '#FAEEDA', border: '#BA7517', text: '#854F0B' },
  blue: { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
}

export default function InspectorGrid({ inspectors }: { inspectors: Company[] }) {
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState('')

  const filtered = inspectors.filter(i => {
    const matchSearch = !search ||
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.city?.toLowerCase().includes(search.toLowerCase())
    const matchProvince = !province || i.province_state === province
    return matchSearch && matchProvince
  })

  const getInitials = (name: string) => {
    return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DC'
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by city or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400 bg-white"
        />
        <select
          value={province}
          onChange={e => setProvince(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white"
        >
          <option value="">All provinces / states</option>
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
            <option value="CT">Connecticut</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MO">Missouri</option>
            <option value="NJ">New Jersey</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="OH">Ohio</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WI">Wisconsin</option>
          </optgroup>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        {filtered.length} inspector{filtered.length !== 1 ? 's' : ''} found
        {province ? ' in ' + province : ''}
        {search ? ' matching "' + search + '"' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500">No inspectors found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(inspector => {
            const badges = (inspector.inspector_badges || [])
              .filter(b => b.badge_definitions)
              .sort((a, b) => (b.badge_definitions?.sort_order || 0) - (a.badge_definitions?.sort_order || 0))
              .slice(0, 4)

            const isVerified = inspector.inspector_badges?.some(b => b.badge_code === 'verified_pro')

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
                          <span className="text-sm font-medium text-gray-900">{inspector.name}</span>
                          {isVerified && (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        {(inspector.city || inspector.province_state) && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {inspector.city}{inspector.city && inspector.province_state ? ', ' : ''}{inspector.province_state}
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
                      {inspector.updated_at && (
                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600">
                          Since {new Date(inspector.updated_at).getFullYear()}
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
                              title={badge.badge_definitions?.name || ''}
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
                                className={'ti ' + badge.badge_definitions?.icon}
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
                  <Link
                      href={'/inspector/' + (inspector.slug || inspector.id)}
                      className="flex-1 py-1.5 bg-[#1D9E75] rounded-lg text-xs text-white text-center"
                    >
                      View profile
                    </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}