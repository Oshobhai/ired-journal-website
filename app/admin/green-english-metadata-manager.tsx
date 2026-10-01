'use client'

import {useEffect,useMemo,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type Row={
  id:string
  article_id:string|null
  title:string
  status:string
  publication_year:number|null
  publication_month:string|null
  english_title:string|null
  english_abstract:string|null
}

type StatusFilter='all'|'draft'|'published'|'archived'

const months=['January','February','March','April','May','June','July','August','September','October','November','December']

function needsEnglishSupport(title:string){
  return /[\u0900-\u0DFF]/.test(title)
}

function safeSearch(value:string){
  return value.replace(/[%_,()'\"]/g,' ').replace(/\s+/g,' ').trim()
}

export default function GreenEnglishMetadataManager(){
  const supabase=useMemo(()=>createClient(),[])
  const db=supabase as unknown as {from:(table:string)=>any}
  const [rows,setRows]=useState<Row[]>([])
  const [searchInput,setSearchInput]=useState('')
  const [search,setSearch]=useState('')
  const [status,setStatus]=useState<StatusFilter>('all')
  const [year,setYear]=useState('')
  const [month,setMonth]=useState('all')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState(25)
  const [total,setTotal]=useState(0)
  const [loading,setLoading]=useState(false)
  const [busyId,setBusyId]=useState<string|null>(null)
  const [message,setMessage]=useState('')
  const [refreshTick,setRefreshTick]=useState(0)

  useEffect(()=>{
    const timer=window.setTimeout(()=>setSearch(safeSearch(searchInput)),300)
    return()=>window.clearTimeout(timer)
  },[searchInput])

  useEffect(()=>{setPage(1)},[search,status,year,month,pageSize])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      let query:any=db.from('green_papers').select('id,article_id,title,status,publication_year,publication_month,english_title,english_abstract',{count:'exact'})
      if(status!=='all')query=query.eq('status',status)
      if(year.trim())query=query.eq('publication_year',Number(year))
      if(month!=='all')query=query.eq('publication_month',month)
      if(search){
        const pattern=`%${search}%`
        query=query.or(`article_id.ilike.${pattern},title.ilike.${pattern},english_title.ilike.${pattern}`)
      }
      query=query.order('created_at',{ascending:false})
      const from=(page-1)*pageSize
      setLoading(true)
      const {data,error,count}=await query.range(from,from+pageSize-1)
      if(cancelled)return
      setLoading(false)
      if(error){setMessage(error.message);setRows([]);setTotal(0);return}
      const nextTotal=count||0
      const maxPage=Math.max(1,Math.ceil(nextTotal/pageSize))
      if(page>maxPage){setPage(maxPage);return}
      setRows((data||[]) as Row[])
      setTotal(nextTotal)
    })()
    return()=>{cancelled=true}
  },[db,search,status,year,month,page,pageSize,refreshTick])

  async function save(row:Row,form:HTMLFormElement){
    setBusyId(row.id);setMessage('')
    const data=new FormData(form)
    const english_title=String(data.get('english_title')||'').trim()||null
    const english_abstract=String(data.get('english_abstract')||'').trim()||null
    const {error}=await supabase.from('green_papers').update({english_title,english_abstract}).eq('id',row.id)
    if(error)setMessage(error.message)
    else{
      setMessage(`${row.article_id||'GREEN paper'} English bibliographic details updated.`)
      setRefreshTick(value=>value+1)
    }
    setBusyId(null)
  }

  const totalPages=Math.max(1,Math.ceil(total/pageSize))
  const start=total?(page-1)*pageSize+1:0
  const end=total?Math.min(page*pageSize,total):0
  const field={width:'100%',padding:'8px 9px',border:'1px solid #cbd6de',background:'#fff',fontSize:11.5,minWidth:0} as const

  return <section className="contentCard" style={{borderTop:'4px solid #148444'}}>
    <div style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#148444'}}>ISSN Scrutiny Support</div>
    <h2 style={{margin:'4px 0 5px'}}>English Bibliographic Details</h2>
    <p style={{margin:'0 0 12px',fontSize:11.5,lineHeight:1.6,color:'#617181'}}>English bibliographic support is loaded page-by-page, so this workspace remains usable as the GREEN archive grows.</p>

    <div style={{display:'grid',gridTemplateColumns:'minmax(220px,2fr) repeat(4,minmax(120px,1fr))',gap:7,marginBottom:10}}>
      <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Article ID, original or English title…" style={field}/>
      <select value={status} onChange={e=>setStatus(e.target.value as StatusFilter)} style={field}><option value="all">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option><option value="archived">Archived</option></select>
      <input value={year} onChange={e=>setYear(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" placeholder="Year" style={field}/>
      <select value={month} onChange={e=>setMonth(e.target.value)} style={field}><option value="all">All months</option>{months.map(value=><option key={value}>{value}</option>)}</select>
      <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} style={field}><option value={25}>25 rows</option><option value={50}>50 rows</option></select>
    </div>

    <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:10}}>
      <span style={{fontSize:11,color:'#687586'}}>{loading?'Loading…':`${total} result(s) · Page ${page} of ${totalPages}`}</span>
      <button className="smallBtn" type="button" onClick={()=>{setSearchInput('');setSearch('');setStatus('all');setYear('');setMonth('all')}}>Reset</button>
    </div>

    {message?<div style={{padding:'9px 11px',marginBottom:12,border:'1px solid #cfe0d5',background:'#f3faf5',fontSize:11.5}}>{message}</div>:null}
    {!loading&&!rows.length?<div style={{padding:20,textAlign:'center',color:'#687586',fontSize:12}}>No GREEN papers match these filters.</div>:null}

    <div style={{display:'grid',gap:10}}>{rows.map(row=>{
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

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:12,flexWrap:'wrap'}}>
      <div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(1)}>« First</button><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(value=>Math.max(1,value-1))}>← Previous</button></div>
      <span style={{fontSize:11,color:'#687586'}}>Showing {start}–{end} of {total}</span>
      <div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(value=>Math.min(totalPages,value+1))}>Next →</button><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(totalPages)}>Last »</button></div>
    </div>
  </section>
}
