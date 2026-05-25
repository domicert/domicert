import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
  name: string
  email: string
  phone: string
  license_number: string
  website_url: string
  city: string
  province_state: string
  accent_color: string
  inspection_count: number
  created_at: string
  inspector_badges: Badge[]
}

const badgeColors: Record<string, { bg: string, border: string, text: string }> = {
  teal: { bg: '#E1F5EE', border: '#1D9E75', text: '#0F6E56' },
  amber: { bg: '#FAEEDA', border: '#BA7517', text: '#854F0B' },
  blue: { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
}

export default async function InspectorDirectoryPage() {
  const supabase = await createClient()

 const { data: companies, error: companiesError } = await supabase
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
      inspection_count,
      created_at
    `)
    .eq('profile_public', true)
    .order('inspection_count', { ascending: false })
  console.log('Companies:', companies?.length, 'Error:', companiesError?.message)
  const inspectors = (companies || []) as unknown as Company[]

  const getInitials = (name: string) => {
    return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DC'
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
          <p className="text-gray-500">Certified inspectors across North America, powered by Domicert</p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          {inspectors.length} inspector{inspectors.length !== 1 ? 's' : ''} found
        </p>

        {inspectors.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">No inspectors found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inspectors.map(inspector => {
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