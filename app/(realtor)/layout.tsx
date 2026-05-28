import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RealtorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if user has a realtor record
  const { data: realtor } = await supabase
    .from('realtors')
    .select('id, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!realtor) redirect('/signup/realtor')

  return <>{children}</>
}