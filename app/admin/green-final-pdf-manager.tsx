'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PendingPaper = {
  id: string
  article_id: string | null
  title: string
  authors: string
  status: 'draft' | 'published' | 'archived'
  pdf_path: string
  publication_year: number | null
  publication_month: string | null
  volume: string | null
  issue: string | null
}

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')
}

export default function GreenFinalPdfManager(){
  const supabase=createClient()
  const [papers,setPapers]=useState<PendingPaper[]>([])
  const [busyId,setBusyId]=useState<string|null>(null)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const {data,error}=await supabase
      .from('green_papers')
      .select('id,article_id,title,authors,status,pdf_path,publication_year,publication_month,volume,issue')
      .like('pdf_path','pending/%')
      .order('created_at',{ascending:false})
    if(error){setMessage(error.message);return}
    setPapers((data||[]) as PendingPaper[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  async function attachPdf(event:FormEvent<HTMLFormElement>,paper:PendingPaper){
    event.preventDefault()
    const form=event.currentTarget
    const data=new FormData(form)
    const file=data.get('final_pdf') as File
    setMessage('')

    try{
      setBusyId(paper.id)
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')
      if(!file||file.size===0)throw new Error('Select the final GREEN PDF first.')
      if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf'))throw new Error('Final file must be a PDF.')
      if(file.size>50*1024*1024)throw new Error('GREEN PDF must be 50 MB or smaller.')

      const requiredChecks=['check_title','check_issue','check_article','check_pages']
      if(requiredChecks.some(name=>data.get(name)!=='on')){
        throw new Error('Complete all ISSN first-page compliance checks before attaching the final PDF.')
      }

      const year=paper.publication_year||new Date().getFullYear()
      const path=`${year}/${crypto.randomUUID()}-${safeFileName(file.name)}`
      const {error:uploadError}=await supabase.storage.from('green-papers').upload(path,file,{contentType:'application/pdf',upsert:false})
      if(uploadError)throw uploadError

      const {error:updateError}=await supabase.from('green_papers').update({
        pdf_path:path,
        pdf_size:file.size,
        pdf_compliance_verified_at:new Date().toISOString(),
        pdf_compliance_verified_by:user.id,
        pdf_compliance_note:'ISSN first-page checklist confirmed when final PDF was attached.',
      }).eq('id',paper.id)
      if(updateError){
        await supabase.storage.from('green-papers').remove([path])
        throw updateError
      }

      form.reset()
      setMessage(`Final PDF attached to ${paper.article_id||paper.title} and marked ISSN first-page compliant.`)
      await load()
    }catch(error){
      setMessage(error instanceof Error?error.message:'Could not attach the final PDF.')
    }finally{
      setBusyId(null)
    }
  }

  if(!papers.length)return null

  return <section className="contentCard" style={{borderTop:'4px solid #b98624',marginTop:20}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
      <div>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:'#8a6112'}}>Final PDF Required</div>
        <h2 style={{margin:'4px 0 5px'}}>GREEN Papers Waiting for Final PDF</h2>
        <p style={{margin:0,fontSize:12,color:'#657483',lineHeight:1.55,maxWidth:900}}>Attach only the final PDF after checking its first page. The journal title, issue details, article identity and page numbering must match the publication record before the file is accepted.</p>
      </div>
      <span style={{fontSize:10,fontWeight:800,padding:'5px 8px',background:'#fff6df',border:'1px solid #ead59d',color:'#805b13'}}>{papers.length} pending</span>
    </div>

    {message?<div style={{marginTop:12,padding:'9px 11px',border:'1px solid #cddfe8',background:'#f2f8fb',fontSize:11.5}}>{message}</div>:null}

    <div style={{display:'grid',gap:12,marginTop:14}}>{papers.map(paper=><div key={paper.id} style={{border:'1px solid #dce3e8',padding:13,background:'#fbfcfd'}}>
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(330px,430px)',gap:16,alignItems:'start'}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:9.5,fontWeight:800,color:'#14733d',letterSpacing:'.06em'}}>{paper.article_id||'GREEN PAPER'} · {paper.status.toUpperCase()}</div>
          <div style={{fontFamily:'Georgia,serif',fontWeight:700,color:'#0b2d4e',fontSize:14,marginTop:3,overflowWrap:'anywhere'}}>{paper.title}</div>
          <div style={{fontSize:10.5,color:'#687586',marginTop:3}}>{paper.authors}</div>
          <div style={{fontSize:10.5,color:'#506474',marginTop:7,fontWeight:700}}>{[paper.publication_month,paper.publication_year].filter(Boolean).join(' ')}{paper.volume?` · Volume ${paper.volume}`:''}{paper.issue?` · Issue ${paper.issue}`:''}</div>
          <div style={{marginTop:10,padding:'9px 10px',background:'#f3f8f5',border:'1px solid #d7e7dd',fontSize:10.5,lineHeight:1.55,color:'#4d6657'}}><strong>Required journal title:</strong> GREEN: The Research e-Journal</div>
        </div>

        <form onSubmit={e=>attachPdf(e,paper)} style={{display:'grid',gap:9}}>
          <label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Final PDF
            <input name="final_pdf" type="file" accept="application/pdf,.pdf" required style={{display:'block',width:'100%',marginTop:4,padding:'7px',border:'1px solid #cbd6de',background:'#fff',fontSize:10}}/>
          </label>
          <div style={{padding:'9px 10px',border:'1px solid #e2d6b8',background:'#fffaf0'}}>
            <div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'#8a6112',marginBottom:6}}>ISSN First-Page Check</div>
            {[
              ['check_title','Exact title “GREEN: The Research e-Journal” is visible.'],
              ['check_issue',`Volume ${paper.volume||'—'} · Issue ${paper.issue||'—'} · ${paper.publication_month||'—'} ${paper.publication_year||'—'} are visible.`],
              ['check_article','Article title and author(s) match this record.'],
              ['check_pages','Page number is visible and pagination continues correctly through the article.'],
            ].map(([name,text])=><label key={name} style={{display:'flex',gap:7,alignItems:'flex-start',fontSize:10.5,lineHeight:1.45,color:'#52606b',marginTop:5}}><input name={name} type="checkbox" required style={{marginTop:2}}/><span>{text}</span></label>)}
          </div>
          <button className="btn btnGreen compact" type="submit" disabled={busyId===paper.id}>{busyId===paper.id?'Uploading…':'Attach Verified PDF'}</button>
        </form>
      </div>
    </div>)}</div>
  </section>
}
