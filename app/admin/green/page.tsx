import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import ManagementConsole from '../management-console'
import GreenFinalPdfManager from '../green-final-pdf-manager'
import GreenCertificateManager from '../green-certificate-manager'
import GreenEnglishMetadataManager from '../green-english-metadata-manager'

export const dynamic='force-dynamic'

type PageProps={searchParams:Promise<{status?:string}>}

export default async function GreenAdmin({searchParams}:PageProps){
  const access=await requireAdmin()
  const params=await searchParams
  const initialStatus=params.status==='draft'||params.status==='published'||params.status==='archived'?params.status:'all'
  return <AdminFrame access={access} active="green" kicker="Publication Management" title="GREEN Papers" description="Manage GREEN research paper records, metadata, final PDFs, certificate review, publication status, archiving and lifecycle actions in a dedicated workspace.">
    <GreenFinalPdfManager/>
    <GreenCertificateManager/>
    <GreenEnglishMetadataManager/>
    <ManagementConsole initialKind="green" lockedKind="green" initialStatus={initialStatus} showStats={false}/>
  </AdminFrame>
}
