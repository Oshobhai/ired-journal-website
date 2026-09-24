import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import PublicationManager from '../publication-manager'

export const dynamic='force-dynamic'

export default async function UploadCenterAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="upload" kicker="Publication Workflow" title="Upload Center" description="Upload GREEN and RED publication files, covers and replacement assets through the protected publication workflow.">
    <PublicationManager/>
  </AdminFrame>
}
