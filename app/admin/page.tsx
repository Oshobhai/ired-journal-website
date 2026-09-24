import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/admin-auth'

export const dynamic='force-dynamic'

export default async function Admin(){
  const access=await requireStaff()
  if(access.role==='editorial_board_manager') redirect('/admin/editorial-board')
  redirect('/admin/dashboard')
}
