'use client'

import {FormEvent,useCallback,useEffect,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type Paper={
  id:string
  title:string
  authors:string|null
  article_id:string|null
  publication_year:number|null
  volume:string|null
  issue:string|null
  status:'draft'|'published'|'archived'
  certificate_path:string|null
  certificate_uploaded_at:string|null
}

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'certificate.pdf'
}

export default function GreenCertificateManager(){
  const supabase=createClient()
  const [papers,setPapers]=useState<Paper[]>([])
  const [busyId,setBusyId]=useState<string|null>(null)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const {data,error}=await supabase.from('green_papers').select('id,title,authors,article_id,publication_year,volume,issue,status,certificate_path,certificate_uploaded_at').order('created_at',{ascending:false})
    if(error){setMessage(error.message);return}
    setPapers((data||[]) as Paper[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  async function uploadCertificate(event:FormEvent<HTMLFormElement>,paper:Paper){
    event.preventDefault()
    const form=event.currentTarget
    const file=new FormData(form).get('certificate') as File
    if(!file||file.size===0){setMessage('Select a certificate PDF first.');return}
    if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){setMessage('Certificate must be a PDF file.');return}
    if(file.size>10*1024*1024){setMessage('Certificate PDF must be 10 MB or less.');return}

    setBusyId(paper.id);setMessage('')
    let newPath=''
    try{
      const year=paper.publication_year||new Date().getFullYear()
      newPath=`${year}/${paper.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`
      const {error:uploadError}=await supabase.storage.from('green-certificates').upload(newPath,file,{contentType:'application/pdf',upsert:false})
      if(uploadError)throw uploadError

      const oldPath=paper.certificate_path
      const {error:updateError}=await supabase.from('green_papers').update({certificate_path:newPath,certificate_uploaded_at:new Date().toISOString()}).eq('id',paper.id)
      if(updateError)throw updateError

      if(oldPath)await supabase.storage.from('green-certificates').remove([oldPath])
      form.reset()
      setMessage(oldPath?'Certificate replaced successfully.':'Certificate uploaded successfully.')
      await load()
    }catch(error){
      if(newPath)await supabase.storage.from('green-certificates').remove([newPath])
      setMessage(error instanceof Error?error.message:'Certificate upload failed.')
    }finally{setBusyId(null)}
  }

  async function removeCertificate(paper:Paper){
    if(!paper.certificate_path||!confirm(`Remove certificate for “${paper.title}”?`))return
    setBusyId(paper.id);setMessage('')
    try{
      const path=paper.certificate_path
      const {error:updateError}=await supabase.from('green_papers').update({certificate_path:null,certificate_uploaded_at:null}).eq('id',paper.id)
      if(updateError)throw updateError
      await supabase.storage.from('green-certificates').remove([path])
      setMessage('Certificate removed.')
      await load()
    }catch(error){setMessage(error instanceof Error?error.message:'Could not remove certificate.')}
    finally{setBusyId(null)}
  }

  async function openCertificate(paper:Paper,download=false){
    if(!paper.certificate_path)return
    const {data,error}=await supabase.storage.from('green-certificates').createSignedUrl(paper.certificate_path,600,download?{download:true}:undefined)
    if(error||!data?.signedUrl){setMessage(error?.message||'Could not open certificate.');return}
    window.open(data.signedUrl,'_blank','noopener,noreferrer')
  }

  const field={width:'100%',padding:'8px 9px',border:'1px solid #ccd5dd',borderRadius:5,fontSize:11} as const

  return <section className="contentCard" style={{marginTop:20,borderTop:'4px solid #148444'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap',marginBottom:14}}>
      <div><h2 style={{margin:'0 0 5px'}}>GREEN Paper Certificates</h2><p style={{margin:0,fontSize:12,color:'#687586'}}>Upload one PDF certificate for each GREEN paper. Certificates become visible publicly only when the paper is published.</p></div>
      <span style={{fontSize:10.5,padding:'5px 8px',background:'#eef8f2',border:'1px solid #cee5d6',color:'#176f3d'}}>{papers.filter(p=>p.certificate_path).length} certificate{papers.filter(p=>p.certificate_path).length===1?'':'s'} uploaded</span>
    </div>
    {message?<div style={{padding:'9px 11px',background:'#f3f8fb',border:'1px solid #cbdde8',borderRadius:5,fontSize:12,marginBottom:12}}>{message}</div>:null}
    {papers.length===0?<p style={{fontSize:12,color:'#687586'}}>Upload a GREEN paper first.</p>:<div style={{display:'grid',gap:10}}>{papers.map(paper=>{
      const busy=busyId===paper.id
      return <article key={paper.id} style={{border:'1px solid #dfe6eb',padding:12,background:'#fff'}}>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(260px,420px)',gap:14,alignItems:'center'}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'#148444'}}>{paper.article_id||'GREEN Research Paper'} · {paper.status}</div>
            <div style={{fontFamily:'Georgia,serif',fontWeight:700,color:'#0b2d4e',fontSize:13,marginTop:3}}>{paper.title}</div>
            <div style={{fontSize:10.5,color:'#687586',marginTop:3}}>{paper.authors||'—'}{paper.volume?` · Vol. ${paper.volume}`:''}{paper.issue?` · Issue ${paper.issue}`:''}{paper.publication_year?` · ${paper.publication_year}`:''}</div>
            <div style={{fontSize:10.5,marginTop:5,color:paper.certificate_path?'#176f3d':'#8a6d2b'}}>{paper.certificate_path?'Certificate ready':'Certificate not uploaded'}</div>
          </div>
          <div>
            <form onSubmit={event=>uploadCertificate(event,paper)} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:7,alignItems:'center'}}>
              <input name="certificate" type="file" accept="application/pdf,.pdf" style={field}/>
              <button className="btn btnGreen compact" type="submit" disabled={busy}>{busy?'Working…':paper.certificate_path?'Replace':'Upload Certificate'}</button>
            </form>
            {paper.certificate_path?<div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:7,flexWrap:'wrap'}}><button className="smallBtn" type="button" disabled={busy} onClick={()=>openCertificate(paper,false)}>View</button><button className="smallBtn" type="button" disabled={busy} onClick={()=>openCertificate(paper,true)}>Download</button><button className="smallBtn" type="button" disabled={busy} onClick={()=>removeCertificate(paper)} style={{color:'#9d2525',borderColor:'#efc5c5'}}>Delete Certificate</button></div>:null}
          </div>
        </div>
      </article>
    })}</div>}
  </section>
}
