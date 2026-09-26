import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import WebsiteSettingsManager from '../website-settings-manager'

export const dynamic='force-dynamic'

export default async function WebsiteSettingsPage(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="website-settings" kicker="Administration" title="Website Settings" description="Manage institution, journal, publication, homepage and SEO settings from one protected admin workspace.">
    <WebsiteSettingsManager/>
  </AdminFrame>
}
