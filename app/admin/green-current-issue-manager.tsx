'use client'

import {FormEvent,useEffect,useMemo,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type IssueStatus='open'|'closed'
type Queue='all'|'drafts'|'final-pdf'|'certificate-missing'|'ready'
type PaperStatus='draft'|'published'|'archived'

type Issue={
  id:string
  publication_year:number
  publication_month:string
  volume:string
  issue:string
  status:IssueStatus
  is_current:boolean
  publication_date:string|null
  submission_deadline:string|null
  created_at:string
}

type Paper={
  id:string
  article_id:string|null
  title:string
  authors:string|null
  status:PaperStatus
  pdf_path:string
  certificate_path:string|null
  publication_year:number|null
  publication_month:string|null
  volume:string|null
  issue:string|null
  created_at:string
}

type Props={initialQueue?:Queue}

const months=['January','February','March','April','May','June','July','August','September','October','November','December']

function safeSearch(value:string){
  return value.replace(/[%_,()'\"]/g,' ').replace(/\s+/g,' ').trim()
}

function issueLabel(issue:Issue){
  return `${issue.publication_month} ${issue.publication_year} · Volume ${issue.volume} · Issue ${issue.issue}`
}

export default function GreenCurrentIssueManager({initialQueue='all'}:Props){
  const supabase=useMemo(()=>createClient(),[])
  const db=supabase as unknown as {from:(table:string)=>any;rpc:(name:string,args?:Record<string,unknown>)=>Promise<{error?:{message?:string}|null}>}
  const [issues,setIssues]=useState<Issue[]>([])
  const [selectedId,setSelectedId]=useState<string|null>(null)
  const [papers,setPapers]=useState<Paper[]>([])
  const [queue,setQueue]=useState<Queue>(initialQueue)
  const [searchInput,setSearchInput]=useState('')
  const [search,setSearch]=useState('')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState(25)
  const [total,setTotal]=useState(0)
  const [loading,setLoading]=useState(false)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [refreshTick,setRefreshTick]=useState(0)
  const [showCreate,setShowCreate]=useState(false)

  const selected=issues.find(item=>item.id===selectedId)||issues.find(item=>item.is_current)||issues[0]||null
  const current=issues.find(item=>item.is_current)||null

  useEffect(()=>{
    const timer=window.setTimeout(()=>setSearch(safeSearch(searchInput)),300)
    return()=>window.clearTimeout(timer)
  },[searchInput])

  useEffect(()=>{setPage(1)},[selectedId,queue,search,pageSize])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      const {data,error}=await db.from('green_issues').select('id,publication_year,publication_month,volume,issue,status,is_current,publication_date,submission_deadline,created_at').order('publication_year',{ascending:false}).order('created_at',{ascending:false})
      if(cancelled)return
      if(error){setMessage(error.message);return}
      const next=(data||[]) as Issue[]
      setIssues(next)
      setSelectedId(previous=>previous&&next.some(item=>item.id===previous)?previous:(next.find(item=>item.is_current)?.id||next[0]?.id||null))
    })()
    return()=>{cancelled=true}
  },[db,refreshTick])

  useEffect(()=>{
    if(!selected){setPapers([]);setTotal(0);return}
    let cancelled=false
    void(async()=>{
      let query:any=db.from('green_papers').select('id,article_id,title,authors,status,pdf_path,certificate_path,publication_year,publication_month,volume,issue,created_at',{count:'exact'})
        .eq('publication_year',selected.publication_year)
        .eq('publication_month',selected.publication_month)
        .eq('volume',selected.volume)
        .eq('issue',selected.issue)

      if(queue==='drafts')query=query.eq('status','draft')
      if(queue==='final-pdf')query=query.eq('status','draft').like('pdf_path','pending/%')
      if(queue==='certificate-missing')query=query.eq('status','draft').not('pdf_path','like','pending/%').is('certificate_path',null)
      if(queue==='ready')query=query.eq('status','draft').not('pdf_path','like','pending/%').not('certificate_path','is',null)
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
      setPapers((data||[]) as Paper[])
      setTotal(nextTotal)
    })()
    return()=>{cancelled=true}
  },[db,selected?.id,selected?.publication_year,selected?.publication_month,selected?.volume,selected?.issue,queue,search,page,pageSize,refreshTick])

  function refresh(){setRefreshTick(value=>value+1)}

  async function createIssue(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    setBusy(true);setMessage('')
    const form=event.currentTarget
    const data=new FormData(form)
    const year=Number(data.get('publication_year'))
    const month=String(data.get('publication_month')||'')
    const volume=String(data.get('volume')||'').trim()
    const issue=String(data.get('issue')||'').trim()
    const publicationDate=String(data.get('publication_date')||'').trim()||null
    const submissionDeadline=String(data.get('submission_deadline')||'').trim()||null
    const makeCurrent=data.get('make_current')==='on'
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')
      if(!year||!month||!volume||!issue)throw new Error('Year, month, volume and issue are required.')
      const {data:created,error}=await db.from('green_issues').insert({publication_year:year,publication_month:month,volume,issue,status:'open',is_current:false,publication_date:publicationDate,submission_deadline:submissionDeadline,created_by:user.id}).select('id').single()
      if(error)throw error
      if(makeCurrent&&created?.id){
        const result=await db.rpc('set_current_green_issue',{target_id:created.id})
        if(result.error)throw new Error(result.error.message||'Could not make the new issue current.')
      }
      form.reset();setShowCreate(false);setMessage('GREEN issue created successfully.');setSelectedId(created?.id||null);refresh()
    }catch(error){setMessage(error instanceof Error?error.message:'Could not create GREEN issue.')}
    finally{setBusy(false)}
  }

  async function makeCurrent(issue:Issue){
    if(issue.status!=='open'){setMessage('Reopen this issue before making it current.');return}
    if(issue.is_current)return
    if(!confirm(`Make ${issueLabel(issue)} the Current Issue?`))return
    setBusy(true);setMessage('')
    const result=await db.rpc('set_current_green_issue',{target_id:issue.id})
    setBusy(false)
    if(result.error){setMessage(result.error.message||'Could not change Current Issue.');return}
    setMessage(`${issueLabel(issue)} is now the Current Issue.`);setSelectedId(issue.id);refresh()
  }

  async function closeIssue(issue:Issue){
    if(issue.status==='closed')return
    if(!confirm(`Close ${issueLabel(issue)}? It will no longer be the Current Issue.`))return
    setBusy(true);setMessage('')
    const {error}=await db.from('green_issues').update({status:'closed',is_current:false}).eq('id',issue.id)
    setBusy(false)
    if(error){setMessage(error.message);return}
    setMessage(`${issueLabel(issue)} closed.`);refresh()
  }

  async function reopenIssue(issue:Issue){
    if(issue.status==='open')return
    setBusy(true);setMessage('')
    const {error}=await db.from('green_issues').update({status:'open'}).eq('id',issue.id)
    setBusy(false)
    if(error){setMessage(error.message);return}
    setMessage(`${issueLabel(issue)} reopened.`);refresh()
  }

  async function changePaperStatus(paper:Paper,next:PaperStatus){
    if(selected?.status==='closed'){setMessage('Closed issues are read-only. Reopen the issue before changing paper status.');return}
    if(next==='published'&&(paper.pdf_path.startsWith('pending/')||!paper.certificate_path)){
      setMessage('Final PDF and certificate are required before publishing.');return
    }
    if(!confirm(`${next==='published'?'Publish':next==='archived'?'Archive':'Move to Draft'} “${paper.title}”?`))return
    setBusy(true);setMessage('')
    const {error}=await db.from('green_papers').update({status:next,published_at:next==='published'?new Date().toISOString():null}).eq('id',paper.id)
    setBusy(false)
    if(error){setMessage(error.message);return}
    setMessage(`Paper changed to ${next}.`);refresh()
  }

  async function openPdf(paper:Paper){
    if(paper.pdf_path.startsWith('pending/')){setMessage('Final PDF has not been attached yet.');return}
    const {data,error}=await supabase.storage.from('green-papers').createSignedUrl(paper.pdf_path,600)
    if(error||!data?.signedUrl){setMessage(error?.message||'Could not open PDF.');return}
    window.open(data.signedUrl,'_blank','noopener,noreferrer')
  }

  const totalPages=Math.max(1,Math.ceil(total/pageSize))
  const start=total?(page-1)*pageSize+1:0
  const end=total?Math.min(page*pageSize,total):0
  const field={padding:'8px 9px',border:'1px solid #cbd6de',background:'#fff',fontSize:11,minWidth:0,width:'100%'} as const
  const queueOptions:Array<[Queue,string]>=[['all','All papers'],['drafts','Drafts'],['final-pdf','Final PDF pending'],['certificate-missing','Certificate missing'],['ready','Ready to publish']]

  return <div style={{display:'grid',gap:14}}>
    <section className="contentCard" style={{borderTop:'4px solid #148444'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#148444'}}>Issue-based Management</div>
          <h2 style={{margin:'4px 0 5px'}}>Current GREEN Issue</h2>
          {current?<div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:700,color:'#12395c'}}>{issueLabel(current)}</div>:<div style={{fontSize:12,color:'#8a6112'}}>No Current Issue is set.</div>}
          {current?<div style={{fontSize:10.5,color:'#687586',marginTop:4}}>Status: <strong style={{color:'#176f3d'}}>Open</strong>{current.submission_deadline?` · Submission deadline ${current.submission_deadline}`:''}{current.publication_date?` · Publication ${current.publication_date}`:''}</div>:null}
        </div>
        <button className="btn btnGreen compact" type="button" onClick={()=>setShowCreate(value=>!value)}>{showCreate?'Cancel':'Create New Issue'}</button>
      </div>

      {showCreate?<form onSubmit={createIssue} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8,marginTop:14,padding:12,border:'1px solid #d9e6de',background:'#f8fcf9'}}>
        <input name="publication_year" type="number" min="2026" defaultValue={new Date().getFullYear()} placeholder="Year" required style={field}/>
        <select name="publication_month" defaultValue={months[new Date().getMonth()]} required style={field}>{months.map(month=><option key={month}>{month}</option>)}</select>
        <input name="volume" placeholder="Volume" required style={field}/>
        <input name="issue" placeholder="Issue" required style={field}/>
        <label style={{fontSize:9.5,color:'#52606b'}}>Publication Date<input name="publication_date" type="date" style={{...field,marginTop:3}}/></label>
        <label style={{fontSize:9.5,color:'#52606b'}}>Submission Deadline<input name="submission_deadline" type="date" style={{...field,marginTop:3}}/></label>
        <label style={{display:'flex',gap:6,alignItems:'center',fontSize:10.5,color:'#42586a'}}><input name="make_current" type="checkbox" defaultChecked/> Make Current Issue</label>
        <button className="btn btnGreen compact" type="submit" disabled={busy}>{busy?'Creating…':'Create Issue'}</button>
      </form>:null}

      {message?<div style={{marginTop:12,padding:'9px 11px',border:'1px solid #cbdde8',background:'#f3f8fb',fontSize:11.5}}>{message}</div>:null}

      <div style={{marginTop:14,overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,minWidth:720}}>
          <thead><tr style={{textAlign:'left',background:'#f4f7f9'}}><th style={{padding:8}}>Issue</th><th style={{padding:8}}>Status</th><th style={{padding:8}}>Schedule</th><th style={{padding:8}}>Actions</th></tr></thead>
          <tbody>{issues.map(issue=><tr key={issue.id} style={{borderTop:'1px solid #e1e7eb',background:selected?.id===issue.id?'#f7fbf8':'#fff'}}>
            <td style={{padding:8}}><strong>{issueLabel(issue)}</strong>{issue.is_current?<span style={{marginLeft:7,fontSize:9,fontWeight:800,padding:'3px 6px',background:'#e9f7ee',color:'#176f3d'}}>CURRENT</span>:null}</td>
            <td style={{padding:8}}>{issue.status}</td>
            <td style={{padding:8,color:'#657582'}}>{issue.submission_deadline?`Deadline ${issue.submission_deadline}`:'—'}{issue.publication_date?` · Publish ${issue.publication_date}`:''}</td>
            <td style={{padding:8}}><div style={{display:'flex',gap:5,flexWrap:'wrap'}}><button className="smallBtn" type="button" onClick={()=>setSelectedId(issue.id)}>Work on Issue</button>{issue.status==='open'&&!issue.is_current?<button className="smallBtn" type="button" disabled={busy} onClick={()=>makeCurrent(issue)}>Make Current</button>:null}{issue.status==='open'?<button className="smallBtn" type="button" disabled={busy} onClick={()=>closeIssue(issue)}>Close</button>:<button className="smallBtn" type="button" disabled={busy} onClick={()=>reopenIssue(issue)}>Reopen</button>}</div></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section className="contentCard">
      <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start',flexWrap:'wrap',marginBottom:10}}>
        <div><h2 style={{margin:'0 0 4px'}}>{selected?issueLabel(selected):'Issue Papers'}</h2><div style={{fontSize:11,color:'#687586'}}>{selected?.status==='closed'?'Closed issue · paper status changes are disabled.':'Only this issue’s papers are loaded.'}</div></div>
        {selected?<span style={{fontSize:9.5,fontWeight:800,padding:'4px 7px',background:selected.status==='open'?'#eef8f2':'#f1f2f3',color:selected.status==='open'?'#176f3d':'#59636b'}}>{selected.status.toUpperCase()}</span>:null}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'minmax(220px,2fr) minmax(150px,1fr) minmax(100px,.6fr)',gap:7,marginBottom:10}}>
        <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Article ID, title or author…" style={field}/>
        <select value={queue} onChange={e=>setQueue(e.target.value as Queue)} style={field}>{queueOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
        <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} style={field}><option value={25}>25 rows</option><option value={50}>50 rows</option></select>
      </div>

      <div style={{fontSize:11,color:'#687586',marginBottom:8}}>{loading?'Loading…':`${total} result(s) · Page ${page} of ${totalPages}`}</div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11,minWidth:900}}>
        <thead><tr style={{textAlign:'left',background:'#f4f7f9'}}><th style={{padding:8}}>Article</th><th style={{padding:8}}>Author(s)</th><th style={{padding:8}}>Final PDF</th><th style={{padding:8}}>Certificate</th><th style={{padding:8}}>Status</th><th style={{padding:8}}>Actions</th></tr></thead>
        <tbody>{papers.map(paper=>{
          const pdfReady=!paper.pdf_path.startsWith('pending/')
          const certificateReady=Boolean(paper.certificate_path)
          return <tr key={paper.id} style={{borderTop:'1px solid #e1e7eb',verticalAlign:'top'}}>
            <td style={{padding:8,maxWidth:300}}><strong>{paper.title}</strong><div style={{fontSize:9.5,color:'#74818b',marginTop:3}}>{paper.article_id||paper.id.slice(0,8)}</div></td>
            <td style={{padding:8}}>{paper.authors||'—'}</td>
            <td style={{padding:8,color:pdfReady?'#176f3d':'#8a6112',fontWeight:700}}>{pdfReady?'Ready':'Pending'}</td>
            <td style={{padding:8,color:certificateReady?'#176f3d':'#8a6112',fontWeight:700}}>{certificateReady?'Ready':'Missing'}</td>
            <td style={{padding:8}}>{paper.status}</td>
            <td style={{padding:8}}><div style={{display:'flex',gap:5,flexWrap:'wrap'}}><button className="smallBtn" type="button" disabled={!pdfReady} onClick={()=>openPdf(paper)}>View PDF</button>{selected?.status==='open'&&paper.status!=='published'&&pdfReady&&certificateReady?<button className="smallBtn" type="button" disabled={busy} onClick={()=>changePaperStatus(paper,'published')}>Publish</button>:null}{selected?.status==='open'&&paper.status==='published'?<button className="smallBtn" type="button" disabled={busy} onClick={()=>changePaperStatus(paper,'draft')}>Move Draft</button>:null}{selected?.status==='open'&&paper.status!=='archived'?<button className="smallBtn" type="button" disabled={busy} onClick={()=>changePaperStatus(paper,'archived')}>Archive</button>:null}</div></td>
          </tr>
        })}</tbody>
      </table></div>
      {!loading&&!papers.length?<div style={{padding:22,textAlign:'center',fontSize:11.5,color:'#687586'}}>No papers match this issue/work queue.</div>:null}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:12,flexWrap:'wrap'}}><div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(1)}>« First</button><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(value=>Math.max(1,value-1))}>← Previous</button></div><span style={{fontSize:10.5,color:'#687586'}}>Showing {start}–{end} of {total}</span><div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(value=>Math.min(totalPages,value+1))}>Next →</button><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(totalPages)}>Last »</button></div></div>
    </section>
  </div>
}
