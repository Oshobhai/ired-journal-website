import { requireStaff } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import EditorialBoardManager from '../editorial-board-manager'

export const dynamic='force-dynamic'

export default async function EditorialBoardAdmin(){
  const access=await requireStaff()
  return <AdminFrame access={access} active="editorial-board" kicker="Academic Governance" title="Editorial Board Administration" description={access.role==='admin'?'Maintain Editorial Board and Review Committee membership, visibility, roles and ordering.':'This restricted workspace permits management of Editorial Board and Review Committee records only.'}>
    {access.role!=='admin'?<div style={{background:'#f7f9fb',border:'1px solid #d7e0e6',padding:'12px 15px',marginBottom:16,fontSize:10.5,color:'#60717e'}}><strong>Restricted access:</strong> publication management, uploads, security and staff permissions are not available to this role.</div>:null}
    <EditorialBoardManager/>
  </AdminFrame>
}
