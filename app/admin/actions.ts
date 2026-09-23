'use server'

import { redirect } from 'next/navigation'
import { createClient, getSupabaseConfig } from '@/lib/supabase/server'

function encodeMessage(value: string) {
  return encodeURIComponent(value)
}

export async function adminLogin(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    redirect(`/admin/login?error=${encodeMessage('Enter email and password')}`)
  }

  const config = getSupabaseConfig()
  if (!config.configured) {
    redirect('/admin/login?error=config')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/admin/login?error=${encodeMessage('Invalid login details')}`)
  }

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }

  const { data: access } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!access || !['admin','editorial_board_manager'].includes(access.role)) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }

  redirect('/admin')
}

export async function adminLogout() {
  const config = getSupabaseConfig()
  if (config.configured) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  redirect('/admin/login')
}
