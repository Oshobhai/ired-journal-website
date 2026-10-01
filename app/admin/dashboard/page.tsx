import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'
import AdminFrame from '../admin-frame'

export const dynamic='force-dynamic'

type CurrentIssue={publication_year:number;publication_month:string;volume:string;issue:string;status:string}

export default async function AdminDashboard(){
  const access=await requireAdmin()
  const supabase=await createClient()
  const db=supabase as unknown as {from:(table:string)=>any}
  const [{count:green},{count:red},{count:greenPublished},{count:redPublished},{count:redDraft},{data:currentData}]=await Promise.all([
    supabase.from('green_papers').select('id',{count:'exact',head:true}),
    supabase.from('red_books').select('id',{count:'exact',head:true}),
    supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('status','published'),
    supabase.from('red_books').select('id',{count:'exact',head:true}).eq('status','published'),
    supabase.from('red_books').select('id',{count:'exact',head:true}).eq('status','draft'),
    db.from('green_issues').select('publication_year,publication_month,volume,issue,status').eq('is_current',true).maybeSingle(),
  ])
  const current=(currentData||null) as CurrentIssue|null
  let currentDrafts=0,finalPdfPending=0,certificateMissing=0,readyToPublish=0
  if(current){
    const scope=(query:any)=>query.eq('publication_year',current.publication_year).eq('publication_month',current.publication_month).eq('volume',current.volume).eq('issue',current.issue)
    const [drafts,finalPdf,missingCertificate,ready]=await Promise.all([
      scope(supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('status','draft')),
      scope(supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('status','draft').like('pdf_path','pending/%')),
      scope(supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('status','draft').not('pdf_path','like','pending/%').is('certificate_path',null)),
      scope(supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('status','draft').not('pdf_path','like','pending/%').not('certificate_path','is',null)),
    ])
    currentDrafts=drafts.count||0
    finalPdfPending=finalPdf.count||0
    certificateMissing=missingCertificate.count||0
    readyToPublish=ready.count||0
  }
  const g=green||0,r=red||0,p=(greenPublished||0)+(redPublished||0),rd=redDraft||0
  const currentLabel=current?`${current.publication_month} ${current.publication_year} · Volume ${current.volume} · Issue ${current.issue}`:'No Current Issue'

  const workCards=[
    ['/admin/green?view=current-issue&queue=drafts','GREEN Drafts',currentDrafts,'Papers in the Current Issue still in Draft.'],
    ['/admin/green?view=current-issue&queue=final-pdf','Final PDF Pending',finalPdfPending,'Draft papers still waiting for the final PDF.'],
    ['/admin/green?view=current-issue&queue=certificate-missing','Certificate Missing',certificateMissing,'Final PDF is ready but certificate is missing.'],
    ['/admin/green?view=current-issue&queue=ready','Ready to Publish',readyToPublish,'Final PDF and certificate are both ready.'],
  ] as const

  return <AdminFrame access={access} active="dashboard" kicker="Institutional Control Panel" title="Journal & Research Administration" description="Work from the Current GREEN Issue first, then use the publication overview and administrative tools as needed.">
    <section className="contentCard" style={{marginBottom:18,borderTop:'4px solid #148444'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#148444'}}>Current GREEN Issue</div><strong style={{display:'block',fontFamily:'Georgia,serif',fontSize:19,color:'#12395c',marginTop:4}}>{currentLabel}</strong><span style={{display:'block',fontSize:10.5,color:'#687586',marginTop:4}}>{current?'Open issue · Pending Work counters below are scoped to this issue.':'Create or select a Current Issue in GREEN Papers.'}</span></div>
        <Link href="/admin/green?view=current-issue" className="btn btnGreen compact">Manage Current Issue</Link>
      </div>
    </section>

    <section className="contentCard" style={{marginBottom:18}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-end',flexWrap:'wrap',marginBottom:12}}><div><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#8a6112'}}>Daily Work Queue</div><h2 style={{margin:'4px 0 0'}}>Pending Work</h2></div><span style={{fontSize:10.5,color:'#687586'}}>Click a card to open only that work queue.</span></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>{workCards.map(([href,label,count,desc])=><Link key={label} href={href} style={{textDecoration:'none',border:'1px solid #d7e0e6',borderTop:'3px solid #c6a24b',padding:13,background:'#fffdf8',minWidth:0}}><span style={{display:'block',fontSize:9.5,fontWeight:800,textTransform:'uppercase',letterSpacing:'.06em',color:'#765d22'}}>{label}</span><strong style={{display:'block',fontFamily:'Georgia,serif',fontSize:26,color:'#12395c',marginTop:3}}>{count}</strong><span style={{display:'block',fontSize:10,lineHeight:1.45,color:'#687586',marginTop:3}}>{desc}</span></Link>)}</div>
    </section>

    <section className="contentCard" style={{marginBottom:18}}>
      <h2 style={{marginTop:0}}>Publication Overview</h2>
      <div className="stats"><div className="stat"><span>Total Publications</span><strong>{g+r}</strong></div><div className="stat"><span>GREEN Papers</span><strong>{g}</strong></div><div className="stat"><span>RED Publications</span><strong>{r}</strong></div><div className="stat"><span>Published</span><strong>{p}</strong></div><Link className="stat" href="/admin/red?status=draft#red-manager" style={{textDecoration:'none'}}><span>RED Drafts</span><strong>{rd}</strong></Link></div>
    </section>

    <section className="contentCard">
      <h2 style={{marginTop:0}}>Publication Management</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:12}}>
        <Link href="/admin/green" style={{border:'1px solid #cfe1d5',borderTop:'4px solid #148444',padding:18,background:'#fbfdfb',minWidth:0}}><div style={{fontSize:9,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:'#148444'}}>GREEN</div><strong style={{display:'block',fontFamily:'Georgia,serif',color:'#0b2d4e',fontSize:18,marginTop:4}}>GREEN Papers</strong><span style={{display:'block',fontSize:10.5,lineHeight:1.55,color:'#687783',marginTop:6}}>Manage Current Issue, papers, final PDFs, certificates, publication status and archives.</span></Link>
        <Link href="/admin/red" style={{border:'1px solid #ead2d4',borderTop:'4px solid #bd2025',padding:18,background:'#fffafa',minWidth:0}}><div style={{fontSize:9,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:'#bd2025'}}>RED</div><strong style={{display:'block',fontFamily:'Georgia,serif',color:'#0b2d4e',fontSize:18,marginTop:4}}>RED Publications</strong><span style={{display:'block',fontSize:10.5,lineHeight:1.55,color:'#687783',marginTop:6}}>Manage RED print journal records, covers, PDFs, publication metadata and status.</span></Link>
      </div>
    </section>

    <section className="contentCard"><h2 style={{marginTop:0}}>Administrative Areas</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>{[
      ['/admin/activity-log','Activity Log','Review who changed publication, file, certificate and issue records.'],
      ['/admin/editorial-board','Editorial Board','Maintain Editorial Board and Review Committee records.'],
      ['/admin/green-generator','GREEN Generator','Process multilingual DOCX manuscripts and save drafts.'],
      ['/admin/upload','Upload Center','Upload publication PDFs, covers and replacement files.'],
      ['/admin/access','Staff Access','Delegate Editorial Board Manager access.'],
    ].map(([href,title,desc])=><Link key={href} href={href} style={{border:'1px solid #d7e0e6',padding:14,background:'#fafcfd'}}><strong style={{display:'block',fontFamily:'Georgia,serif',color:'#0b2d4e',fontSize:15}}>{title}</strong><span style={{display:'block',fontSize:10.5,lineHeight:1.55,color:'#687783',marginTop:5}}>{desc}</span></Link>)}</div></section>
  </AdminFrame>
}
