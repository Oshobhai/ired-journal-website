import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import ContactSettingsManager from '../contact-settings-manager'

export const dynamic='force-dynamic'

export default async function ContactSettingsPage(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="contact-settings" kicker="Administration" title="Contact Details" description="Manage the public IRED phone numbers, editorial email and registration number without editing source code.">
    <ContactSettingsManager/>
  </AdminFrame>
}
