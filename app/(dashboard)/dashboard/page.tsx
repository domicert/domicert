'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [user, setUser] = useState<{email?: string | null, user_metadata?: {first_name?: string, company_name?: string}} | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

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
  const companyName = user?.user_metadata?.company_name || 'Your Company'

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
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              Good morning, {firstName}
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
          {[
            { label: 'Total inspections', value: '0', color: 'text-gray-900' },
            { label: 'This month', value: '0', color: 'text-gray-900' },
            { label: 'Report revenue', value: '$0', color: 'text-[#1D9E75]' },
            { label: 'Reports purchased', value: '0', color: 'text-gray-900' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <div className={`text-3xl font-medium mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
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
              </div>
            </div>

            {/* Marketplace */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-2">Marketplace</h2>
              <p className="text-xs text-gray-400 mb-4">
                Historical report purchases appear here once you have inspections on file
              </p>
              <div className="text-center py-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-xs text-gray-400">No activity yet</div>
              </div>
            </div>

            {/* Tier status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-1">Your plan</h2>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                  Free period active
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Submit inspections free during your trial period. Choose a tier when starting each inspection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}