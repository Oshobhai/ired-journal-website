'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Paper={
  id:string
  article_id:string|null
  title:string
  authors:string
  publication_month:string|null
  publication_year:number|null
  volume:string|null
  issue:string|null
  pdf_path:string
  pdf_compliance_verified_at:string|null
  pdf_compliance_note:string|null
}

export default function GreenPdfComplianceManager(){
  const supabase=createClient()
  const [papers,setPapers]=useState<Paper[]>([])
  const [busyId,setBusyId]=useState<string|null>(null)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const {data,error}=await supabase.from('green_papers')
      .select('id,article_id,title,authors,publication_month,publication_year,volume,issue,pdf_path,pdf_compliance_verified_at,pdf_compliance_note')
      .eq('status','published')
      .not('pdf_path','like','pending/%')
      .order('article_id',{ascending:true})
    if(error){setMessage(error.message);return}
    setPapers((data||[]) as Paper[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  const verified=useMemo(()=>papers.filter(p=>p.pdf_compliance_verified_at).length,[papers])

  async function viewPdf(paper:Paper){
    setMessage('')
    const {data,error}=await supabase.storage.from('green-papers').createSignedUrl(paper.pdf_path,600)
    if(error||!data?.signedUrl){setMessage(error?.message||'Could not open the PDF.');return}
    window.open(data.signedUrl,'_blank','noopener,noreferrer')
  }

  async function markVerified(event:FormEvent<HTMLFormElement>,paper:Paper){
    event.preventDefault()
    const form=event.currentTarget
    const values=new FormData(form)
    if(['title','issue','article','pages'].some(k=>values.get(k)!=='on')){
      setMessage('Confirm all four first-page checks before marking the PDF compliant.')
      return
    }
    setBusyId(paper.id);setMessage('')
    const {data:{user},error:userError}=await supabase.auth.getUser()
    if(userError||!user){setMessage('Admin session expired. Please sign in again.');setBusyId(null);return}
    const {error}=await supabase.from('green_papers').update({
      pdf_compliance_verified_at:new Date().toISOString(),
      pdf_compliance_verified_by:user.id,
      pdf_compliance_note:'Existing published PDF manually checked for ISSN first-page compliance.',
    }).eq('id',paper.id)
    setMessage(error?error.message:`${paper.article_id||paper.title} marked ISSN first-page compliant.`)
    await load();setBusyId(null)
  }

  async function resetAudit(paper:Paper){
    setBusyId(paper.id);setMessage('')
    const {error}=await supabase.from('green_papers').update({pdf_compliance_verified_at:null,pdf_compliance_verified_by:null,pdf_compliance_note:'Needs correction or re-check before ISSN submission.'}).eq('id',paper.id)
    setMessage(error?error.message:`${paper.article_id||paper.title} returned to pending PDF audit.`)
    await load();setBusyId(null)
  }

  if(!papers.length)return null

  return <section className="contentCard" style={{marginTop:20,borderTop:'4px solid #173d60'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
      <div><div style={{fontSize:10,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:'#173d60'}}>ISSN PDF Audit</div><h2 style={{margin:'4px 0 5px'}}>Published GREEN First-Page Compliance</h2><p style={{margin:0,fontSize:11.5,lineHeight:1.6,color:'#617181',maxWidth:900}}>Open each published PDF and verify the exact journal title, Volume / Issue / Month / Year, article identity and continuous page numbering. Verification is stored so replaced PDFs automatically return to pending audit.</p></div>
      <div style={{fontSize:10.5,fontWeight:800,padding:'6px 9px',border:'1px solid #d4dde5',background:'#f7f9fb'}}>{verified} / {papers.length} verified</div>
    </div>
    {message?<div style={{marginTop:12,padding:'9px 11px',border:'1px solid #cddfe8',background:'#f2f8fb',fontSize:11.5}}>{message}</div>:null}
    <div style={{display:'grid',gap:10,marginTop:14}}>{papers.map(paper=>{
      const isVerified=Boolean(paper.pdf_compliance_verified_at)
      return <form key={paper.id} onSubmit={e=>markVerified(e,paper)} style={{border:'1px solid #dce4ea',borderLeft:`4px solid ${isVerified?'#148444':'#b98624'}`,padding:12,background:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
          <div style={{minWidth:0,flex:'1 1 560px'}}><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.06em',color:isVerified?'#14733d':'#8a6112'}}>{paper.article_id||'GREEN PAPER'} · {isVerified?'VERIFIED':'PENDING AUDIT'}</div><div style={{fontFamily:'Georgia,serif',fontWeight:700,color:'#0b2d4e',fontSize:14,marginTop:3}}>{paper.title}</div><div style={{fontSize:10.5,color:'#687586',marginTop:3}}>{paper.authors}</div><div style={{fontSize:10.5,color:'#506474',marginTop:5,fontWeight:700}}>{[paper.publication_month,paper.publication_year].filter(Boolean).join(' ')} · Volume {paper.volume||'—'} · Issue {paper.issue||'—'}</div></div>
          <button type="button" className="btn btnOutline compact" onClick={()=>void viewPdf(paper)}>View PDF</button>
        </div>
        {!isVerified?<div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'6px 14px',marginTop:10,padding:'9px 10px',background:'#fffaf0',border:'1px solid #eadcb8'}}>{[
          ['title','Exact title “GREEN: The Research e-Journal” is visible.'],
          ['issue',`Volume ${paper.volume||'—'} · Issue ${paper.issue||'—'} · ${paper.publication_month||'—'} ${paper.publication_year||'—'} are visible.`],
          ['article','Article title and author(s) match the website record.'],
          ['pages','Page numbers are visible and continue correctly through the article.'],
        ].map(([name,text])=><label key={name} style={{display:'flex',gap:7,fontSize:10.5,lineHeight:1.45,color:'#52606b'}}><input name={name} type="checkbox" required style={{marginTop:2}}/><span>{text}</span></label>)}</div>:<div style={{fontSize:10.5,color:'#467057',marginTop:9}}>Verified {new Date(paper.pdf_compliance_verified_at!).toLocaleString()}.</div>}
        <div style={{display:'flex',justifyContent:'flex-end',gap:7,marginTop:9}}>{isVerified?<button type="button" className="btn btnOutline compact" disabled={busyId===paper.id} onClick={()=>void resetAudit(paper)}>Mark for Re-check</button>:<button type="submit" className="btn btnGreen compact" disabled={busyId===paper.id}>{busyId===paper.id?'Saving…':'Mark PDF Verified'}</button>}</div>
      </form>
    })}</div>
  </section>
}
