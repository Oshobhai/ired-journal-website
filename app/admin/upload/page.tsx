import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import PublicationManager from '../publication-manager'

export const dynamic='force-dynamic'

export default async function UploadCenterAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="upload" kicker="Publication Workflow" title="Upload Center" description="Upload GREEN research papers as Draft, generate and check the certificate, then publish the paper and certificate together. RED publication files are managed through the same protected workflow.">
    <PublicationManager/>
  </AdminFrame>
}
