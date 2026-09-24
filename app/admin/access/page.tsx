import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import EditorialAccessManager from '../editorial-access-manager'

export const dynamic='force-dynamic'

export default async function StaffAccessAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="access" kicker="Administration" title="Staff Access Control" description="Grant or revoke Editorial Board Manager access while keeping publication and security permissions restricted to full administrators.">
    <EditorialAccessManager/>
  </AdminFrame>
}
