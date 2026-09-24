import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'

export const dynamic='force-dynamic'

export default async function SecurityAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="security" kicker="Administration" title="Security & Storage" description="Review the protected publication architecture, role separation and storage responsibilities for the IRED academic platform.">
    <section style={{background:'#f8fafb',border:'1px solid #d7e0e6',borderLeft:'4px solid #8b6d2f',padding:'17px 19px'}}><h2 style={{fontFamily:'Georgia,serif',color:'#0b2d4e',fontSize:18,margin:'0 0 8px'}}>Current Protection Model</h2><p style={{fontSize:11,lineHeight:1.7,color:'#63727f',margin:0}}>Full administrators manage research publications, storage files and delegated staff access. Editorial Board Managers are restricted at both interface and database-policy level to Editorial Board and Review Committee records. Publication files remain in Supabase storage workflows and access is governed by authenticated administrative policies.</p></section>
    <section className="contentCard"><h2 style={{marginTop:0}}>Operational Checks</h2><div style={{display:'grid',gap:8,fontSize:11,color:'#4f6474'}}><div>✓ Keep service-role credentials server-side only and never expose them through NEXT_PUBLIC variables.</div><div>✓ Keep publication and storage write permissions limited to full administrators.</div><div>✓ Review staff access when editorial personnel change.</div><div>✓ Archive obsolete publications where possible instead of permanently deleting scholarly records.</div><div>✓ Verify production environment variables and Supabase policies before major releases.</div></div></section>
  </AdminFrame>
}
