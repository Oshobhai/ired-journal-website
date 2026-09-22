import { redirect } from 'next/navigation'
import { createClient, getSupabaseConfig } from '@/lib/supabase/server'

function allowedAdmins() {
  return (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireAdmin() {
  const config = getSupabaseConfig()
  if (!config.configured) redirect('/admin/login?error=config')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  const user = data.user

  if (error || !user) redirect('/admin/login')

  const admins = allowedAdmins()
  if (admins.length === 0 || !user.email || !admins.includes(user.email.toLowerCase())) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }

  return user
}

export function isAdminEmail(email: string) {
  return allowedAdmins().includes(email.trim().toLowerCase())
}
