'use client'

import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import mammoth from 'mammoth/mammoth.browser'
import { createClient } from '@/lib/supabase/client'

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

function safeFileName(name:string){return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')}

export default function GreenPaperGenerator(){
  const supabase=createClient()
  const [docx,setDocx]=useState<File|null>(null)
  const [bodyHtml,setBodyHtml]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [meta,setMeta]=useState({title:'',authors:'',affiliation:'',email:'',abstract:'',keywords:'',month:'August',year:String(new Date().getFullYear()),volume:'1',issue:'1',issn:'XXXX-XXXX',articleType:'Research Article'})

  const articleId=useMemo(()=>`GREEN-${meta.year||new Date().getFullYear()}-AUTO`,[meta.year])

  async function onDocx(e:ChangeEvent<HTMLInputElement>){
    const f=e.target.files?.[0]||null
    setDocx(f);setMessage('')
    if(!f){setBodyHtml('');return}
    if(!f.name.toLowerCase().endsWith('.docx')){setMessage('Please choose a .docx file.');return}
    try{
      const arrayBuffer=await f.arrayBuffer()
      const result=await mammoth.convertToHtml({arrayBuffer},{includeDefaultStyleMap:true})
      setBodyHtml(result.value)
      setMessage(result.messages.length?'DOCX loaded. Some complex Word formatting may need preview checking.':'DOCX loaded successfully. Review the preview before publishing.')
    }catch(err){setMessage(err instanceof Error?err.message:'Could not read DOCX.')}
  }

  function update(k:keyof typeof meta,v:string){setMeta(m=>({...m,[k]:v}))}

  async function saveDraft(e:FormEvent){
    e.preventDefault();if(!docx){setMessage('Choose the source DOCX first.');return}
    setBusy(true);setMessage('')
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser();if(userError||!user)throw new Error('Admin session expired.')
      const manuscriptPath=`${meta.year||new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(docx.name)}`
      const {error:upErr}=await supabase.storage.from('green-manuscripts').upload(manuscriptPath,docx,{contentType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',upsert:false});if(upErr)throw upErr
      const {count}=await supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('publication_year',Number(meta.year)||null)
      const seq=String((count||0)+1).padStart(4,'0')
      const id=`GREEN-${meta.year}-${seq}`
      const {error:insertErr}=await supabase.from('green_papers').insert({
        article_id:id,title:meta.title.trim(),authors:meta.authors.trim(),affiliation:meta.affiliation.trim()||null,author_email:meta.email.trim()||null,
        abstract:meta.abstract.trim()||null,keywords:meta.keywords.split(',').map(x=>x.trim()).filter(Boolean),publication_month:meta.month,publication_year:Number(meta.year)||null,
        volume:meta.volume.trim()||null,issue:meta.issue.trim()||null,issn:meta.issn.trim()||null,article_type:meta.articleType,source_docx_path:manuscriptPath,
        pdf_path:`pending/${id}.pdf`,status:'draft',created_by:user.id
      })
      if(insertErr){await supabase.storage.from('green-manuscripts').remove([manuscriptPath]);throw insertErr}
      setMessage(`Draft saved as ${id}. The formatted preview is ready for review; final PDF can be uploaded after approval.`)
    }catch(err){setMessage(err instanceof Error?err.message:'Could not save draft.')}
    finally{setBusy(false)}
  }

  const field={width:'100%',padding:'8px 10px',border:'1px solid #cbd5df',borderRadius:5,fontSize:12} as const
  const label={display:'block',fontSize:11,fontWeight:700,marginBottom:8} as const

  return <section id="green-generator" className="contentCard" style={{marginTop:20}}>
    <h2 style={{marginBottom:4}}>GREEN Paper Generator</h2>
    <p style={{fontSize:12,color:'#657483',marginTop:0}}>Upload the author DOCX, add journal metadata, review the standardized GREEN preview, then save it as a draft.</p>
    {message?<div style={{padding:'9px 11px',background:'#eef7f2',border:'1px solid #cae3d3',borderRadius:6,fontSize:12,marginBottom:12}}>{message}</div>:null}
    <form onSubmit={saveDraft}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
        <label style={label}>Source DOCX<input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onDocx} style={field}/></label>
        <label style={label}>Article type<select value={meta.articleType} onChange={e=>update('articleType',e.target.value)} style={field}><option>Research Article</option><option>Review Article</option><option>Short Communication</option><option>Case Study</option></select></label>
        <label style={label}>Month<select value={meta.month} onChange={e=>update('month',e.target.value)} style={field}>{months.map(m=><option key={m}>{m}</option>)}</select></label>
        <label style={label}>Year<input value={meta.year} onChange={e=>update('year',e.target.value)} type="number" min="1900" max="2100" style={field}/></label>
        <label style={label}>Volume<input value={meta.volume} onChange={e=>update('volume',e.target.value)} style={field}/></label>
        <label style={label}>Issue<input value={meta.issue} onChange={e=>update('issue',e.target.value)} style={field}/></label>
        <label style={label}>ISSN<input value={meta.issn} onChange={e=>update('issn',e.target.value)} style={field}/></label>
        <label style={label}>Article ID preview<input value={articleId} readOnly style={{...field,background:'#f2f4f6'}}/></label>
      </div>
      <label style={label}>Title<input value={meta.title} onChange={e=>update('title',e.target.value)} required style={field}/></label>
      <label style={label}>Author(s)<input value={meta.authors} onChange={e=>update('authors',e.target.value)} required style={field}/></label>
      <label style={label}>Affiliation<input value={meta.affiliation} onChange={e=>update('affiliation',e.target.value)} style={field}/></label>
      <label style={label}>Author email<input value={meta.email} onChange={e=>update('email',e.target.value)} type="email" style={field}/></label>
      <label style={label}>Abstract<textarea value={meta.abstract} onChange={e=>update('abstract',e.target.value)} rows={4} style={field}/></label>
      <label style={label}>Keywords (comma separated)<input value={meta.keywords} onChange={e=>update('keywords',e.target.value)} style={field}/></label>
      <button className="btn btnGreen" type="submit" disabled={busy||!docx}>{busy?'Saving…':'Save GREEN Draft'}</button>
    </form>

    <div style={{marginTop:20}}>
      <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Standardized preview</div>
      <div style={{background:'#dfe6e2',padding:14,borderRadius:6,overflowX:'auto'}}>
        <article style={{width:'794px',minHeight:'1123px',margin:'0 auto',background:'#fff',padding:'34px 38px',boxSizing:'border-box',fontFamily:'Georgia, "Noto Serif Gujarati", serif',color:'#111',boxShadow:'0 2px 10px rgba(0,0,0,.1)'}}>
          <header style={{display:'grid',gridTemplateColumns:'1fr 270px',gap:20,borderBottom:'2px solid #14733d',paddingBottom:10}}>
            <div><img src="/green-logo.png?v=2" alt="GREEN The Research Journal" style={{width:300,maxHeight:84,objectFit:'contain',objectPosition:'left'}}/><div style={{fontWeight:700,fontSize:14,marginTop:4}}>Institute of Research Education and Development (IRED)</div><div style={{fontStyle:'italic',color:'#14733d',fontSize:13}}>Knowledge for a Better Tomorrow</div></div>
            <div style={{textAlign:'right',fontSize:14,lineHeight:1.5,fontWeight:700}}>Volume {meta.volume||'—'} | Issue {meta.issue||'—'} | {meta.year||'—'}<br/>ISSN: {meta.issn||'—'} (Online)<br/>Article ID: {articleId}<div style={{marginTop:6,display:'inline-block',background:'#16733e',color:'#fff',padding:'5px 12px'}}>{meta.articleType}</div></div>
          </header>
          <section style={{textAlign:'center',padding:'24px 20px 16px'}}><h1 style={{fontSize:25,lineHeight:1.25,margin:'0 0 14px'}}>{meta.title||'Research Paper Title'}</h1><div style={{fontSize:18,fontWeight:700}}>{meta.authors||'Author Name'}</div>{meta.affiliation?<div style={{fontSize:14,marginTop:5}}>{meta.affiliation}</div>:null}{meta.email?<div style={{fontSize:13,marginTop:3}}>Email: {meta.email}</div>:null}</section>
          {(meta.abstract||meta.keywords)?<section style={{background:'#eef6f1',padding:'12px 14px',marginBottom:18}}>{meta.abstract?<><h2 style={{color:'#14733d',fontSize:18,margin:'0 0 6px'}}>Abstract</h2><p style={{fontSize:13,lineHeight:1.5,textAlign:'justify',margin:'0 0 9px'}}>{meta.abstract}</p></>:null}{meta.keywords?<div style={{fontSize:13}}><strong style={{color:'#14733d'}}>Keywords:</strong> {meta.keywords}</div>:null}</section>:null}
          <div className="green-docx-preview" dangerouslySetInnerHTML={{__html:bodyHtml||'<p style="color:#777;text-align:center;padding:50px 0">Upload a DOCX to preview the manuscript body here.</p>'}}/>
          <footer style={{marginTop:30,borderTop:'2px solid #14733d',paddingTop:8,display:'flex',justifyContent:'space-between',fontSize:11}}><span>© {meta.year||new Date().getFullYear()} IRED. All rights reserved.</span><span>Page numbers are added in the final PDF</span><span>www.ired.org</span></footer>
        </article>
      </div>
    </div>
  </section>
}
