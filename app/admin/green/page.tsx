import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import ManagementConsole from '../management-console'
import GreenFinalPdfManager from '../green-final-pdf-manager'
import GreenPdfComplianceManager from '../green-pdf-compliance-manager'
import GreenCertificateManager from '../green-certificate-manager'
import GreenEnglishMetadataManager from '../green-english-metadata-manager'

export const dynamic='force-dynamic'

export default async function GreenAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="green" kicker="Publication Management" title="GREEN Papers" description="Manage GREEN research paper records, metadata, final PDFs, ISSN first-page compliance, certificate review, publication status, archiving and lifecycle actions in a dedicated workspace.">
    <GreenFinalPdfManager/>
    <GreenPdfComplianceManager/>
    <GreenCertificateManager/>
    <GreenEnglishMetadataManager/>
    <ManagementConsole initialKind="green" lockedKind="green" showStats={false}/>
  </AdminFrame>
}
