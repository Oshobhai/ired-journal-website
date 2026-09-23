import { redirect } from 'next/navigation'
import { createClient, getSupabaseConfig } from '@/lib/supabase/server'

export type StaffRole = 'admin' | 'editorial_board_manager'

export async function getStaffAccess() {
  const config = getSupabaseConfig()
  if (!config.configured) return null

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  const user = authData.user
  if (authError || !user) return null

  const { data: access, error: accessError } = await supabase
    .from('admin_users')
    .select('role,email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (accessError || !access || !['admin','editorial_board_manager'].includes(access.role)) return null
  return { user, role: access.role as StaffRole, email: access.email as string }
}

export async function requireStaff() {
  const config = getSupabaseConfig()
  if (!config.configured) redirect('/admin/login?error=config')

  const access = await getStaffAccess()
  if (!access) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }
  return access
}

export async function requireAdmin() {
  const access = await requireStaff()
  if (access.role !== 'admin') redirect('/admin?error=admin_only')
  return access
}
