import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import RealtorSearch from './RealtorSearch'

export const dynamic = 'force-dynamic'

export default async function RealtorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: realtor } = await supabase
    .from('realtors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!realtor) redirect('/signup/realtor')
  if (realtor.subscription_status !== 'active') redirect('/realtor/billing')

  // Get subscription details from Stripe via database
  const memberSince = new Date(realtor.created_at).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500">
              {realtor.first_name} {realtor.last_name}
            </span>
            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
              Active
            </span>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              Welcome, {realtor.first_name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {realtor.brokerage || 'Realtor'} · Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Subscription card */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-400 mb-1">Subscription</div>
            <div className="text-sm font-medium text-gray-900">Realtor Access</div>
            <div className="text-xs text-gray-500 mt-1">$100 / month</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Active</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Renews monthly</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-400 mb-1">License</div>
            <div className="text-sm font-medium text-gray-900">{realtor.license_number || 'Not provided'}</div>
            <div className="text-xs text-gray-500 mt-1">{realtor.province_state}</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-medium text-gray-900 mb-1">Property History Search</h2>
          <p className="text-sm text-gray-500 mb-4">Search any address to view its verified inspection history</p>
          <RealtorSearch />
        </div>
      </div>
    </main>
  )
}