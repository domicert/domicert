import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PropertyHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify realtor
  const { data: realtor } = await supabase
    .from('realtors')
    .select('subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!realtor || realtor.subscription_status !== 'active') redirect('/realtor/dashboard')

  // Use anon client for property data
  const anonClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: property } = await anonClient
    .from('properties')
    .select('id, address_line1, city, province_state, postal_zip')
    .eq('id', id)
    .single()

  if (!property) notFound()

  // Get inspections from verified inspectors only — no PII
  const { data: inspections } = await supabase
    .from('inspections')
    .select(`
      id,
      inspection_date,
      tier,
      reports (
        haz_count,
        def_count,
        mon_count,
        ok_count,
        generated_at
      ),
      companies (
        name,
        slug,
        verification_status,
        city,
        province_state
      )
    `)
    .eq('property_id', id)
    .eq('companies.verification_status', 'verified')
    .order('inspection_date', { ascending: false })

  const verifiedInspections = (inspections || []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (i: any) => i.companies?.verification_status === 'verified'
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </Link>
          <Link href="/realtor/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to search
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h1 className="text-xl font-medium text-gray-900">{property.address_line1}</h1>
          <p className="text-gray-500 mt-1">{property.city}, {property.province_state} {property.postal_zip}</p>
          <div className="mt-3">
            <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-600">
              {verifiedInspections.length} verified inspection{verifiedInspections.length !== 1 ? 's' : ''} on record
            </span>
          </div>
        </div>

        {verifiedInspections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">No verified inspection history found for this property.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {verifiedInspections.map((inspection: any) => (
              <div key={inspection.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(inspection.inspection_date).toLocaleDateString('en-CA', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Inspected by{' '}
                      <Link
                        href={'/inspector/' + inspection.companies?.slug}
                        className="text-[#1D9E75] hover:underline"
                      >
                        {inspection.companies?.name}
                      </Link>
                      {' '}· {[inspection.companies?.city, inspection.companies?.province_state].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                    Verified inspector
                  </span>
                </div>

                {inspection.reports && (
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-900 rounded-lg">
                      <div className="text-xl font-bold text-white">{inspection.reports.haz_count}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Safety hazards</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">{inspection.reports.def_count}</div>
                      <div className="text-xs text-red-400 mt-0.5">Defects</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">{inspection.reports.mon_count}</div>
                      <div className="text-xs text-yellow-400 mt-0.5">Monitor</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{inspection.reports.ok_count}</div>
                      <div className="text-xs text-green-400 mt-0.5">Acceptable</div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                  To obtain the full report, contact {inspection.companies?.name} directly via their{' '}
                  <Link href={'/inspector/' + inspection.companies?.slug} className="text-[#1D9E75] hover:underline">
                    Domicert profile
                  </Link>
                  .
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-400 text-center">
          Property history is provided for informational purposes only. Full reports are available through the original inspector.
          Client personal information has been removed in accordance with Domicert privacy policy.
        </div>
      </div>
    </main>
  )
}