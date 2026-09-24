'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'draft' | 'published' | 'archived'
type Kind = 'green' | 'red'

type Row = {
  id: string
  title: string
  status: Status
  pdf_path: string
  cover_path?: string | null
  created_at: string
  updated_at?: string | null
  published_at?: string | null
  authors?: string | null
  editors?: string | null
  publication_year?: number | null
  publication_month?: string | null
  volume?: string | null
  issue?: string | null
  doi?: string | null
  issn?: string | null
}

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const pageSize = 20

type Props = {
  initialKind?: Kind
  lockedKind?: Kind
  showStats?: boolean
}

export default function ManagementConsole({initialKind='green',lockedKind,showStats=true}:Props) {
  const supabase = createClient()
  const [green, setGreen] = useState<Row[]>([])
  const [red, setRed] = useState<Row[]>([])
  const [kind, setKind] = useState<Kind>(lockedKind || initialKind)
  const [search, setSearch] = useState('')
  const [status, setStatusFilter] = useState<'all' | Status>('all')
  const [year, setYear] = useState('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title' | 'year'>('newest')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const [{ data: g, error: ge }, { data: r, error: re }] = await Promise.all([
      supabase.from('green_papers').select('id,title,authors,status,pdf_path,publication_year,volume,issue,doi,published_at,created_at,updated_at').order('created_at', { ascending: false }),
      supabase.from('red_books').select('id,title,editors,status,pdf_path,cover_path,publication_year,publication_month,volume,issue,issn,published_at,created_at,updated_at').order('created_at', { ascending: false }),
    ])
    if (ge || re) setMessage(ge?.message || re?.message || 'Could not load publications.')
    setGreen((g || []) as Row[])
    setRed((r || []) as Row[])
  }, [supabase])

  useEffect(() => { void load() }, [load])
  useEffect(() => { if (lockedKind) setKind(lockedKind) }, [lockedKind])

  const all = kind === 'green' ? green : red
  const years = useMemo(() => Array.from(new Set(all.map(x => x.publication_year).filter(Boolean) as number[])).sort((a,b)=>b-a), [all])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = all.filter(item => {
      const who = kind === 'green' ? item.authors : item.editors
      const matchesText = !q || `${item.title} ${who || ''} ${item.volume || ''} ${item.issue || ''}`.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || item.status === status
      const matchesYear = year === 'all' || String(item.publication_year || '') === year
      return matchesText && matchesStatus && matchesYear
    })
    return [...rows].sort((a,b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'year') return (b.publication_year || 0) - (a.publication_year || 0)
      const ad = new Date(a.created_at).getTime(), bd = new Date(b.created_at).getTime()
      return sort === 'oldest' ? ad - bd : bd - ad
    })
  }, [all, kind, search, status, year, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((Math.min(page,totalPages)-1)*pageSize, Math.min(page,totalPages)*pageSize)

  useEffect(() => { setPage(1); setSelected(new Set()) }, [kind, search, status, year, sort])

  const counts = {
    total: green.length + red.length,
    green: green.length,
    red: red.length,
    published: [...green,...red].filter(x=>x.status==='published').length,
    draft: [...green,...red].filter(x=>x.status==='draft').length,
    archived: [...green,...red].filter(x=>x.status==='archived').length,
  }

  async function changeStatus(item: Row, next: Status) {
    setBusy(true); setMessage('')
    const table = kind === 'green' ? 'green_papers' : 'red_books'
    const { error } = await supabase.from(table).update({ status: next, published_at: next === 'published' ? new Date().toISOString() : null }).eq('id', item.id)
    setMessage(error ? error.message : `“${item.title}” changed to ${next}.`)
    await load(); setBusy(false)
  }

  async function bulkStatus(next: Status) {
    if (!selected.size) return
    setBusy(true); setMessage('')
    const table = kind === 'green' ? 'green_papers' : 'red_books'
    const ids = Array.from(selected)
    const { error } = await supabase.from(table).update({ status: next, published_at: next === 'published' ? new Date().toISOString() : null }).in('id', ids)
    setMessage(error ? error.message : `${ids.length} publication(s) changed to ${next}.`)
    setSelected(new Set()); await load(); setBusy(false)
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, item: Row) {
    event.preventDefault(); setBusy(true); setMessage('')
    const f = new FormData(event.currentTarget)
    const table = kind === 'green' ? 'green_papers' : 'red_books'
    const updates: Record<string, string | number | null> = {
      title: String(f.get('title') || '').trim(),
      publication_year: Number(f.get('publication_year')) || null,
      volume: String(f.get('volume') || '').trim() || null,
      issue: String(f.get('issue') || '').trim() || null,
    }
    if (kind === 'green') {
      updates.authors = String(f.get('authors') || '').trim()
      updates.doi = String(f.get('doi') || '').trim() || null
    } else {
      updates.editors = String(f.get('editors') || '').trim() || null
      updates.publication_month = String(f.get('publication_month') || '').trim() || null
      updates.issn = String(f.get('issn') || '').trim() || null
      updates.publication_label = [updates.publication_month, updates.publication_year].filter(Boolean).join(' ') || null
    }
    const { error } = await supabase.from(table).update(updates).eq('id', item.id)
    setMessage(error ? error.message : 'Publication details updated.')
    if (!error) setEditing(null)
    await load(); setBusy(false)
  }

  async function deleteItem(item: Row) {
    if (!confirm(`Permanently delete “${item.title}”? Archive is safer for old publications.`)) return
    setBusy(true); setMessage('')
    const table = kind === 'green' ? 'green_papers' : 'red_books'
    const bucket = kind === 'green' ? 'green-papers' : 'red-books'
    if (item.pdf_path) await supabase.storage.from(bucket).remove([item.pdf_path])
    if (kind === 'red' && item.cover_path) await supabase.storage.from('red-book-covers').remove([item.cover_path])
    const { error } = await supabase.from(table).delete().eq('id', item.id)
    setMessage(error ? error.message : 'Publication permanently deleted.')
    await load(); setBusy(false)
  }

  const control = {padding:'8px 10px',border:'1px solid #cbd5df',borderRadius:5,background:'#fff',fontSize:12} as const
  const btn = {padding:'7px 10px',border:'1px solid #cbd5df',borderRadius:5,background:'#fff',cursor:'pointer',fontSize:11,fontWeight:700} as const
  const primary = {...btn,background:'#12395c',borderColor:'#12395c',color:'#fff'} as const
  const danger = {...btn,background:'#fff5f5',borderColor:'#efc5c5',color:'#9d2525'} as const

  return <section id="dashboard" style={{display:'grid',gap:18,marginTop:20}}>
    {showStats ? <div className="stats">
      <div className="stat"><span>Total Publications</span><strong>{counts.total}</strong></div>
      <div className="stat"><span>GREEN Papers</span><strong>{counts.green}</strong></div>
      <div className="stat"><span>RED Books</span><strong>{counts.red}</strong></div>
      <div className="stat"><span>Published</span><strong>{counts.published}</strong></div>
      <div className="stat"><span>Drafts</span><strong>{counts.draft}</strong></div>
      <div className="stat"><span>Archived</span><strong>{counts.archived}</strong></div>
    </div> : null}

    {message ? <div style={{padding:'10px 12px',background:'#eef6fb',border:'1px solid #c9dce9',borderRadius:6,fontSize:12}}>{message}</div> : null}

    <div className="contentCard" id={kind === 'green' ? 'green-manager' : 'red-manager'}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap',marginBottom:14}}>
        <div>
          <h2 style={{margin:'0 0 4px'}}>{kind === 'green' ? 'GREEN Papers Manager' : 'RED Books Manager'}</h2>
          <div style={{fontSize:12,color:'#687586'}}>Search, filter, edit, publish, archive and manage publication records.</div>
        </div>
        {!lockedKind ? <div style={{display:'flex',gap:6}}>
          <button style={kind==='green'?primary:btn} onClick={()=>setKind('green')}>GREEN Papers ({green.length})</button>
          <button style={kind==='red'?{...primary,background:'#bd2025',borderColor:'#bd2025'}:btn} onClick={()=>setKind('red')}>RED Books ({red.length})</button>
        </div> : <div style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:kind==='green'?'#16723b':'#a8282d'}}>{kind==='green'?`${green.length} GREEN record(s)`:`${red.length} RED record(s)`}</div>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'minmax(180px,2fr) repeat(3,minmax(120px,1fr))',gap:8,marginBottom:10}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title, author/editor, volume, issue…" style={control}/>
        <select value={status} onChange={e=>setStatusFilter(e.target.value as 'all'|Status)} style={control}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
        <select value={year} onChange={e=>setYear(e.target.value)} style={control}><option value="all">All years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
        <select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} style={control}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option><option value="year">Year ↓</option></select>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginBottom:10,flexWrap:'wrap'}}>
        <div style={{fontSize:12,color:'#667'}}>{filtered.length} result(s) · Page {Math.min(page,totalPages)} of {totalPages}</div>
        <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{fontSize:11,color:'#667'}}>{selected.size} selected</span>
          <button style={btn} disabled={!selected.size||busy} onClick={()=>bulkStatus('published')}>Publish</button>
          <button style={btn} disabled={!selected.size||busy} onClick={()=>bulkStatus('draft')}>Move to Draft</button>
          <button style={btn} disabled={!selected.size||busy} onClick={()=>bulkStatus('archived')}>Archive</button>
        </div>
      </div>

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,minWidth:900}}>
          <thead><tr style={{background:'#f4f7f9',textAlign:'left'}}>
            <th style={{padding:8}}><input type="checkbox" checked={visible.length>0 && visible.every(x=>selected.has(x.id))} onChange={e=>{const n=new Set(selected); visible.forEach(x=>e.target.checked?n.add(x.id):n.delete(x.id)); setSelected(n)}}/></th>
            {kind==='red'?<th style={{padding:8}}>Cover</th>:null}<th style={{padding:8}}>Title</th><th style={{padding:8}}>{kind==='green'?'Author(s)':'Editor(s)'}</th><th style={{padding:8}}>Date / Issue</th><th style={{padding:8}}>Status</th><th style={{padding:8}}>Updated</th><th style={{padding:8}}>Actions</th>
          </tr></thead>
          <tbody>{visible.map(item => {
            const coverUrl = kind==='red' && item.cover_path ? supabase.storage.from('red-book-covers').getPublicUrl(item.cover_path).data.publicUrl : null
            return <tr key={item.id} style={{borderTop:'1px solid #e4e9ed',verticalAlign:'top'}}>
              <td style={{padding:8}}><input type="checkbox" checked={selected.has(item.id)} onChange={e=>{const n=new Set(selected); e.target.checked?n.add(item.id):n.delete(item.id); setSelected(n)}}/></td>
              {kind==='red'?<td style={{padding:8}}>{coverUrl?<img src={coverUrl} alt="" style={{width:36,height:50,objectFit:'cover',border:'1px solid #ddd'}}/>:<span style={{fontSize:10,color:'#9b5b5b'}}>No cover</span>}</td>:null}
              <td style={{padding:8,maxWidth:260}}><strong>{item.title}</strong><div style={{fontSize:10,color:'#7a8792',marginTop:3}}>ID: {item.id.slice(0,8)}…</div></td>
              <td style={{padding:8}}>{kind==='green' ? item.authors : item.editors || '—'}</td>
              <td style={{padding:8}}>{kind==='red' && item.publication_month ? `${item.publication_month} ` : ''}{item.publication_year || '—'}{item.volume ? ` · Vol ${item.volume}` : ''}{item.issue ? ` · Issue ${item.issue}` : ''}</td>
              <td style={{padding:8}}><span style={{padding:'3px 7px',borderRadius:12,background:item.status==='published'?'#e6f5ec':item.status==='archived'?'#eee':'#fff4db',color:item.status==='published'?'#16723b':item.status==='archived'?'#555':'#8a6112',fontSize:10,fontWeight:700}}>{item.status}</span></td>
              <td style={{padding:8,whiteSpace:'nowrap'}}>{new Date(item.updated_at || item.created_at).toLocaleDateString()}</td>
              <td style={{padding:8}}><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                <button style={btn} onClick={()=>setEditing(editing===item.id?null:item.id)}>Edit</button>
                <button style={btn} disabled={busy} onClick={()=>changeStatus(item,item.status==='published'?'draft':'published')}>{item.status==='published'?'Unpublish':'Publish'}</button>
                <button style={btn} disabled={busy} onClick={()=>changeStatus(item,'archived')}>Archive</button>
                <button style={danger} disabled={busy} onClick={()=>deleteItem(item)}>Delete</button>
              </div>
              {editing===item.id ? <form onSubmit={e=>saveEdit(e,item)} style={{marginTop:8,padding:9,border:'1px solid #dce4ea',borderRadius:5,background:'#fafcfd',minWidth:340}}>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:6}}><input name="title" defaultValue={item.title} required style={control}/><input name="publication_year" type="number" defaultValue={item.publication_year || ''} placeholder="Year" style={control}/><input name="volume" defaultValue={item.volume || ''} placeholder="Volume" style={control}/></div>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:6,marginTop:6}}>{kind==='green'?<input name="authors" defaultValue={item.authors || ''} placeholder="Authors" style={control}/>:<input name="editors" defaultValue={item.editors || ''} placeholder="Editors" style={control}/>}<input name="issue" defaultValue={item.issue || ''} placeholder="Issue" style={control}/>{kind==='green'?<input name="doi" defaultValue={item.doi || ''} placeholder="DOI" style={control}/>:<select name="publication_month" defaultValue={item.publication_month || ''} style={control}><option value="">Month</option>{months.map(m=><option key={m}>{m}</option>)}</select>}</div>
                {kind==='red'?<div style={{marginTop:6}}><input name="issn" defaultValue={item.issn || ''} placeholder="ISSN" style={{...control,width:'100%'}}/></div>:null}
                <div style={{display:'flex',gap:6,marginTop:7}}><button type="submit" style={primary} disabled={busy}>Save changes</button><button type="button" style={btn} onClick={()=>setEditing(null)}>Cancel</button></div>
              </form>:null}</td>
            </tr>
          })}</tbody>
        </table>
        {!visible.length ? <div style={{padding:24,textAlign:'center',color:'#687586'}}>No publications match these filters.</div> : null}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
        <button style={btn} disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>← Previous</button>
        <span style={{fontSize:11,color:'#667'}}>Showing {visible.length ? (Math.min(page,totalPages)-1)*pageSize+1 : 0}–{Math.min(Math.min(page,totalPages)*pageSize,filtered.length)} of {filtered.length}</span>
        <button style={btn} disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next →</button>
      </div>
    </div>
  </section>
}
