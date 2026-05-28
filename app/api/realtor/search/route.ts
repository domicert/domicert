import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify realtor has active subscription
    const { data: realtor } = await supabase
      .from('realtors')
      .select('subscription_status')
      .eq('user_id', user.id)
      .single()

    if (!realtor || realtor.subscription_status !== 'active') {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const q = request.nextUrl.searchParams.get('q') || ''
    if (!q.trim()) return NextResponse.json({ properties: [] })

    // Search properties that have inspections from verified inspectors
    const { data: properties } = await supabase
      .from('properties')
      .select(`
        id,
        address_line1,
        city,
        province_state,
        postal_zip,
        inspections!inner (
          id,
          inspection_date,
          companies!inner (
            verification_status
          )
        )
      `)
      .ilike('address_line1', '%' + q + '%')
      .eq('inspections.companies.verification_status', 'verified')
      .limit(10)

    if (!properties) return NextResponse.json({ properties: [] })

    // Format results
    const formatted = properties.map(p => ({
      id: p.id,
      address_line1: p.address_line1,
      city: p.city,
      province_state: p.province_state,
      postal_zip: p.postal_zip,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inspection_count: (p.inspections as any[]).length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      last_inspection_date: (p.inspections as any[]).sort((a, b) =>
        new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime()
      )[0]?.inspection_date || '',
    }))

    return NextResponse.json({ properties: formatted })

  } catch (err) {
    console.error('Realtor search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}