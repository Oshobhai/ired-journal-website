import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import ManagementConsole from '../management-console'

export const dynamic='force-dynamic'

type PageProps={searchParams:Promise<{status?:string}>}

export default async function RedAdmin({searchParams}:PageProps){
  const access=await requireAdmin()
  const params=await searchParams
  const initialStatus=params.status==='draft'||params.status==='published'||params.status==='archived'?params.status:'all'
  return <AdminFrame access={access} active="red" kicker="Publication Management" title="RED Publications" description="Manage RED print journal publication records, editors, covers, publication status, archiving and lifecycle actions in a dedicated workspace.">
    <ManagementConsole initialKind="red" lockedKind="red" initialStatus={initialStatus} showStats={false}/>
  </AdminFrame>
}
