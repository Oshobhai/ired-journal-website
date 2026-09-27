import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import EditorialAccessManager from '../editorial-access-manager'

export const dynamic='force-dynamic'

export default async function StaffAccessAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="access" kicker="Administration" title="Staff Access Control" description="Grant or revoke Full Administrator and Editorial Board Manager access from one protected control panel.">
    <EditorialAccessManager/>
  </AdminFrame>
}
