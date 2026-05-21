'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
          <span className="font-medium text-gray-900">Domicert</span>
        </Link>
        <p className="text-sm text-gray-500">
          No account yet?{' '}
          <Link href="/signup" className="text-[#1D9E75] hover:underline">Sign up free</Link>
        </p>
      </nav>

      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <Image
              src="/brand/domicert-mark.svg"
              alt="Domicert"
              width={48}
              height={48}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-medium text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your Domicert account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Email address</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
              placeholder="jane@company.com"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-gray-500">Password</label>
              <Link href="/forgot-password" className="text-xs text-[#1D9E75] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Your data is protected under Canadian privacy law (PIPEDA)
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}