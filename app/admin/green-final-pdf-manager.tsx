'use client'

import {FormEvent,useEffect,useMemo,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type PendingPaper={
  id:string
  article_id:string|null
  title:string
  authors:string
  status:'draft'|'published'|'archived'
  pdf_path:string
  publication_year:number|null
  publication_month:string|null
  volume:string|null
  issue:string|null
}

const months=['January','February','March','April','May','June','July','August','September','October','November','December']

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')
}

function safeSearch(value:string){
  return value.replace(/[%_,()'\"]/g,' ').replace(/\s+/g,' ').trim()
}

export default function GreenFinalPdfManager(){
  const supabase=useMemo(()=>createClient(),[])
  const db=supabase as unknown as {from:(table:string)=>any}
  const [papers,setPapers]=useState<PendingPaper[]>([])
  const [searchInput,setSearchInput]=useState('')
  const [search,setSearch]=useState('')
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

  useEffect(()=>{setPage(1)},[search,year,month,pageSize])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      let query:any=db.from('green_papers').select('id,article_id,title,authors,status,pdf_path,publication_year,publication_month,volume,issue',{count:'exact'}).like('pdf_path','pending/%')
      if(year.trim())query=query.eq('publication_year',Number(year))
      if(month!=='all')query=query.eq('publication_month',month)
      if(search){
        const pattern=`%${search}%`
        query=query.or(`article_id.ilike.${pattern},title.ilike.${pattern},authors.ilike.${pattern}`)
      }
      query=query.order('created_at',{ascending:false})
      const from=(page-1)*pageSize
      setLoading(true)
      const {data,error,count}=await query.range(from,from+pageSize-1)
      if(cancelled)return
      setLoading(false)
      if(error){setMessage(error.message);setPapers([]);setTotal(0);return}
      const nextTotal=count||0
      const maxPage=Math.max(1,Math.ceil(nextTotal/pageSize))
      if(page>maxPage){setPage(maxPage);return}
      setPapers((data||[]) as PendingPaper[])
      setTotal(nextTotal)
    })()
    return()=>{cancelled=true}
  },[db,search,year,month,page,pageSize,refreshTick])

  async function attachPdf(event:FormEvent<HTMLFormElement>,paper:PendingPaper){
    event.preventDefault()
    const form=event.currentTarget
    const data=new FormData(form)
    const file=data.get('final_pdf') as File
    setMessage('')

    try{
      setBusyId(paper.id)
      if(!file||file.size===0)throw new Error('Select the final GREEN PDF first.')
      if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf'))throw new Error('Final file must be a PDF.')
      if(file.size>50*1024*1024)throw new Error('GREEN PDF must be 50 MB or smaller.')

      const folderYear=paper.publication_year||new Date().getFullYear()
      const path=`${folderYear}/${crypto.randomUUID()}-${safeFileName(file.name)}`
      const {error:uploadError}=await supabase.storage.from('green-papers').upload(path,file,{contentType:'application/pdf',upsert:false})
      if(uploadError)throw uploadError

      const {error:updateError}=await supabase.from('green_papers').update({pdf_path:path,pdf_size:file.size}).eq('id',paper.id)
      if(updateError){
        await supabase.storage.from('green-papers').remove([path])
        throw updateError
      }

      form.reset()
      setMessage(`Final PDF attached to ${paper.article_id||paper.title}.`)
      setRefreshTick(value=>value+1)
    }catch(error){
      setMessage(error instanceof Error?error.message:'Could not attach the final PDF.')
    }finally{
      setBusyId(null)
    }
  }

  const totalPages=Math.max(1,Math.ceil(total/pageSize))
  const start=total?(page-1)*pageSize+1:0
  const end=total?Math.min(page*pageSize,total):0
  const field={width:'100%',padding:'8px 9px',border:'1px solid #cbd6de',background:'#fff',fontSize:11,minWidth:0} as const

  return <section className="contentCard" style={{borderTop:'4px solid #b98624'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
      <div>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:'#8a6112'}}>Final PDF Required</div>
        <h2 style={{margin:'4px 0 5px'}}>GREEN Papers Waiting for Final PDF</h2>
        <p style={{margin:0,fontSize:12,color:'#657483',lineHeight:1.55,maxWidth:900}}>Upload the final PDF you have already prepared and checked. No separate verification checklist is required here.</p>
      </div>
      <span style={{fontSize:10,fontWeight:800,padding:'5px 8px',background:'#fff6df',border:'1px solid #ead59d',color:'#805b13'}}>{total} pending</span>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'minmax(220px,2fr) repeat(3,minmax(120px,1fr))',gap:7,marginTop:12,marginBottom:10}}>
      <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Article ID, title or author…" style={field}/>
      <input value={year} onChange={e=>setYear(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" placeholder="Year" style={field}/>
      <select value={month} onChange={e=>setMonth(e.target.value)} style={field}><option value="all">All months</option>{months.map(value=><option key={value}>{value}</option>)}</select>
      <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} style={field}><option value={25}>25 rows</option><option value={50}>50 rows</option></select>
    </div>

    <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:10}}>
      <span style={{fontSize:11,color:'#687586'}}>{loading?'Loading…':`${total} result(s) · Page ${page} of ${totalPages}`}</span>
      <button className="smallBtn" type="button" onClick={()=>{setSearchInput('');setSearch('');setYear('');setMonth('all')}}>Reset</button>
    </div>

    {message?<div style={{marginBottom:12,padding:'9px 11px',border:'1px solid #cddfe8',background:'#f2f8fb',fontSize:11.5}}>{message}</div>:null}
    {!loading&&!papers.length?<div style={{padding:20,textAlign:'center',fontSize:12,color:'#687586'}}>No GREEN papers are waiting for a final PDF.</div>:null}

    <div style={{display:'grid',gap:10}}>{papers.map(paper=><div key={paper.id} style={{border:'1px solid #dce3e8',padding:12,background:'#fbfcfd'}}>
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(300px,390px)',gap:14,alignItems:'center'}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:9.5,fontWeight:800,color:'#14733d',letterSpacing:'.06em'}}>{paper.article_id||'GREEN PAPER'} · {paper.status.toUpperCase()}</div>
          <div style={{fontFamily:'Georgia,serif',fontWeight:700,color:'#0b2d4e',fontSize:14,marginTop:3,overflowWrap:'anywhere'}}>{paper.title}</div>
          <div style={{fontSize:10.5,color:'#687586',marginTop:3}}>{paper.authors}</div>
          <div style={{fontSize:10.5,color:'#506474',marginTop:6,fontWeight:700}}>{[paper.publication_month,paper.publication_year].filter(Boolean).join(' ')}{paper.volume?` · Volume ${paper.volume}`:''}{paper.issue?` · Issue ${paper.issue}`:''}</div>
        </div>

        <form onSubmit={event=>attachPdf(event,paper)} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:7,alignItems:'end'}}>
          <label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Final PDF<input name="final_pdf" type="file" accept="application/pdf,.pdf" required style={{display:'block',width:'100%',marginTop:4,padding:'7px',border:'1px solid #cbd6de',background:'#fff',fontSize:10}}/></label>
          <button className="btn btnGreen compact" type="submit" disabled={busyId===paper.id}>{busyId===paper.id?'Uploading…':'Attach Final PDF'}</button>
        </form>
      </div>
    </div>)}</div>

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:12,flexWrap:'wrap'}}>
      <div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(1)}>« First</button><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(value=>Math.max(1,value-1))}>← Previous</button></div>
      <span style={{fontSize:11,color:'#687586'}}>Showing {start}–{end} of {total}</span>
      <div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(value=>Math.min(totalPages,value+1))}>Next →</button><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(totalPages)}>Last »</button></div>
    </div>
  </section>
}
