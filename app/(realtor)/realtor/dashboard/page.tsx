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
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              realtor.subscription_status === 'active'
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              {realtor.subscription_status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Property History Search</h1>
          <p className="text-gray-500 text-sm">Search any address to view its inspection history</p>
        </div>

        {realtor.subscription_status !== 'active' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <h2 className="font-medium text-yellow-800 mb-2">Subscription required</h2>
            <p className="text-sm text-yellow-600 mb-4">
              Activate your $100/month subscription to search property history.
            </p>
            <Link
              href="/realtor/billing"
              className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56]"
            >
              Activate subscription →
            </Link>
          </div>
        ) : (
          <RealtorSearch />
        )}
      </div>
    </main>
  )
}