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
      #green-manager{overflow:hidden}
      #green-manager>div:last-of-type{border:1px solid #dce5ea;border-radius:8px;background:#fff}
      #green-manager table{
        display:block!important;
        width:100%!important;
        min-width:1260px!important;
        border-collapse:separate!important;
        border-spacing:0!important;
        background:#fff
      }
      #green-manager table thead,#green-manager table tbody{display:block;width:100%}
      #green-manager table thead tr,#green-manager table tbody tr{
        display:grid;width:100%;
        grid-template-columns:34px minmax(245px,2.15fr) minmax(165px,1.3fr) minmax(155px,1.15fr) minmax(155px,1.15fr) 88px 82px 88px minmax(240px,1.75fr);
        align-items:start
      }
      #green-manager table thead tr{
        background:#f4f7f8!important;
        border-bottom:1px solid #d8e2e7;
        color:#425768
      }
      #green-manager table thead th{
        display:flex;
        align-items:center;
        min-height:42px;
        padding:10px 9px!important;
        border-right:1px solid #e3eaee;
        font-size:9px!important;
        font-weight:800!important;
        letter-spacing:.055em;
        line-height:1.25;
        text-transform:uppercase;
        white-space:normal
      }
      #green-manager table thead th:last-child{display:flex!important;border-right:0}
      #green-manager table tbody tr{
        border-top:0!important;
        border-bottom:1px solid #e7edf0!important;
        background:#fff;
        transition:background .15s ease
      }
      #green-manager table tbody tr:hover{background:#fbfdfc}
      #green-manager table tbody tr>td{
        min-width:0;
        padding:12px 9px!important;
        border-right:1px solid #edf1f3;
        color:#233b4e;
        line-height:1.45;
        overflow-wrap:anywhere
      }
      #green-manager table tbody tr>td:last-child{
        grid-column:auto!important;
        padding:10px 9px!important;
        background:transparent!important;
        border-top:0!important;
        border-right:0!important
      }
      #green-manager table tbody tr>td:nth-child(2){max-width:none!important}
      #green-manager table tbody tr>td:nth-child(2)>strong{
        display:block;
        color:#12395c;
        font-family:Georgia,serif;
        font-size:12px;
        line-height:1.45;
        font-weight:700
      }
      #green-manager table tbody tr>td:nth-child(5) span{
        display:inline-flex!important;
        align-items:center;
        margin:0 4px 4px 0!important;
        padding:3px 7px!important;
        line-height:1.2!important;
        white-space:nowrap
      }
      #green-manager table tbody tr>td:nth-child(6),
      #green-manager table tbody tr>td:nth-child(7),
      #green-manager table tbody tr>td:nth-child(8){white-space:nowrap}
      #green-manager table tbody tr>td:last-child>div:first-child{
        display:flex!important;
        gap:5px!important;
        align-items:center;
        flex-wrap:wrap!important
      }
      #green-manager table tbody tr>td:last-child>div:first-child button{
        padding:5px 8px!important;
        border-radius:5px!important;
        font-size:9.5px!important;
        line-height:1.25;
        white-space:nowrap
      }
      #green-manager table tbody tr>td:last-child form{
        grid-column:1/-1;
        width:min(860px,calc(100vw - 120px));
        margin-top:10px!important;
        box-shadow:0 8px 24px rgba(18,57,92,.08)
      }
      @media(max-width:900px){
        #green-manager table{min-width:1180px!important}
      }
    `}</style>
    <GreenWorkspace initialStatus={initialStatus} initialView={initialView} initialQueue={initialQueue}/>
  </AdminFrame>
}
