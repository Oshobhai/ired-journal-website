import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import PublicationManager from '../publication-manager'

export const dynamic='force-dynamic'

export default async function UploadCenterAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="upload" kicker="Publication Workflow" title="Upload Center" description="Upload new GREEN research papers and RED publication files through the protected publication workflow. Existing GREEN paper PDFs and certificates are managed from GREEN Papers Manager.">
    <PublicationManager/>
  </AdminFrame>
}
