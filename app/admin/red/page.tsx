import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import ManagementConsole from '../management-console'

export const dynamic='force-dynamic'

export default async function RedAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="red" kicker="Publication Management" title="RED Publications" description="Manage RED print journal publication records, editors, covers, publication status, archiving and lifecycle actions in a dedicated workspace.">
    <ManagementConsole initialKind="red" lockedKind="red" showStats={false}/>
  </AdminFrame>
}
