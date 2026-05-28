import Image from 'next/image'
import Link from 'next/link'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Badge {
  badge_code: string
  earned_at: string
  badge_definitions: {
    name: string
    description: string
    icon: string
    color: string
    sort_order: number
  } | null
}

const badgeColors: Record<string, { bg: string, border: string, text: string }> = {
  teal: { bg: '#E1F5EE', border: '#1D9E75', text: '#0F6E56' },
  amber: { bg: '#FAEEDA', border: '#BA7517', text: '#854F0B' },
  blue: { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
}

export default async function InspectorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, email, phone, license_number, website_url, city, province_state, accent_color, logo_storage_path, inspection_count, updated_at, profile_public, verification_status')
    .eq('slug', slug)
    .eq('profile_public', true)
    .eq('verification_status', 'verified')
    .single()

  
  if (!company) notFound()

  // Fetch badges separately
  const { data: badgeData } = await supabase
    .from('inspector_badges')
    .select('badge_code, earned_at')
    .eq('company_id', company.id)

  // Fetch badge definitions
  const { data: badgeDefs } = await supabase
    .from('badge_definitions')
    .select('code, name, description, icon, color, sort_order')

    console.log('badgeData:', JSON.stringify(badgeData))
  console.log('badgeDefs:', JSON.stringify(badgeDefs))

  // Combine
  const badges = ((badgeData || []).map(b => {
    const def = (badgeDefs || []).find(d => d.code === b.badge_code)
    return def ? { ...b, badge_definitions: def } : null
  }).filter(Boolean)) as unknown as Badge[]
  badges.sort((a, b) => (a.badge_definitions?.sort_order || 0) - (b.badge_definitions?.sort_order || 0))
  const isVerified = company.verification_status === 'verified'

  
  if (!company) notFound()
    // Generate signed URL for logo
  let logoUrl: string | null = null
  if (company.logo_storage_path) {
    const { data: signedData } = await supabase.storage
      .from('company-assets')
      .createSignedUrl(company.logo_storage_path, 3600)
    if (signedData?.signedUrl) {
      logoUrl = signedData.signedUrl
    }
  }

  

  

  const getInitials = (name: string) => {
    return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DC'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </Link>
          <Link href="/inspectors" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to directory
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Logo / avatar */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={company.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-200"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ backgroundColor: company.accent_color || '#1D9E75' }}
              >
                {getInitials(company.name)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-medium text-gray-900">{company.name}</h1>
                {isVerified && (
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-sm rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>

              {(company.city || company.province_state) && (
                <p className="text-gray-500 mb-3">
                  📍 {company.city}{company.city && company.province_state ? ', ' : ''}{company.province_state}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-600">
                  {company.inspection_count || 0} inspections completed
                </span>
                {company.license_number && (
                  <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-600">
                    License: {company.license_number}
                  </span>
                )}
                {company.updated_at && (
                  <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-600">
                    Member since {new Date(company.updated_at).getFullYear()}
                  </span>
                )}
              </div>
            </div>

            {/* Contact buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {company.email && (
                <Link
                  href={'mailto:' + company.email}
                  className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors text-center"
                >
                  Send email
                </Link>
              )}
              {company.phone && (
                <Link
                  href={'tel:' + company.phone}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors text-center"
                >
                  {company.phone}
                </Link>
              )}
              {company.website_url && (
                <Link
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors text-center"
                >
                  Visit website
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge: Badge, idx: number) => {
                const colors = badgeColors[badge.badge_definitions?.color || 'teal']
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                    <div
                      className="relative flex items-center justify-center flex-shrink-0"
                      style={{ width: 36, height: 36 }}
                    >
                      <svg viewBox="0 0 36 36" width="36" height="36" style={{ position: 'absolute' }}>
                        <polygon
                          points="18,2 32,10 32,26 18,34 4,26 4,10"
                          fill={colors.bg}
                          stroke={colors.border}
                          strokeWidth="1.5"
                        />
                      </svg>
                      <i
                        className={'ti ' + badge.badge_definitions?.icon}
                        style={{ fontSize: 14, color: colors.text, position: 'relative', zIndex: 1 }}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{badge.badge_definitions?.name}</div>
                      <div className="text-xs text-gray-400">{badge.badge_definitions?.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Domicert trust footer */}
        <div className="text-center py-6">
          <Link href="/" className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={20} height={20} />
            <span className="text-sm">Verified by Domicert · Certified · Lasting · Trusted</span>
          </Link>
        </div>
      </div>
    </main>
  )
}