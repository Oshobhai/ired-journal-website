import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'
import AdminFrame from '../admin-frame'

export const dynamic='force-dynamic'

export default async function AdminDashboard(){
  const access=await requireAdmin()
  const supabase=await createClient()
  const [{count:green},{count:red},{count:greenPublished},{count:redPublished},{count:greenDraft},{count:redDraft}]=await Promise.all([
    supabase.from('green_papers').select('id',{count:'exact',head:true}),
    supabase.from('red_books').select('id',{count:'exact',head:true}),
    supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('status','published'),
    supabase.from('red_books').select('id',{count:'exact',head:true}).eq('status','published'),
    supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('status','draft'),
    supabase.from('red_books').select('id',{count:'exact',head:true}).eq('status','draft'),
  ])
  const g=green||0,r=red||0,p=(greenPublished||0)+(redPublished||0),d=(greenDraft||0)+(redDraft||0)
  return <AdminFrame access={access} active="dashboard" kicker="Institutional Control Panel" title="Journal & Research Administration" description="A concise overview of IRED publication activity. Open a dedicated section from the sidebar to manage records, workflows, governance and permissions.">
    <div className="stats" style={{marginBottom:18}}><div className="stat"><span>Total Publications</span><strong>{g+r}</strong></div><div className="stat"><span>GREEN Papers</span><strong>{g}</strong></div><div className="stat"><span>RED Books</span><strong>{r}</strong></div><div className="stat"><span>Published</span><strong>{p}</strong></div><div className="stat"><span>Drafts</span><strong>{d}</strong></div><div className="stat"><span>Academic Portal</span><strong>Live</strong></div></div>
    <section className="contentCard"><h2 style={{marginTop:0}}>Administrative Areas</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>{[
      ['/admin/green','GREEN Papers','Manage paper records, status, metadata and publication lifecycle.'],
      ['/admin/red','RED Books','Manage compiled research books, covers and publication status.'],
      ['/admin/editorial-board','Editorial Board','Maintain Editorial Board and Review Committee records.'],
      ['/admin/green-generator','GREEN Generator','Process multilingual DOCX manuscripts and save drafts.'],
      ['/admin/upload','Upload Center','Upload publication PDFs, covers and replacement files.'],
      ['/admin/access','Staff Access','Delegate Editorial Board Manager access.'],
    ].map(([href,title,desc])=><Link key={href} href={href} style={{border:'1px solid #d7e0e6',padding:14,background:'#fafcfd'}}><strong style={{display:'block',fontFamily:'Georgia,serif',color:'#0b2d4e',fontSize:15}}>{title}</strong><span style={{display:'block',fontSize:10.5,lineHeight:1.55,color:'#687783',marginTop:5}}>{desc}</span></Link>)}</div></section>
  </AdminFrame>
}
