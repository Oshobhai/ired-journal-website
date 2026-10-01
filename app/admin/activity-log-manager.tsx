'use client'

import {useEffect,useMemo,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type EntityFilter='all'|'green_paper'|'red_publication'|'green_issue'

type LogRow={
  id:number
  created_at:string
  actor_user_id:string|null
  actor_email:string|null
  entity_type:'green_paper'|'red_publication'|'green_issue'
  entity_id:string|null
  entity_label:string|null
  action:string
  changed_fields:string[]|null
  before_data:Record<string,unknown>|null
  after_data:Record<string,unknown>|null
}

const actionLabels:Record<string,string>={
  created:'Created',deleted:'Deleted',published:'Published',unpublished:'Moved to Draft',archived:'Archived',status_changed:'Status changed',
  final_pdf_attached:'Final PDF attached',pdf_replaced:'PDF replaced',certificate_added:'Certificate added',certificate_removed:'Certificate removed',certificate_replaced:'Certificate replaced',cover_replaced:'Cover replaced',metadata_updated:'Metadata updated',
  issue_created:'Issue created',issue_closed:'Issue closed',issue_set_current:'Set as Current Issue',issue_reopened:'Issue reopened',issue_updated:'Issue updated',issue_deleted:'Issue deleted',
}

const entityLabels:Record<string,string>={green_paper:'GREEN Paper',red_publication:'RED Publication',green_issue:'GREEN Issue'}

function safeSearch(value:string){return value.replace(/[%_,()'\"]/g,' ').replace(/\s+/g,' ').trim()}
function displayValue(value:unknown){
  if(value===null||value===undefined||value==='')return '—'
  if(typeof value==='string'||typeof value==='number'||typeof value==='boolean')return String(value)
  return JSON.stringify(value)
}

export default function ActivityLogManager(){
  const supabase=useMemo(()=>createClient(),[])
  const db=supabase as unknown as {from:(table:string)=>any}
  const [rows,setRows]=useState<LogRow[]>([])
  const [entity,setEntity]=useState<EntityFilter>('all')
  const [action,setAction]=useState('all')
  const [searchInput,setSearchInput]=useState('')
  const [search,setSearch]=useState('')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState(50)
  const [total,setTotal]=useState(0)
  const [loading,setLoading]=useState(false)
  const [message,setMessage]=useState('')

  useEffect(()=>{
    const timer=window.setTimeout(()=>setSearch(safeSearch(searchInput)),300)
    return()=>window.clearTimeout(timer)
  },[searchInput])
  useEffect(()=>{setPage(1)},[entity,action,search,pageSize])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      let query:any=db.from('activity_log').select('id,created_at,actor_user_id,actor_email,entity_type,entity_id,entity_label,action,changed_fields,before_data,after_data',{count:'exact'})
      if(entity!=='all')query=query.eq('entity_type',entity)
      if(action!=='all')query=query.eq('action',action)
      if(search){const pattern=`%${search}%`;query=query.or(`entity_label.ilike.${pattern},actor_email.ilike.${pattern},action.ilike.${pattern}`)}
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
      setRows((data||[]) as LogRow[]);setTotal(nextTotal);setMessage('')
    })()
    return()=>{cancelled=true}
  },[db,entity,action,search,page,pageSize])

  const actions=Object.keys(actionLabels)
  const totalPages=Math.max(1,Math.ceil(total/pageSize))
  const start=total?(page-1)*pageSize+1:0
  const end=total?Math.min(page*pageSize,total):0
  const field={width:'100%',padding:'8px 9px',border:'1px solid #cbd6de',background:'#fff',fontSize:11,minWidth:0} as const

  return <section className="contentCard" style={{marginTop:20,borderTop:'4px solid #12395c'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap',marginBottom:12}}>
      <div><h2 style={{margin:'0 0 5px'}}>Activity Log / Audit Trail</h2><p style={{margin:0,fontSize:11.5,color:'#687586',lineHeight:1.55}}>Automatic history of GREEN papers, RED publications and GREEN issue-management changes. Logs are read-only.</p></div>
      <span style={{fontSize:10,fontWeight:800,padding:'5px 8px',border:'1px solid #d4dee6',background:'#f7f9fb',color:'#526474'}}>{total} logged action{total===1?'':'s'}</span>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'minmax(220px,2fr) repeat(3,minmax(145px,1fr))',gap:8,marginBottom:10}}>
      <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search paper/issue or admin email…" style={field}/>
      <select value={entity} onChange={e=>setEntity(e.target.value as EntityFilter)} style={field}><option value="all">All record types</option><option value="green_paper">GREEN Papers</option><option value="red_publication">RED Publications</option><option value="green_issue">GREEN Issues</option></select>
      <select value={action} onChange={e=>setAction(e.target.value)} style={field}><option value="all">All actions</option>{actions.map(value=><option key={value} value={value}>{actionLabels[value]}</option>)}</select>
      <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} style={field}><option value={25}>25 rows</option><option value={50}>50 rows</option><option value={100}>100 rows</option></select>
    </div>

    <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:10}}><span style={{fontSize:11,color:'#687586'}}>{loading?'Loading…':`${total} result(s) · Page ${page} of ${totalPages}`}</span><button className="smallBtn" type="button" onClick={()=>{setSearchInput('');setSearch('');setEntity('all');setAction('all')}}>Reset filters</button></div>
    {message?<div style={{padding:'9px 11px',border:'1px solid #e0c8c8',background:'#fff6f6',fontSize:11.5,marginBottom:10}}>{message}</div>:null}

    <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11,minWidth:900}}>
      <thead><tr style={{textAlign:'left',background:'#f4f7f9'}}><th style={{padding:8}}>Date / Time</th><th style={{padding:8}}>Admin</th><th style={{padding:8}}>Record</th><th style={{padding:8}}>Action</th><th style={{padding:8}}>Changed</th><th style={{padding:8}}>Details</th></tr></thead>
      <tbody>{rows.map(row=>{
        const fields=(row.changed_fields||[]).filter(value=>!['updated_at','published_at','certificate_uploaded_at'].includes(value))
        return <tr key={row.id} style={{borderTop:'1px solid #e1e7eb',verticalAlign:'top'}}>
          <td style={{padding:8,whiteSpace:'nowrap'}}>{new Date(row.created_at).toLocaleString()}</td>
          <td style={{padding:8}}>{row.actor_email||'System'}</td>
          <td style={{padding:8,maxWidth:260}}><strong>{entityLabels[row.entity_type]||row.entity_type}</strong><div style={{marginTop:2,color:'#687586',overflowWrap:'anywhere'}}>{row.entity_label||row.entity_id||'—'}</div></td>
          <td style={{padding:8,fontWeight:700,color:'#12395c'}}>{actionLabels[row.action]||row.action.replaceAll('_',' ')}</td>
          <td style={{padding:8}}>{fields.length?fields.join(', '):'—'}</td>
          <td style={{padding:8}}>{fields.length?<details><summary style={{cursor:'pointer',color:'#315a78'}}>Before / After</summary><div style={{display:'grid',gap:5,marginTop:6,minWidth:260}}>{fields.map(field=><div key={field} style={{padding:'5px 6px',border:'1px solid #e0e6ea',background:'#fafcfd'}}><strong style={{display:'block',fontSize:9.5,color:'#526474'}}>{field}</strong><div style={{marginTop:2}}><span style={{color:'#8a5a5a'}}>Before:</span> {displayValue(row.before_data?.[field])}</div><div><span style={{color:'#176f3d'}}>After:</span> {displayValue(row.after_data?.[field])}</div></div>)}</div></details>:<span style={{color:'#8a949b'}}>—</span>}</td>
        </tr>
      })}</tbody>
    </table></div>
    {!loading&&!rows.length?<div style={{padding:24,textAlign:'center',color:'#687586',fontSize:11.5}}>No activity matches these filters yet.</div>:null}

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:12,flexWrap:'wrap'}}><div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(1)}>« First</button><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(value=>Math.max(1,value-1))}>← Previous</button></div><span style={{fontSize:10.5,color:'#687586'}}>Showing {start}–{end} of {total}</span><div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(value=>Math.min(totalPages,value+1))}>Next →</button><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(totalPages)}>Last »</button></div></div>
  </section>
}
