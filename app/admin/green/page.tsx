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
    <style>{`
      #green-manager table{display:block!important;width:100%!important;min-width:1080px!important}
      #green-manager table thead,#green-manager table tbody{display:block;width:100%}
      #green-manager table thead tr,#green-manager table tbody tr{
        display:grid;width:100%;
        grid-template-columns:32px minmax(220px,2fr) minmax(150px,1.25fr) minmax(145px,1fr) minmax(180px,1.35fr) 82px 78px 88px;
        align-items:start
      }
      #green-manager table thead tr>th:last-child{display:none}
      #green-manager table tbody tr>td:last-child{
        grid-column:1/-1;
        padding:4px 8px 10px 40px!important;
        background:#fbfcfd;
        border-top:1px solid #edf1f4
      }
      #green-manager table tbody tr>td:nth-child(2){max-width:none!important}
    `}</style>
    <GreenWorkspace initialStatus={initialStatus} initialView={initialView} initialQueue={initialQueue}/>
  </AdminFrame>
}
