'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'draft' | 'published' | 'archived'
type StatusFilter = 'all' | Status
type Kind = 'green' | 'red'
type AttentionFilter = 'all' | 'needs_attention'

type Row = {
  id: string
  article_id?: string | null
  title: string
  status: Status
  pdf_path: string
  cover_path?: string | null
  certificate_path?: string | null
  certificate_uploaded_at?: string | null
  created_at: string
  updated_at?: string | null
  published_at?: string | null
  authors?: string | null
  editors?: string | null
  affiliation?: string | null
  abstract?: string | null
  keywords?: string[] | null
  english_title?: string | null
  english_abstract?: string | null
  publication_year?: number | null
  publication_month?: string | null
  volume?: string | null
  issue?: string | null
  doi?: string | null
  issn?: string | null
}

type StatusCounts = { total:number; published:number; draft:number; archived:number }

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') || 'file.pdf'
}

function safeSearch(value:string){
  return value.replace(/[%_,()'\"]/g,' ').replace(/\s+/g,' ').trim()
}

function normalizeDoi(value:string){
  return value
    .trim()
    .replace(/^doi:\s*/i,'')
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i,'')
    .trim()
}

function needsEnglishSupport(title:string){
  return /[\u0900-\u0DFF]/.test(title)
}

function hasGarbledIndicMetadata(item:Row){
  const value=[item.abstract||'',...(item.keywords||[])].join(' ')
  if(!value)return false
  if(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFD]/.test(value))return true
  const indic=(value.match(/[\u0900-\u097F\u0A80-\u0AFF]/g)||[]).length
  if(indic<20)return false
  const suspicious=(value.match(/[#&$<>]/g)||[]).length
  const broken=(value.match(/(?:[\u0900-\u097F\u0A80-\u0AFF][0-9#&$?]|[0-9#&$?][\u0900-\u097F\u0A80-\u0AFF])/g)||[]).length
  return suspicious>=3||broken>=3
}

function missingGreenFields(item:Row){
  const missing:string[]=[]
  if(!item.authors?.trim())missing.push('Author(s)')
  if(!item.affiliation?.trim())missing.push('Affiliation')
  if(!item.abstract?.trim())missing.push('Abstract')
  if(!item.keywords?.length)missing.push('Keywords')
  if(!item.publication_month?.trim())missing.push('Month')
  if(!item.publication_year)missing.push('Year')
  if(!item.volume?.trim())missing.push('Volume')
  if(!item.issue?.trim())missing.push('Issue')
  if(!item.certificate_path)missing.push('Certificate')
  if(needsEnglishSupport(item.title) && (!item.english_title?.trim() || !item.english_abstract?.trim()))missing.push('English Metadata')
  if(hasGarbledIndicMetadata(item))missing.push('Metadata Review')
  return missing
}

type Props = {
  initialKind?: Kind
  lockedKind?: Kind
  showStats?: boolean
  initialStatus?: StatusFilter
}

export default function ManagementConsole({initialKind='green',lockedKind,showStats=true,initialStatus='all'}:Props) {
  const supabase = useMemo(()=>createClient(),[])
  const db = supabase as unknown as { from:(table:string)=>any }
  const [kind, setKind] = useState<Kind>(lockedKind || initialKind)
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({total:0,published:0,draft:0,archived:0})
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatusFilter] = useState<StatusFilter>(initialStatus)
  const [attention,setAttention] = useState<AttentionFilter>('all')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('all')
  const [volume, setVolume] = useState('')
  const [issue, setIssue] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title' | 'year'>('newest')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [editing, setEditing] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => { if (lockedKind) setKind(lockedKind) }, [lockedKind])
  useEffect(() => { if(kind==='red')setAttention('all') }, [kind])
  useEffect(() => {
    const timer=window.setTimeout(()=>setSearch(safeSearch(searchInput)),300)
    return ()=>window.clearTimeout(timer)
  },[searchInput])
  useEffect(() => {
    setPage(1)
    setSelected(new Set())
    setEditing(null)
  }, [kind, search, status, attention, year, month, volume, issue, sort, pageSize])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      const table=kind==='green'?'green_papers':'red_books'
      const selectColumns=kind==='green'
        ? 'id,article_id,title,authors,affiliation,abstract,keywords,english_title,english_abstract,status,pdf_path,certificate_path,certificate_uploaded_at,publication_year,publication_month,volume,issue,doi,published_at,created_at,updated_at'
        : 'id,title,editors,status,pdf_path,cover_path,publication_year,publication_month,volume,issue,issn,published_at,created_at,updated_at'
      let query:any=db.from(table).select(selectColumns,{count:'exact'})
      if(status!=='all')query=query.eq('status',status)
      if(kind==='green'&&attention==='needs_attention')query=query.or('authors.is.null,affiliation.is.null,abstract.is.null,keywords.is.null,keywords.eq.{},publication_month.is.null,publication_year.is.null,volume.is.null,issue.is.null,certificate_path.is.null')
      if(year.trim())query=query.eq('publication_year',Number(year))
      if(month!=='all')query=query.eq('publication_month',month)
      if(volume.trim())query=query.eq('volume',volume.trim())
      if(issue.trim())query=query.eq('issue',issue.trim())
      if(search){
        const pattern=`%${search}%`
        query=kind==='green'
          ? query.or(`article_id.ilike.${pattern},title.ilike.${pattern},authors.ilike.${pattern}`)
          : query.or(`title.ilike.${pattern},editors.ilike.${pattern}`)
      }
      if(sort==='oldest')query=query.order('created_at',{ascending:true})
      else if(sort==='title')query=query.order('title',{ascending:true})
      else if(sort==='year')query=query.order('publication_year',{ascending:false}).order('created_at',{ascending:false})
      else query=query.order('created_at',{ascending:false})

      const from=(page-1)*pageSize
      const to=from+pageSize-1
      setLoading(true)
      const {data,error,count}=await query.range(from,to)
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
  },[db,kind,search,status,attention,year,month,volume,issue,sort,page,pageSize,refreshTick])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      const table=kind==='green'?'green_papers':'red_books'
      const [all,published,draft,archived]=await Promise.all([
        db.from(table).select('id',{count:'exact',head:true}),
        db.from(table).select('id',{count:'exact',head:true}).eq('status','published'),
        db.from(table).select('id',{count:'exact',head:true}).eq('status','draft'),
        db.from(table).select('id',{count:'exact',head:true}).eq('status','archived'),
      ])
      if(cancelled)return
      const error=all.error||published.error||draft.error||archived.error
      if(error){setMessage(error.message);return}
      setStatusCounts({total:all.count||0,published:published.count||0,draft:draft.count||0,archived:archived.count||0})
    })()
    return()=>{cancelled=true}
  },[db,kind,refreshTick])

  const totalPages=Math.max(1,Math.ceil(total/pageSize))
  const start=total?((page-1)*pageSize)+1:0
  const end=total?Math.min(page*pageSize,total):0

  function refresh(){setRefreshTick(v=>v+1)}

  async function changeStatus(item: Row, next: Status) {
    setBusy(true); setMessage('')
    const table = kind === 'green' ? 'green_papers' : 'red_books'
    const { error } = await db.from(table).update({ status: next, published_at: next === 'published' ? new Date().toISOString() : null }).eq('id', item.id)
    setMessage(error ? error.message : `“${item.title}” changed to ${next}.`)
    setSelected(new Set());refresh();setBusy(false)
  }

  async function bulkStatus(next: Status) {
    if (!selected.size) return
    setBusy(true); setMessage('')
    const table = kind === 'green' ? 'green_papers' : 'red_books'
    const ids = Array.from(selected)
    const { error } = await db.from(table).update({ status: next, published_at: next === 'published' ? new Date().toISOString() : null }).in('id', ids)
    setMessage(error ? error.message : `${ids.length} publication(s) changed to ${next}.`)
    setSelected(new Set());refresh();setBusy(false)
  }

  async function openPublicationPdf(item:Row,download=false){
    if(!item.pdf_path)return
    const bucket=kind==='green'?'green-papers':'red-books'
    const {data,error}=await supabase.storage.from(bucket).createSignedUrl(item.pdf_path,600,download?{download:true}:undefined)
    if(error||!data?.signedUrl){setMessage(error?.message||'Could not open PDF.');return}
    window.open(data.signedUrl,'_blank','noopener,noreferrer')
  }

  async function openCertificate(item:Row,download=false){
    if(!item.certificate_path)return
    const {data,error}=await supabase.storage.from('green-certificates').createSignedUrl(item.certificate_path,600,download?{download:true}:undefined)
    if(error||!data?.signedUrl){setMessage(error?.message||'Could not open certificate.');return}
    window.open(data.signedUrl,'_blank','noopener,noreferrer')
  }

  async function removeCertificate(item:Row){
    if(!item.certificate_path||!confirm(`Remove certificate for “${item.title}”?`))return
    setBusy(true);setMessage('')
    const oldPath=item.certificate_path
    const {error}=await db.from('green_papers').update({certificate_path:null,certificate_uploaded_at:null}).eq('id',item.id)
    if(error){setMessage(error.message);setBusy(false);return}
    await supabase.storage.from('green-certificates').remove([oldPath])
    setMessage('Certificate removed.');refresh();setBusy(false)
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, item: Row) {
    event.preventDefault(); setBusy(true); setMessage('')
    const f = new FormData(event.currentTarget)
    const table = kind === 'green' ? 'green_papers' : 'red_books'
    let newPdfPath = ''
    let newCertificatePath = ''
    try {
      const updates: Record<string, string | number | string[] | null> = {
        title: String(f.get('title') || '').trim(),
        publication_year: Number(f.get('publication_year')) || null,
        volume: String(f.get('volume') || '').trim() || null,
        issue: String(f.get('issue') || '').trim() || null,
      }
      if (kind === 'green') {
        updates.authors = String(f.get('authors') || '').trim()
        updates.affiliation = String(f.get('affiliation') || '').trim() || null
        updates.abstract = String(f.get('abstract') || '').trim() || null
        const keywordValues=String(f.get('keywords') || '').split(/[,;\n]+/).map(value=>value.trim()).filter(Boolean)
        updates.keywords = Array.from(new Set(keywordValues))
        const doi=normalizeDoi(String(f.get('doi') || ''))
        if(doi && !/^10\.\d{4,9}\/\S+$/i.test(doi))throw new Error('Enter a valid DOI, for example 10.1234/ired.green.2026.0008.')
        updates.doi = doi || null
        updates.publication_month = String(f.get('publication_month') || '').trim() || null
        const yearFolder = Number(updates.publication_year) || item.publication_year || new Date().getFullYear()

        const replacement = f.get('replacement_pdf') as File
        if (replacement && replacement.size > 0) {
          if (replacement.type !== 'application/pdf' && !replacement.name.toLowerCase().endsWith('.pdf')) throw new Error('Replacement file must be a PDF.')
          if (replacement.size > 50 * 1024 * 1024) throw new Error('Replacement GREEN paper PDF must be 50 MB or less.')
          newPdfPath = `${yearFolder}/${crypto.randomUUID()}-${safeFileName(replacement.name)}`
          const { error: uploadError } = await supabase.storage.from('green-papers').upload(newPdfPath, replacement, { contentType:'application/pdf', upsert:false })
          if (uploadError) throw uploadError
          updates.pdf_path = newPdfPath
          updates.pdf_size = replacement.size
        }

        const certificate = f.get('certificate_pdf') as File
        if (certificate && certificate.size > 0) {
          if (certificate.type !== 'application/pdf' && !certificate.name.toLowerCase().endsWith('.pdf')) throw new Error('Certificate must be a PDF file.')
          if (certificate.size > 10 * 1024 * 1024) throw new Error('Certificate PDF must be 10 MB or less.')
          newCertificatePath = `${yearFolder}/${item.id}/${crypto.randomUUID()}-${safeFileName(certificate.name)}`
          const { error: certificateError } = await supabase.storage.from('green-certificates').upload(newCertificatePath, certificate, { contentType:'application/pdf', upsert:false })
          if (certificateError) throw certificateError
          updates.certificate_path = newCertificatePath
          updates.certificate_uploaded_at = new Date().toISOString()
        }
      } else {
        updates.editors = String(f.get('editors') || '').trim() || null
        updates.publication_month = String(f.get('publication_month') || '').trim() || null
        updates.issn = String(f.get('issn') || '').trim() || null
        updates.publication_label = [updates.publication_month, updates.publication_year].filter(Boolean).join(' ') || null
      }
      const { error } = await db.from(table).update(updates).eq('id', item.id)
      if (error) throw error
      if (newPdfPath && item.pdf_path && item.pdf_path !== newPdfPath) await supabase.storage.from('green-papers').remove([item.pdf_path])
      if (newCertificatePath && item.certificate_path && item.certificate_path !== newCertificatePath) await supabase.storage.from('green-certificates').remove([item.certificate_path])
      const changedFiles=[newPdfPath?'paper PDF':null,newCertificatePath?'certificate':null].filter(Boolean).join(' and ')
      setMessage(changedFiles ? `Publication details and ${changedFiles} updated successfully.` : 'Publication details updated.')
      setEditing(null);refresh()
    } catch (error) {
      if (newPdfPath) await supabase.storage.from('green-papers').remove([newPdfPath])
      if (newCertificatePath) await supabase.storage.from('green-certificates').remove([newCertificatePath])
      setMessage(error instanceof Error ? error.message : 'Could not update publication.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteItem(item: Row) {
    if (!confirm(`Permanently delete “${item.title}”? Archive is safer for old publications.`)) return
    setBusy(true); setMessage('')
    const table = kind === 'green' ? 'green_papers' : 'red_books'
    const bucket = kind === 'green' ? 'green-papers' : 'red-books'
    if (item.pdf_path) await supabase.storage.from(bucket).remove([item.pdf_path])
    if (kind === 'green' && item.certificate_path) await supabase.storage.from('green-certificates').remove([item.certificate_path])
    if (kind === 'red' && item.cover_path) await supabase.storage.from('red-book-covers').remove([item.cover_path])
    const { error } = await db.from(table).delete().eq('id', item.id)
    setMessage(error ? error.message : 'Publication permanently deleted.')
    setSelected(new Set());refresh();setBusy(false)
  }

  function resetFilters(){
    setSearchInput('');setSearch('');setStatusFilter('all');setAttention('all');setYear('');setMonth('all');setVolume('');setIssue('');setSort('newest');setPage(1)
  }

  const control = {padding:'8px 10px',border:'1px solid #cbd5df',borderRadius:5,background:'#fff',fontSize:12,minWidth:0} as const
  const btn = {padding:'7px 10px',border:'1px solid #cbd5df',borderRadius:5,background:'#fff',cursor:'pointer',fontSize:11,fontWeight:700} as const
  const primary = {...btn,background:'#12395c',borderColor:'#12395c',color:'#fff'} as const
  const danger = {...btn,background:'#fff5f5',borderColor:'#efc5c5',color:'#9d2525'} as const
  const statusOptions:Array<[StatusFilter,string,number]>=[['all','All',statusCounts.total],['draft','Drafts',statusCounts.draft],['published','Published',statusCounts.published],['archived','Archived',statusCounts.archived]]

  return <section id="dashboard" style={{display:'grid',gap:18,marginTop:20}}>
    {showStats ? <div className="stats">
      <div className="stat"><span>{kind==='green'?'GREEN Records':'RED Records'}</span><strong>{statusCounts.total}</strong></div>
      <div className="stat"><span>Published</span><strong>{statusCounts.published}</strong></div>
      <div className="stat"><span>Drafts</span><strong>{statusCounts.draft}</strong></div>
      <div className="stat"><span>Archived</span><strong>{statusCounts.archived}</strong></div>
    </div> : null}

    {message ? <div style={{padding:'10px 12px',background:'#eef6fb',border:'1px solid #c9dce9',borderRadius:6,fontSize:12}}>{message}</div> : null}

    <div className="contentCard" id={kind === 'green' ? 'green-manager' : 'red-manager'}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap',marginBottom:12}}>
        <div>
          <h2 style={{margin:'0 0 4px'}}>{kind === 'green' ? 'GREEN Papers Manager' : 'RED Publications Manager'}</h2>
          <div style={{fontSize:12,color:'#687586'}}>{kind==='green'?'Database-side search, filters and pagination. Missing badges show what still needs attention; DOI Pending is informational and does not block completeness.':'Database-side search, filters and pagination for RED print publication records.'}</div>
        </div>
        {!lockedKind ? <div style={{display:'flex',gap:6}}>
          <button type="button" style={kind==='green'?primary:btn} onClick={()=>setKind('green')}>GREEN Papers</button>
          <button type="button" style={kind==='red'?{...primary,background:'#bd2025',borderColor:'#bd2025'}:btn} onClick={()=>setKind('red')}>RED Publications</button>
        </div> : <div style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:kind==='green'?'#16723b':'#a8282d'}}>{statusCounts.total} record(s)</div>}
      </div>

      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
        {statusOptions.map(([value,labelText,count])=><button key={value} type="button" onClick={()=>setStatusFilter(value)} style={status===value?{...primary,background:kind==='green'?'#16723b':'#a8282d',borderColor:kind==='green'?'#16723b':'#a8282d'}:btn}>{labelText} ({count})</button>)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8,marginBottom:10}}>
        <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder={kind==='green'?'Article ID, title or author…':'Title or editor…'} style={control}/>
        <input value={year} onChange={e=>setYear(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" placeholder="Year" style={control}/>
        <select value={month} onChange={e=>setMonth(e.target.value)} style={control}><option value="all">All months</option>{months.map(m=><option key={m} value={m}>{m}</option>)}</select>
        <input value={volume} onChange={e=>setVolume(e.target.value)} placeholder="Volume" style={control}/>
        <input value={issue} onChange={e=>setIssue(e.target.value)} placeholder="Issue" style={control}/>
        {kind==='green'?<select value={attention} onChange={e=>setAttention(e.target.value as AttentionFilter)} style={control}><option value="all">All completeness</option><option value="needs_attention">Needs Attention</option></select>:null}
        <select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} style={control}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option><option value="year">Year ↓</option></select>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginBottom:10,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{fontSize:12,color:'#667'}}>{loading?'Loading…':`${total} result(s) · Page ${page} of ${totalPages}`}</span>
          <button type="button" style={btn} onClick={resetFilters}>Reset filters</button>
          <label style={{fontSize:11,color:'#667'}}>Rows <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} style={{...control,padding:'6px 7px',marginLeft:4}}><option value={25}>25</option><option value={50}>50</option></select></label>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{fontSize:11,color:'#667'}}>{selected.size} selected</span>
          <button type="button" style={btn} disabled={!selected.size||busy} onClick={()=>bulkStatus('published')}>Publish</button>
          <button type="button" style={btn} disabled={!selected.size||busy} onClick={()=>bulkStatus('draft')}>Move to Draft</button>
          <button type="button" style={btn} disabled={!selected.size||busy} onClick={()=>bulkStatus('archived')}>Archive</button>
        </div>
      </div>

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,minWidth:kind==='green'?1100:920}}>
          <thead><tr style={{background:'#f4f7f9',textAlign:'left'}}>
            <th style={{padding:8}}><input type="checkbox" checked={rows.length>0 && rows.every(x=>selected.has(x.id))} onChange={e=>{const n=new Set(selected); rows.forEach(x=>e.target.checked?n.add(x.id):n.delete(x.id)); setSelected(n)}}/></th>
            {kind==='red'?<th style={{padding:8}}>Cover</th>:null}<th style={{padding:8}}>Title</th><th style={{padding:8}}>{kind==='green'?'Author(s)':'Editor(s)'}</th><th style={{padding:8}}>Date / Issue</th>{kind==='green'?<th style={{padding:8}}>Pending / Missing</th>:null}{kind==='green'?<th style={{padding:8}}>Certificate</th>:null}<th style={{padding:8}}>Status</th><th style={{padding:8}}>Updated</th><th style={{padding:8}}>Actions</th>
          </tr></thead>
          <tbody>{rows.map(item => {
            const coverUrl = kind==='red' && item.cover_path ? supabase.storage.from('red-book-covers').getPublicUrl(item.cover_path).data.publicUrl : null
            const missing=kind==='green'?missingGreenFields(item):[]
            const doiPending=kind==='green'&&!item.doi?.trim()
            return <tr key={item.id} style={{borderTop:'1px solid #e4e9ed',verticalAlign:'top'}}>
              <td style={{padding:8}}><input type="checkbox" checked={selected.has(item.id)} onChange={e=>{const n=new Set(selected); e.target.checked?n.add(item.id):n.delete(item.id); setSelected(n)}}/></td>
              {kind==='red'?<td style={{padding:8}}>{coverUrl?<img src={coverUrl} alt="" style={{width:36,height:50,objectFit:'cover',border:'1px solid #ddd'}}/>:<span style={{fontSize:10,color:'#9b5b5b'}}>No cover</span>}</td>:null}
              <td style={{padding:8,maxWidth:260}}><strong>{item.title}</strong><div style={{fontSize:10,color:'#7a8792',marginTop:3}}>ID: {kind==='green'&&item.article_id?item.article_id:`${item.id.slice(0,8)}…`}</div>{kind==='green'&&item.doi?<div style={{fontSize:10,color:'#536b7d',marginTop:2}}>DOI: {item.doi}</div>:null}</td>
              <td style={{padding:8}}>{kind==='green' ? item.authors : item.editors || '—'}</td>
              <td style={{padding:8}}>{item.publication_month ? `${item.publication_month} ` : ''}{item.publication_year || '—'}{item.volume ? ` · Vol ${item.volume}` : ''}{item.issue ? ` · Issue ${item.issue}` : ''}</td>
              {kind==='green'?<td style={{padding:8,minWidth:180}}><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{missing.length?missing.map(label=><span key={label} style={{padding:'3px 6px',borderRadius:999,background:label==='Metadata Review'?'#fff0f0':'#fff7e7',border:`1px solid ${label==='Metadata Review'?'#efc5c5':'#ead29a'}`,color:label==='Metadata Review'?'#9d2525':'#8a6412',fontSize:9.5,fontWeight:800}}>{label}</span>):<span style={{padding:'3px 7px',borderRadius:999,background:'#eef8f2',border:'1px solid #cfe5d6',color:'#176f3d',fontSize:9.5,fontWeight:800}}>Complete</span>}{doiPending?<span style={{padding:'3px 7px',borderRadius:999,background:'#f4f6f8',border:'1px solid #d8e0e6',color:'#667784',fontSize:9.5,fontWeight:700}}>DOI Pending</span>:null}</div></td>:null}
              {kind==='green'?<td style={{padding:8}}>{item.certificate_path?<span style={{fontSize:10,fontWeight:700,color:'#16723b'}}>Ready</span>:<span style={{fontSize:10,color:'#8a6d2b'}}>Not uploaded</span>}</td>:null}
              <td style={{padding:8}}><span style={{padding:'3px 7px',borderRadius:12,background:item.status==='published'?'#e6f5ec':item.status==='archived'?'#eee':'#fff4db',color:item.status==='published'?'#16723b':item.status==='archived'?'#555':'#8a6112',fontSize:10,fontWeight:700}}>{item.status}</span></td>
              <td style={{padding:8,whiteSpace:'nowrap'}}>{new Date(item.updated_at || item.created_at).toLocaleDateString()}</td>
              <td style={{padding:8}}><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                <button style={btn} type="button" onClick={()=>setEditing(editing===item.id?null:item.id)}>Edit & Files</button>
                <button style={btn} type="button" onClick={()=>openPublicationPdf(item,false)}>View PDF</button>
                {kind==='green'&&item.certificate_path?<button style={btn} type="button" onClick={()=>openCertificate(item,false)}>Certificate</button>:null}
                <button style={btn} type="button" disabled={busy} onClick={()=>changeStatus(item,item.status==='published'?'draft':'published')}>{item.status==='published'?'Unpublish':'Publish'}</button>
                <button style={btn} type="button" disabled={busy||item.status==='archived'} onClick={()=>changeStatus(item,'archived')}>Archive</button>
                <button style={danger} type="button" disabled={busy} onClick={()=>deleteItem(item)}>Delete</button>
              </div>
              {editing===item.id ? <form onSubmit={e=>saveEdit(e,item)} style={{marginTop:8,padding:10,border:'1px solid #dce4ea',borderRadius:5,background:'#fafcfd',minWidth:420}}>
                <div style={{fontSize:11,fontWeight:800,color:'#173d60',marginBottom:7}}>{kind==='green'?'Paper details':'Publication details'}</div>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:6}}><input name="title" defaultValue={item.title} required style={control}/><input name="publication_year" type="number" defaultValue={item.publication_year || ''} placeholder="Year" style={control}/><input name="volume" defaultValue={item.volume || ''} placeholder="Volume" style={control}/></div>
                <div style={{display:'grid',gridTemplateColumns:kind==='green'?'2fr 1fr':'2fr 1fr 1fr',gap:6,marginTop:6}}>{kind==='green'?<input name="authors" defaultValue={item.authors || ''} placeholder="Authors" style={control}/>:<input name="editors" defaultValue={item.editors || ''} placeholder="Editors" style={control}/>}<input name="issue" defaultValue={item.issue || ''} placeholder="Issue" style={control}/>{kind==='red'?<select name="publication_month" defaultValue={item.publication_month || ''} style={control}><option value="">Month</option>{months.map(m=><option key={m}>{m}</option>)}</select>:null}</div>
                {kind==='green'?<div style={{display:'grid',gridTemplateColumns:'minmax(150px,1fr) minmax(260px,2fr)',gap:8,marginTop:8}}>
                  <label style={{display:'grid',gap:4,fontSize:10,fontWeight:800,color:'#315a42'}}>Publication Month<select name="publication_month" defaultValue={item.publication_month || ''} style={{...control,width:'100%'}}><option value="">Select month</option>{months.map(m=><option key={m}>{m}</option>)}</select></label>
                  <label style={{display:'grid',gap:4,fontSize:10,fontWeight:800,color:'#31506c'}}>DOI<input name="doi" defaultValue={item.doi || ''} placeholder="10.xxxx/xxxxx or https://doi.org/10.xxxx/xxxxx" autoComplete="off" style={{...control,width:'100%'}}/></label>
                </div>:null}
                {kind==='green'?<div style={{fontSize:9.5,color:'#6b7782',marginTop:4}}>When a DOI is assigned later, paste either the DOI itself or the full doi.org URL. The saved value is normalized automatically and appears on the public article page.</div>:null}
                {kind==='green'?<div style={{display:'grid',gap:8,marginTop:9,padding:10,border:'1px solid #dce4ea',borderRadius:5,background:'#fff'}}>
                  <div style={{fontSize:10.5,fontWeight:800,color:'#173d60'}}>Article Metadata</div>
                  <label style={{display:'grid',gap:4,fontSize:10,fontWeight:800,color:'#31506c'}}>Affiliation<textarea name="affiliation" defaultValue={item.affiliation || ''} rows={2} placeholder="Department, institution, city, state/country" style={{...control,width:'100%',resize:'vertical',fontFamily:'inherit',lineHeight:1.45}}/></label>
                  <label style={{display:'grid',gap:4,fontSize:10,fontWeight:800,color:'#31506c'}}>Keywords<textarea name="keywords" defaultValue={(item.keywords || []).join(', ')} rows={2} placeholder="Machine Learning, Software Defects, Prediction" style={{...control,width:'100%',resize:'vertical',fontFamily:'inherit',lineHeight:1.45}}/></label>
                  <label style={{display:'grid',gap:4,fontSize:10,fontWeight:800,color:'#31506c'}}>Abstract<textarea name="abstract" defaultValue={item.abstract || ''} rows={7} placeholder="Full article abstract" style={{...control,width:'100%',resize:'vertical',fontFamily:'inherit',lineHeight:1.5}}/></label>
                  <div style={{fontSize:9.5,color:'#6b7782'}}>Keywords may be separated by commas, semicolons or new lines. Blank fields can be added later, and existing metadata can be corrected here.</div>
                </div>:null}
                {kind==='green'?<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:9}}>
                  <div style={{padding:'9px',background:'#f3f8f5',border:'1px solid #d8e8de',borderRadius:5}}><div style={{fontSize:10.5,fontWeight:800,color:'#315a42',marginBottom:5}}>Paper PDF</div><div style={{fontSize:9.5,color:'#6b7c72',marginBottom:6,overflowWrap:'anywhere'}}>Current: {item.pdf_path.split('/').pop() || item.pdf_path}</div><input name="replacement_pdf" type="file" accept="application/pdf,.pdf" style={{...control,width:'100%'}}/><div style={{fontSize:9.5,color:'#77857d',marginTop:4}}>Optional replacement · max 50 MB.</div></div>
                  <div style={{padding:'9px',background:'#f6f8fb',border:'1px solid #dbe3ea',borderRadius:5}}><div style={{fontSize:10.5,fontWeight:800,color:'#31506c',marginBottom:5}}>Certificate PDF</div><div style={{fontSize:9.5,color:'#6b7782',marginBottom:6}}>{item.certificate_path?`Current: ${item.certificate_path.split('/').pop()||'certificate.pdf'}`:'No certificate uploaded yet.'}</div><input name="certificate_pdf" type="file" accept="application/pdf,.pdf" style={{...control,width:'100%'}}/><div style={{fontSize:9.5,color:'#77857d',marginTop:4}}>Upload or replace · max 10 MB.</div>{item.certificate_path?<div style={{display:'flex',gap:5,marginTop:6,flexWrap:'wrap'}}><button type="button" style={btn} onClick={()=>openCertificate(item,false)}>View</button><button type="button" style={btn} onClick={()=>openCertificate(item,true)}>Download</button><button type="button" style={danger} onClick={()=>removeCertificate(item)}>Delete Certificate</button></div>:null}</div>
                </div>:null}
                {kind==='red'?<div style={{marginTop:6}}><input name="issn" defaultValue={item.issn || ''} placeholder="ISSN" style={{...control,width:'100%'}}/></div>:null}
                <div style={{display:'flex',gap:6,marginTop:9}}><button type="submit" style={primary} disabled={busy}>{busy?'Saving…':'Save changes'}</button><button type="button" style={btn} onClick={()=>setEditing(null)}>Cancel</button></div>
              </form>:null}</td>
            </tr>
          })}</tbody>
        </table>
        {!loading&&!rows.length ? <div style={{padding:24,textAlign:'center',color:'#687586'}}>No publications match these filters.</div> : null}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:12,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}><button type="button" style={btn} disabled={page<=1||loading} onClick={()=>setPage(1)}>« First</button><button type="button" style={btn} disabled={page<=1||loading} onClick={()=>setPage(p=>Math.max(1,p-1))}>← Previous</button></div>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#667'}}><span>Showing {start}–{end} of {total}</span><label>Page <input type="number" min={1} max={totalPages} value={page} onChange={e=>setPage(Math.min(totalPages,Math.max(1,Number(e.target.value)||1)))} style={{...control,width:66,padding:'5px 6px'}}/></label></div>
        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}><button type="button" style={btn} disabled={page>=totalPages||loading} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next →</button><button type="button" style={btn} disabled={page>=totalPages||loading} onClick={()=>setPage(totalPages)}>Last »</button></div>
      </div>
    </div>
  </section>
}