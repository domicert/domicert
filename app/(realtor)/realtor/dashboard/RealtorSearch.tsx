'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PropertyResult {
  id: string
  address_line1: string
  city: string
  province_state: string
  postal_zip: string
  inspection_count: number
  last_inspection_date: string
}

export default function RealtorSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PropertyResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const response = await fetch('/api/realtor/search?q=' + encodeURIComponent(query))
      const data = await response.json()
      setResults(data.properties || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter a street address..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400 bg-white"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searched && results.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏠</div>
          <p className="text-gray-500">No inspection history found for that address.</p>
          <p className="text-xs text-gray-400 mt-1">Try a partial address or different spelling.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(property => (
            <Link
              key={property.id}
              href={'/realtor/property/' + property.id}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-[#1D9E75] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{property.address_line1}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {property.city}, {property.province_state} {property.postal_zip}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {property.inspection_count} inspection{property.inspection_count !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Last: {new Date(property.last_inspection_date).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}