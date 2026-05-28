import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: memberData } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (memberData?.company_id) {
      await supabase
        .from('companies')
        .update({ payment_method_added: true })
        .eq('id', memberData.company_id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Confirm setup error:', err)
    return NextResponse.json({ error: 'Failed to confirm setup' }, { status: 500 })
  }
}