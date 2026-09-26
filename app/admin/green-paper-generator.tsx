'use client'

import { ChangeEvent, DragEvent, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_DOCX_SIZE = 25 * 1024 * 1024

type PreparedResult = {
  articleId:string
  title:string
  authors:string
  affiliation:string|null
  month:string
  year:number
  volume:number
  issue:number
  downloadUrl:string|null
}

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'paper.docx'
}

export default function GreenPaperGenerator(){
  const supabase=createClient()
  const fileInput=useRef<HTMLInputElement|null>(null)
  const [file,setFile]=useState<File|null>(null)
  const [dragging,setDragging]=useState(false)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [result,setResult]=useState<PreparedResult|null>(null)

  function chooseFile(next:File|null){
    setMessage('')
    setResult(null)
    if(!next){setFile(null);return}
    if(!next.name.toLowerCase().endsWith('.docx')){
      setFile(null)
      setMessage('Please choose a Microsoft Word .docx file.')
      return
    }
    if(next.size>MAX_DOCX_SIZE){
      setFile(null)
      setMessage('Word file must be 25 MB or smaller.')
      return
    }
    setFile(next)
  }

  function onFile(event:ChangeEvent<HTMLInputElement>){
    chooseFile(event.target.files?.[0]||null)
  }

  function onDrop(event:DragEvent<HTMLDivElement>){
    event.preventDefault()
    setDragging(false)
    chooseFile(event.dataTransfer.files?.[0]||null)
  }

  async function prepareWord(){
    if(!file){setMessage('Select the author Word file first.');return}
    setBusy(true)
    setMessage('')
    setResult(null)
    const incomingPath=`incoming/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`

    try{
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')

      const {error:uploadError}=await supabase.storage.from('green-manuscripts').upload(incomingPath,file,{
        contentType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert:false,
      })
      if(uploadError)throw uploadError

      const response=await fetch('/api/green/prepare-word',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({sourcePath:incomingPath,originalName:file.name}),
      })
      const payload=await response.json()
      if(!response.ok)throw new Error(payload?.error||'Could not prepare the GREEN Word file.')

      setResult(payload as PreparedResult)
      setMessage('Word file prepared successfully. Header, footer, Article ID, Volume, Issue and publication month/year were added automatically.')
    }catch(error){
      await supabase.storage.from('green-manuscripts').remove([incomingPath])
      setMessage(error instanceof Error?error.message:'Could not prepare the Word file.')
    }finally{
      setBusy(false)
    }
  }

  return <section className="contentCard" style={{marginTop:20,borderTop:'4px solid #148444',padding:0,overflow:'hidden'}}>
    <div style={{padding:'20px 22px 15px',borderBottom:'1px solid #dfe6ea'}}>
      <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#148444'}}>GREEN Publication Workflow</div>
      <h2 style={{margin:'5px 0 5px',fontFamily:'Georgia,serif',color:'#0b2d4e'}}>Prepare GREEN Word File</h2>
      <p style={{margin:0,fontSize:12,color:'#627483',lineHeight:1.65,maxWidth:850}}>Upload the author&apos;s final Word document. The system keeps the paper content and formatting, adds the GREEN journal publication header and footer, assigns the next Article ID / Volume / Issue, and creates a Draft record.</p>
    </div>

    <div style={{padding:'20px 22px'}}>
      {message?<div style={{padding:'10px 12px',marginBottom:14,border:'1px solid '+(result?'#bcdcc8':'#d6e0e7'),background:result?'#eef8f2':'#f7f9fb',fontSize:11.5,lineHeight:1.55,color:'#405466'}}>{message}</div>:null}

      <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={onDrop} onClick={()=>!busy&&fileInput.current?.click()} style={{border:`2px dashed ${dragging?'#148444':'#b9c8d2'}`,background:dragging?'#f0f8f3':'#fbfcfd',padding:'34px 20px',textAlign:'center',cursor:busy?'default':'pointer'}}>
        <input ref={fileInput} hidden type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFile}/>
        <div style={{width:48,height:54,border:'1px solid #9cafbc',background:'#fff',display:'grid',placeItems:'center',margin:'0 auto 10px',fontFamily:'Georgia,serif',fontWeight:700,color:'#0b2d4e'}}>DOCX</div>
        <div style={{fontFamily:'Georgia,serif',fontWeight:700,fontSize:17,color:'#0b2d4e'}}>{file?file.name:'Drop the final Word paper here'}</div>
        <div style={{fontSize:10.5,color:'#71808c',marginTop:5}}>{file?`${(file.size/1024/1024).toFixed(2)} MB · click to replace`:'or click to choose a .docx file · maximum 25 MB'}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8,marginTop:14}}>
        {[
          ['Header','GREEN journal name + Volume / Issue + Month / Year'],
          ['Footer','Article ID + Volume / Issue + automatic page number'],
          ['Numbering','Volume and Issue calculated automatically'],
          ['Paper','Original Word content and formatting preserved'],
        ].map(([title,text])=><div key={title} style={{padding:'10px 11px',border:'1px solid #e0e6ea',background:'#fafcfd'}}><div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.08em',fontWeight:800,color:'#148444'}}>{title}</div><div style={{fontSize:10.5,color:'#586a78',lineHeight:1.45,marginTop:3}}>{text}</div></div>)}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap',marginTop:16,paddingTop:14,borderTop:'1px solid #e2e8ec'}}>
        <div style={{fontSize:10.5,color:'#6b7b87'}}>No manual Month, Year, Volume or Issue entry is required.</div>
        <button className="btn btnGreen" type="button" disabled={!file||busy} onClick={prepareWord}>{busy?'Preparing Word…':'Add Header & Footer'}</button>
      </div>

      {result?<div style={{marginTop:18,border:'1px solid #c7dfd0',background:'#f5fbf7',padding:14}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
          <div style={{minWidth:0,flex:'1 1 420px'}}>
            <div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#148444'}}>Prepared GREEN Paper</div>
            <h3 style={{fontFamily:'Georgia,serif',fontSize:16,color:'#0b2d4e',margin:'4px 0 5px',overflowWrap:'anywhere'}}>{result.title}</h3>
            <div style={{fontSize:10.5,color:'#586b79'}}>{result.authors}{result.affiliation?` · ${result.affiliation}`:''}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:9}}><span style={{fontSize:10,padding:'4px 7px',background:'#fff',border:'1px solid #d5e4db'}}>{result.articleId}</span><span style={{fontSize:10,padding:'4px 7px',background:'#fff',border:'1px solid #d5e4db'}}>Volume {result.volume} · Issue {result.issue}</span><span style={{fontSize:10,padding:'4px 7px',background:'#fff',border:'1px solid #d5e4db'}}>{result.month} {result.year}</span></div>
          </div>
          {result.downloadUrl?<a className="btn btnGreen" href={result.downloadUrl}>Download Prepared Word</a>:null}
        </div>
        <div style={{fontSize:10.5,color:'#687986',marginTop:11,paddingTop:10,borderTop:'1px solid #dce9e1'}}>The publication record is saved as Draft. After checking the prepared Word file, save/export it as PDF and attach the final PDF before publishing.</div>
      </div>:null}
    </div>
  </section>
}
