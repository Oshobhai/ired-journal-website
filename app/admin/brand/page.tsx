import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import BrandManager from '../brand-manager'

export const dynamic='force-dynamic'

export default async function BrandAdminPage(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="brand" kicker="Administration" title="Brand & Logos" description="Manage the official IRED, GREEN and RED website logos from one protected admin workspace without editing source code.">
    <BrandManager/>
  </AdminFrame>
}
