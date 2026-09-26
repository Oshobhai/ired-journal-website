import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import ManagementConsole from '../management-console'
import GreenFinalPdfManager from '../green-final-pdf-manager'

export const dynamic='force-dynamic'

export default async function GreenAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="green" kicker="Publication Management" title="GREEN Papers" description="Manage GREEN research paper records, metadata, publication status, final PDFs, archiving and lifecycle actions in a dedicated workspace.">
    <GreenFinalPdfManager/>
    <ManagementConsole initialKind="green" lockedKind="green" showStats={false}/>
  </AdminFrame>
}
