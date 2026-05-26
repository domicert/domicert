import Image from 'next/image'
import Link from 'next/link'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import InspectorGrid from './InspectorGrid'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function InspectorDirectoryPage() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: companies } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      email,
      website_url,
      city,
      province_state,
      accent_color,
      inspection_count,
      updated_at,
      license_number
    `)
    .eq('profile_public', true)
    .eq('verification_status', 'verified')
    .order('inspection_count', { ascending: false })

  const inspectors = (companies || []).map(c => ({ ...c, inspector_badges: [] }))

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
        <InspectorGrid inspectors={inspectors} />
      </div>
    </main>
  )
}