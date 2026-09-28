'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import GreenCertificateManager from './green-certificate-manager'

type Publication = {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  pdf_path: string
  cover_path?: string | null
  created_at: string
  authors?: string | null
  affiliation?: string | null
  editors?: string | null
  publication_year?: number | null
  publication_month?: string | null
  volume?: string | null
  issue?: string | null
  article_id?: string | null
  publication_label?: string | null
}

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')
}

export default function PublicationManager(){
  const supabase=createClient()
  const [green,setGreen]=useState<Publication[]>([])
  const [red,setRed]=useState<Publication[]>([])
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const [{data:g},{data:r}]=await Promise.all([
      supabase.from('green_papers').select('id,title,authors,affiliation,status,pdf_path,publication_year,publication_month,volume,issue,article_id,created_at').order('created_at',{ascending:false}),
      supabase.from('red_books').select('id,title,editors,status,pdf_path,cover_path,publication_year,publication_month,volume,issue,publication_label,created_at').order('created_at',{ascending:false}),
    ])
    setGreen((g||[]) as Publication[])
    setRed((r||[]) as Publication[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  async function uploadGreen(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    const formEl=event.currentTarget
    const form=new FormData(formEl)
    const file=form.get('pdf') as File
    setBusy(true);setMessage('')
    let path=''
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')
      if(!file||file.size===0)throw new Error('Please select the GREEN paper PDF.')
      if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf'))throw new Error('GREEN paper must be a PDF file.')
      if(file.size>50*1024*1024)throw new Error('GREEN paper PDF must be 50 MB or less.')

      const title=String(form.get('paper_title')||'').trim()
      const author=String(form.get('author_name')||'').trim()
      const researchScholar=String(form.get('research_scholar')||'').trim()
      const publicationMonth=String(form.get('publication_month')||'').trim()
      const publicationYear=Number(form.get('publication_year'))
      const volume=String(form.get('volume')||'').trim()
      const issue=String(form.get('issue')||'').trim()
      if(!title||!author||!researchScholar)throw new Error('Paper Title, Author Name and Research Scholar are required.')
      if(!months.includes(publicationMonth))throw new Error('Please select the GREEN publication month.')
      if(!Number.isInteger(publicationYear)||publicationYear<1900||publicationYear>2100)throw new Error('Please enter a valid GREEN publication year.')
      if(!volume||!issue)throw new Error('Volume and Issue are required for GREEN papers.')

      path=`${publicationYear}/${crypto.randomUUID()}-${safeFileName(file.name)}`
      const {error:uploadError}=await supabase.storage.from('green-papers').upload(path,file,{contentType:'application/pdf',upsert:false})
      if(uploadError)throw uploadError

      const {error:insertError}=await supabase.from('green_papers').insert({
        title,
        authors:author,
        affiliation:researchScholar,
        publication_month:publicationMonth,
        publication_year:publicationYear,
        volume,
        issue,
        pdf_path:path,
        pdf_size:file.size,
        certificate_path:null,
        certificate_uploaded_at:null,
        status:'draft',
        published_at:null,
        created_by:user.id,
      })
      if(insertError)throw insertError

      formEl.reset()
      setMessage('GREEN paper uploaded successfully as Draft. Now use GREEN Certificate Check & Publish below to generate, review and publish the certificate with the paper.')
      await load()
    }catch(error){
      if(path)await supabase.storage.from('green-papers').remove([path])
      setMessage(error instanceof Error?error.message:'GREEN upload failed.')
    }finally{setBusy(false)}
  }

  async function uploadRed(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    const formEl=event.currentTarget
    const form=new FormData(formEl)
    const file=form.get('pdf') as File
    const cover=form.get('cover') as File
    let pdfPath=''
    let coverPath=''
    setBusy(true);setMessage('')
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')
      if(!file||file.type!=='application/pdf')throw new Error('Please select a PDF file.')
      if(file.size>200*1024*1024)throw new Error('RED book PDF must be 200 MB or less.')

      if(cover&&cover.size>0){
        if(!['image/jpeg','image/png','image/webp'].includes(cover.type))throw new Error('Cover must be JPG, PNG, or WebP.')
        if(cover.size>5*1024*1024)throw new Error('Cover image must be 5 MB or less.')
        coverPath=`${new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(cover.name)}`
        const {error}=await supabase.storage.from('red-book-covers').upload(coverPath,cover,{contentType:cover.type,upsert:false})
        if(error)throw error
      }

      pdfPath=`${new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(file.name)}`
      const {error:pdfError}=await supabase.storage.from('red-books').upload(pdfPath,file,{contentType:'application/pdf',upsert:false})
      if(pdfError)throw pdfError

      const status=String(form.get('status')||'draft')
      const publicationMonth=String(form.get('publication_month')||'').trim()||null
      const publicationYear=Number(form.get('publication_year'))||null
      const {error:insertError}=await supabase.from('red_books').insert({
        title:String(form.get('title')||'').trim(),
        subtitle:String(form.get('subtitle')||'').trim()||null,
        editors:String(form.get('editors')||'').trim()||null,
        publication_year:publicationYear,
        publication_month:publicationMonth,
        volume:String(form.get('volume')||'').trim()||null,
        issue:String(form.get('issue')||'').trim()||null,
        issn:String(form.get('issn')||'').trim()||null,
        publication_label:publicationMonth&&publicationYear?`${publicationMonth} ${publicationYear}`:publicationMonth||(publicationYear?String(publicationYear):null),
        cover_path:coverPath||null,
        pdf_path:pdfPath,
        pdf_size:file.size,
        status,
        published_at:status==='published'?new Date().toISOString():null,
        created_by:user.id,
      })
      if(insertError)throw insertError
      formEl.reset();setMessage('RED publication uploaded successfully.');await load()
    }catch(error){
      if(pdfPath)await supabase.storage.from('red-books').remove([pdfPath])
      if(coverPath)await supabase.storage.from('red-book-covers').remove([coverPath])
      setMessage(error instanceof Error?error.message:'RED upload failed.')
    }finally{setBusy(false)}
  }

  async function repairRedFiles(event:FormEvent<HTMLFormElement>,item:Publication){
    event.preventDefault()
    const formEl=event.currentTarget
    const form=new FormData(formEl)
    const pdf=form.get('repair_pdf') as File
    const cover=form.get('repair_cover') as File
    let newPdfPath='';let newCoverPath=''
    setBusy(true);setMessage('')
    try{
      const hasPdf=pdf&&pdf.size>0
      const hasCover=cover&&cover.size>0
      if(!hasPdf&&!hasCover)throw new Error('Select a PDF or cover image first.')
      if(hasPdf){
        if(pdf.type!=='application/pdf')throw new Error('RED publication file must be PDF.')
        newPdfPath=`${new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(pdf.name)}`
        const {error}=await supabase.storage.from('red-books').upload(newPdfPath,pdf,{contentType:'application/pdf',upsert:false});if(error)throw error
      }
      if(hasCover){
        if(!['image/jpeg','image/png','image/webp'].includes(cover.type))throw new Error('Cover must be JPG, PNG, or WebP.')
        newCoverPath=`${new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(cover.name)}`
        const {error}=await supabase.storage.from('red-book-covers').upload(newCoverPath,cover,{contentType:cover.type,upsert:false});if(error)throw error
      }
      const updates:Record<string,string|number|null>={}
      if(newPdfPath){updates.pdf_path=newPdfPath;updates.pdf_size=pdf.size}
      if(newCoverPath)updates.cover_path=newCoverPath
      const {error}=await supabase.from('red_books').update(updates).eq('id',item.id);if(error)throw error
      if(newPdfPath&&item.pdf_path)await supabase.storage.from('red-books').remove([item.pdf_path])
      if(newCoverPath&&item.cover_path)await supabase.storage.from('red-book-covers').remove([item.cover_path])
      formEl.reset();setMessage('RED files updated successfully.');await load()
    }catch(error){
      if(newPdfPath)await supabase.storage.from('red-books').remove([newPdfPath])
      if(newCoverPath)await supabase.storage.from('red-book-covers').remove([newCoverPath])
      setMessage(error instanceof Error?error.message:'File update failed.')
    }finally{setBusy(false)}
  }

  async function setStatus(kind:'green'|'red',item:Publication,status:Publication['status']){
    setBusy(true);setMessage('')
    const table=kind==='green'?'green_papers':'red_books'
    const {error}=await supabase.from(table).update({status,published_at:status==='published'?new Date().toISOString():null}).eq('id',item.id)
    setMessage(error?error.message:`Status changed to ${status}.`)
    await load();setBusy(false)
  }

  async function removeItem(kind:'green'|'red',item:Publication){
    if(!confirm(`Delete “${item.title}” and its files?`))return
    setBusy(true);setMessage('')
    const bucket=kind==='green'?'green-papers':'red-books'
    const table=kind==='green'?'green_papers':'red_books'
    if(item.pdf_path)await supabase.storage.from(bucket).remove([item.pdf_path])
    if(kind==='red'&&item.cover_path)await supabase.storage.from('red-book-covers').remove([item.cover_path])
    const {error}=await supabase.from(table).delete().eq('id',item.id)
    setMessage(error?error.message:'Publication deleted.');await load();setBusy(false)
  }

  const fieldStyle={width:'100%',padding:'9px 10px',border:'1px solid #ccd5dd',borderRadius:5,marginTop:4,marginBottom:10} as const
  const labelStyle={display:'block',fontSize:12,fontWeight:700} as const

  return <div style={{display:'grid',gap:22,marginTop:24}}>
    {message?<div style={{padding:'11px 13px',background:'#eef7f2',border:'1px solid #c7e4d2',borderRadius:6,fontSize:13}}>{message}</div>:null}

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:18}}>
      <section className="contentCard">
        <h2>Add GREEN Research Paper</h2>
        <p style={{fontSize:12,color:'#687586',marginTop:-4}}>Enter publication details exactly as they appear on the final paper PDF. The paper is saved as Draft first.</p>
        <form onSubmit={uploadGreen}>
          <label style={labelStyle}>Paper Title<input name="paper_title" required style={fieldStyle}/></label>
          <label style={labelStyle}>Author Name<input name="author_name" required style={fieldStyle}/></label>
          <label style={labelStyle}>Research Scholar<input name="research_scholar" required placeholder="Research Scholar / Institution" style={fieldStyle}/></label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginTop:2}}>
            <label style={labelStyle}>Month<select name="publication_month" defaultValue="" required style={fieldStyle}><option value="" disabled>Select month</option>{months.map(month=><option key={month} value={month}>{month}</option>)}</select></label>
            <label style={labelStyle}>Year<input name="publication_year" type="number" min="1900" max="2100" required placeholder="2026" style={fieldStyle}/></label>
            <label style={labelStyle}>Volume<input name="volume" type="number" min="1" required placeholder="1" style={fieldStyle}/></label>
            <label style={labelStyle}>Issue<input name="issue" type="number" min="1" required placeholder="1" style={fieldStyle}/></label>
          </div>
          <div style={{fontSize:10.5,color:'#667b6e',marginTop:-3,marginBottom:10}}>Manual entry: Month, Year, Volume and Issue are saved exactly as entered. Article ID remains automatic.</div>
          <label style={labelStyle}>Paper PDF (max 50 MB)<input name="pdf" type="file" accept="application/pdf,.pdf" required style={fieldStyle}/></label>
          <div style={{fontSize:10.5,color:'#667b6e',marginTop:-3,marginBottom:10}}>Certificate PDF is generated after upload. Upload the paper as Draft, then use the certificate workflow directly below to Generate → View / Check → Publish Both.</div>
          <button className="btn btnGreen" disabled={busy} type="submit">{busy?'Uploading…':'Upload GREEN Paper'}</button>
        </form>
      </section>

      <section className="contentCard">
        <h2>Add RED Research Book / Volume</h2>
        <form onSubmit={uploadRed}>
          <label style={labelStyle}>Book / Volume Cover (JPG, PNG, WebP · max 5 MB)<input name="cover" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" style={fieldStyle}/></label>
          <label style={labelStyle}>Title<input name="title" required style={fieldStyle}/></label>
          <label style={labelStyle}>Subtitle<input name="subtitle" style={fieldStyle}/></label>
          <label style={labelStyle}>Editor(s)<input name="editors" style={fieldStyle}/></label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            <label style={labelStyle}>Month<select name="publication_month" defaultValue="August" style={fieldStyle}>{months.map(month=><option key={month}>{month}</option>)}</select></label>
            <label style={labelStyle}>Year<input name="publication_year" type="number" min="1900" max="2100" style={fieldStyle}/></label>
            <label style={labelStyle}>Volume<input name="volume" style={fieldStyle}/></label>
            <label style={labelStyle}>Issue<input name="issue" style={fieldStyle}/></label>
          </div>
          <label style={labelStyle}>ISSN<input name="issn" style={fieldStyle}/></label>
          <label style={labelStyle}>PDF (max 200 MB)<input name="pdf" type="file" accept="application/pdf,.pdf" required style={fieldStyle}/></label>
          <label style={labelStyle}>Initial status<select name="status" defaultValue="draft" style={fieldStyle}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <button className="btn btnRed" disabled={busy} type="submit">{busy?'Working…':'Upload RED Publication'}</button>
        </form>
      </section>
    </div>

    <div id="green-certificate-workflow"><GreenCertificateManager/></div>

    <section className="contentCard">
      <h2>GREEN Papers</h2>
      {green.length===0?<p>No papers uploaded yet.</p>:green.map(item=>{
        const numbering=[item.volume?`Volume ${item.volume}`:null,item.issue?`Issue ${item.issue}`:null,item.publication_month||null,item.publication_year||null].filter(Boolean).join(' · ')
        return <div key={item.id} style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',padding:'10px 0',borderBottom:'1px solid #e4e9ed'}}>
          <div style={{minWidth:0}}>
            <strong>{item.title}</strong>
            <div style={{fontSize:12,color:'#667',marginTop:3}}>{item.authors||'—'}{item.affiliation?` · ${item.affiliation}`:''}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:6}}>
              {item.article_id?<span style={{fontSize:10.5,padding:'3px 6px',background:'#f4f7f9',border:'1px solid #dce4e9'}}>{item.article_id}</span>:null}
              <span style={{fontSize:10.5,padding:'3px 6px',background:'#f4f7f9',border:'1px solid #dce4e9'}}>{numbering||'Numbering pending'}</span>
              <span style={{fontSize:10.5,padding:'3px 6px',background:item.status==='published'?'#eef8f2':'#fff8e9',border:'1px solid #dce4e9'}}>{item.status}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><button className="btn btnNavy" disabled={busy} onClick={()=>setStatus('green',item,item.status==='published'?'draft':'published')}>{item.status==='published'?'Unpublish':'Publish'}</button><button className="btn btnOutline" disabled={busy} onClick={()=>removeItem('green',item)}>Delete</button></div>
        </div>
      })}
    </section>

    <section className="contentCard">
      <h2>RED Books</h2>
      {red.length===0?<p>No books uploaded yet.</p>:red.map(item=>{
        const coverUrl=item.cover_path?supabase.storage.from('red-book-covers').getPublicUrl(item.cover_path).data.publicUrl:null
        const dateLabel=[item.publication_month,item.publication_year].filter(Boolean).join(' ')||item.publication_label||'Date not set'
        return <div key={item.id} style={{padding:'12px 0',borderBottom:'1px solid #e4e9ed'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>{coverUrl?<img src={coverUrl} alt="" style={{width:46,height:62,objectFit:'cover',borderRadius:3,border:'1px solid #ddd'}}/>:<div style={{width:46,height:62,border:'1px dashed #c8c8c8',borderRadius:3,display:'grid',placeItems:'center',fontSize:9,color:'#777'}}>No cover</div>}<div><strong>{item.title}</strong><div style={{fontSize:12,color:'#667'}}>{item.editors||'Editor not set'} · {dateLabel}{item.volume?` · Volume ${item.volume}`:''}{item.issue?` · Issue ${item.issue}`:''} · {item.status}</div></div></div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><button className="btn btnNavy" disabled={busy} onClick={()=>setStatus('red',item,item.status==='published'?'draft':'published')}>{item.status==='published'?'Unpublish':'Publish'}</button><button className="btn btnOutline" disabled={busy} onClick={()=>removeItem('red',item)}>Delete</button></div>
          </div>
          <form onSubmit={event=>repairRedFiles(event,item)} style={{marginTop:10,padding:10,background:'#f7f9fa',border:'1px solid #e2e7eb',borderRadius:6}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Repair / Replace RED files</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:8,alignItems:'end'}}>
              <label style={labelStyle}>PDF<input name="repair_pdf" type="file" accept="application/pdf,.pdf" style={{...fieldStyle,marginBottom:0}}/></label>
              <label style={labelStyle}>Cover image<input name="repair_cover" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" style={{...fieldStyle,marginBottom:0}}/></label>
              <button className="btn btnRed" disabled={busy} type="submit">{busy?'Working…':'Save Files'}</button>
            </div>
          </form>
        </div>
      })}
    </section>
  </div>
}
