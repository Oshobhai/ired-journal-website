'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Row = {
  id: string
  article_id: string | null
  title: string
  status: string
  publication_year: number | null
  publication_month: string | null
  english_title: string | null
  english_abstract: string | null
}

function needsEnglishSupport(title:string){
  return /[\u0900-\u0DFF]/.test(title)
}

export default function GreenEnglishMetadataManager(){
  const supabase=createClient()
  const [rows,setRows]=useState<Row[]>([])
  const [search,setSearch]=useState('')
  const [busyId,setBusyId]=useState<string|null>(null)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const {data,error}=await supabase
      .from('green_papers')
      .select('id,article_id,title,status,publication_year,publication_month,english_title,english_abstract')
      .order('created_at',{ascending:false})
    if(error){setMessage(error.message);return}
    setRows((data||[]) as Row[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase()
    return rows.filter(row=>!q||`${row.article_id||''} ${row.title} ${row.english_title||''}`.toLowerCase().includes(q))
  },[rows,search])

  async function save(row:Row,form:HTMLFormElement){
    setBusyId(row.id);setMessage('')
    const data=new FormData(form)
    const english_title=String(data.get('english_title')||'').trim()||null
    const english_abstract=String(data.get('english_abstract')||'').trim()||null
    const {error}=await supabase.from('green_papers').update({english_title,english_abstract}).eq('id',row.id)
    if(error)setMessage(error.message)
    else setMessage(`${row.article_id||'GREEN paper'} English bibliographic details updated.`)
    await load();setBusyId(null)
  }

  const field={width:'100%',padding:'8px 9px',border:'1px solid #cbd6de',background:'#fff',fontSize:11.5} as const

  return <section className="contentCard" style={{marginTop:20,borderTop:'4px solid #148444'}}>
    <div style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#148444'}}>ISSN Scrutiny Support</div>
    <h2 style={{margin:'4px 0 5px'}}>English Bibliographic Details</h2>
    <p style={{margin:'0 0 14px',fontSize:11.5,lineHeight:1.6,color:'#617181'}}>For Gujarati, Hindi or other non-English GREEN papers, add an English title and English abstract/summary here. The original title remains unchanged; these fields provide English bibliographic support for ISSN scrutiny and public article records.</p>
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search article ID or title…" style={{...field,maxWidth:520,marginBottom:12}}/>
    {message?<div style={{padding:'9px 11px',marginBottom:12,border:'1px solid #cfe0d5',background:'#f3faf5',fontSize:11.5}}>{message}</div>:null}
    <div style={{display:'grid',gap:10}}>{filtered.map(row=>{
      const required=needsEnglishSupport(row.title)
      return <form key={row.id} onSubmit={e=>{e.preventDefault();void save(row,e.currentTarget)}} style={{border:'1px solid #dbe4e9',borderLeft:`4px solid ${required?'#b07a12':'#148444'}`,padding:12,background:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap',marginBottom:9}}>
          <div style={{minWidth:0,flex:'1 1 520px'}}><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#657582'}}>{row.article_id||'GREEN Paper'} · {row.status}{row.publication_month?` · ${row.publication_month}`:''}{row.publication_year?` ${row.publication_year}`:''}</div><div style={{fontFamily:'Georgia,serif',fontSize:14,color:'#12395c',lineHeight:1.4,marginTop:3}}>{row.title}</div></div>
          <span style={{fontSize:9.5,fontWeight:800,padding:'4px 8px',borderRadius:999,background:required?'#fff7e7':'#eef8f2',border:`1px solid ${required?'#ead29a':'#cfe5d6'}`,color:required?'#8a6412':'#176f3d'}}>{required?'English support recommended':'English paper / optional'}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'minmax(220px,1fr) minmax(280px,1.4fr)',gap:10,alignItems:'start'}}>
          <label style={{fontSize:10,fontWeight:800,color:'#42586a'}}>English Title<input name="english_title" defaultValue={row.english_title||''} style={{...field,marginTop:4}} placeholder="Official English bibliographic title"/></label>
          <label style={{fontSize:10,fontWeight:800,color:'#42586a'}}>English Abstract / Summary<textarea name="english_abstract" defaultValue={row.english_abstract||''} style={{...field,marginTop:4,minHeight:74,resize:'vertical'}} placeholder="English abstract or concise English summary"/></label>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:9}}><button className="btn btnGreen compact" type="submit" disabled={busyId===row.id}>{busyId===row.id?'Saving…':'Save English Details'}</button></div>
      </form>
    })}</div>
  </section>
}
