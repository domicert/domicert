import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/domicert-mark.svg"
            alt="Domicert"
            width={40}
            height={40}
          />
          <div>
            <div className="text-lg font-medium text-gray-900">Domicert</div>
            <div className="text-xs text-gray-400 tracking-widest uppercase">Certified · Lasting · Trusted</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/inspectors" className="text-sm text-gray-500 hover:text-gray-900">
            Find an inspector
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm bg-[#1D9E75] text-white rounded-lg hover:bg-[#0F6E56] transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Trusted by inspectors across North America
        </div>
        <h1 className="text-5xl font-medium text-gray-900 leading-tight mb-6">
          Professional home inspections,<br />
          <span className="text-[#1D9E75]">beautifully recorded</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create inspection reports, store them permanently, and unlock a growing marketplace of property history — all in one platform.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-[#1D9E75] text-white rounded-lg hover:bg-[#0F6E56] transition-colors font-medium"
          >
            Start for free →
          </Link>
          <Link
            href="/signup?type=realtor"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            I'm a realtor
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-medium text-[#1D9E75] mb-1">Free</div>
            <div className="text-sm text-gray-500">for inspectors to start</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-medium text-gray-900 mb-1">PDF</div>
            <div className="text-sm text-gray-500">professional reports</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-medium text-gray-900 mb-1">∞</div>
            <div className="text-sm text-gray-500">permanent property records</div>
          </div>
        </div>
      </section>

      {/* User type cards */}
      <section className="max-w-4xl mx-auto px-8 pb-20">
        <h2 className="text-2xl font-medium text-gray-900 text-center mb-3">
          Built for everyone in the process
        </h2>
        <p className="text-gray-500 text-center mb-10">
          Whether you inspect, sell, or buy — Domicert has you covered
        </p>
        <div className="grid grid-cols-3 gap-6">
          {/* Inspector card */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-[#1D9E75] transition-colors group">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <svg className="w-5 h-5 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">For inspectors</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Run inspections, generate branded PDF reports, and build your permanent property database — free to start.
            </p>
            <Link href="/signup?type=inspector" className="text-sm text-[#1D9E75] font-medium hover:underline">
              Start inspecting →
            </Link>
          </div>

          {/* Realtor card */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-[#1D9E75] transition-colors group">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <svg className="w-5 h-5 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">For realtors</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Search and purchase historical inspection reports on any property. Know what you're selling before you list it.
            </p>
            <Link href="/inspectors" className="text-sm text-[#1D9E75] font-medium hover:underline">
  Find an inspector →
</Link>
          </div>

          {/* Homeowner card */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-[#1D9E75] transition-colors group">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <svg className="w-5 h-5 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">For homeowners</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Access your inspection report anytime. Your home's certified history, securely stored and always available.
            </p>
            <Link href="/login" className="text-sm text-[#1D9E75] font-medium hover:underline">
  Access my report →
</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/domicert-mark.svg"
              alt="Domicert"
              width={24}
              height={24}
            />
            <span className="text-sm text-gray-500">© 2026 Domicert. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}