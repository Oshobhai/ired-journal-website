'use server'

import { redirect } from 'next/navigation'
import { createClient, getSupabaseConfig } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin-auth'

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

  if (!isAdminEmail(email)) {
    redirect('/admin/login?error=unauthorized')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/admin/login?error=${encodeMessage('Invalid login details')}`)
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
