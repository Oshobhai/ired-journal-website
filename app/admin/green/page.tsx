import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import GreenWorkspace from '../green-workspace'

export const dynamic='force-dynamic'

type PageProps={searchParams:Promise<{status?:string}>}

export default async function GreenAdmin({searchParams}:PageProps){
  const access=await requireAdmin()
  const params=await searchParams
  const initialStatus=params.status==='draft'||params.status==='published'||params.status==='archived'?params.status:'all'
  return <AdminFrame access={access} active="green" kicker="Publication Management" title="GREEN Papers" description="Manage GREEN research paper records, metadata, final PDFs, certificates, publication status, archiving and lifecycle actions in a scalable workspace.">
    <GreenWorkspace initialStatus={initialStatus}/>
  </AdminFrame>
}
