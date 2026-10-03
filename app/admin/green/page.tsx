import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import GreenWorkspace from '../green-workspace'

export const dynamic='force-dynamic'

type PageProps={searchParams:Promise<{status?:string;view?:string;queue?:string}>}
type View='current-issue'|'papers'|'certificates'|'english'|'final-pdf'
type Queue='all'|'drafts'|'final-pdf'|'certificate-missing'|'ready'

export default async function GreenAdmin({searchParams}:PageProps){
  const access=await requireAdmin()
  const params=await searchParams
  const initialStatus=params.status==='draft'||params.status==='published'||params.status==='archived'?params.status:'all'
  const allowedViews:View[]=['current-issue','papers','certificates','english','final-pdf']
  const allowedQueues:Queue[]=['all','drafts','final-pdf','certificate-missing','ready']
  const initialView=allowedViews.includes(params.view as View)?params.view as View:'current-issue'
  const initialQueue=allowedQueues.includes(params.queue as Queue)?params.queue as Queue:'all'
  return <AdminFrame access={access} active="green" kicker="Publication Management" title="GREEN Papers" description="Manage the Current Issue first, with scalable access to all papers, final PDFs, certificates, English metadata, publication status and archives. When a DOI is assigned later, add it from All Papers → Edit & Files; the public article page updates automatically.">
    <GreenWorkspace initialStatus={initialStatus} initialView={initialView} initialQueue={initialQueue}/>
  </AdminFrame>
}
