'use client'

import {FormEvent,useEffect,useMemo,useState} from 'react'
import {PDFDocument} from 'pdf-lib'
import {createClient} from '@/lib/supabase/client'

type Status='draft'|'published'|'archived'
type StatusFilter='all'|Status
type CertificateFilter='all'|'ready'|'missing'

type Paper={
  id:string
  title:string
  authors:string|null
  article_id:string|null
  publication_year:number|null
  publication_month:string|null
  volume:string|null
  issue:string|null
  status:Status
  certificate_path:string|null
  certificate_uploaded_at:string|null
}

type CertificateInfo={
  greenTitle:string
  publisherName:string
  officialAddress:string
  greenIssn:string
  editorName:string
  chairName:string
}

type Counts={total:number;draft:number;published:number;archived:number;ready:number}

const months=['January','February','March','April','May','June','July','August','September','October','November','December']
const defaultInfo:CertificateInfo={
  greenTitle:'GREEN: The Research e-Journal',
  publisherName:'Institute of Research Education and Development (IRED)',
  officialAddress:'A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India',
  greenIssn:'XXXX-XXXX',
  editorName:'Dr. Bhavika Kadikar',
  chairName:'Dr. Kumarpal Parmar',
}

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'certificate.pdf'
}

function safeSearch(value:string){
  return value.replace(/[%_,()'\"]/g,' ').replace(/\s+/g,' ').trim()
}

function wrapLines(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){
  const words=text.trim().split(/\s+/).filter(Boolean)
  const lines:string[]=[]
  let line=''
  for(const word of words){
    const candidate=line?`${line} ${word}`:word
    if(ctx.measureText(candidate).width<=maxWidth){line=candidate;continue}
    if(line){lines.push(line);line=''}
    if(ctx.measureText(word).width<=maxWidth){line=word;continue}
    let chunk=''
    for(const char of Array.from(word)){
      const next=chunk+char
      if(ctx.measureText(next).width>maxWidth&&chunk){lines.push(chunk);chunk=char}else chunk=next
    }
    line=chunk
  }
  if(line)lines.push(line)
  return lines
}

function drawWrappedCentered(ctx:CanvasRenderingContext2D,text:string,y:number,maxWidth:number,fontSize:number,lineHeight:number,maxLines=4,weight='600'){
  let size=fontSize
  let lines:string[]=[]
  while(size>=18){
    ctx.font=`${weight} ${size}px "Nirmala UI","Noto Sans Gujarati","Shruti","Arial Unicode MS",Arial,sans-serif`
    lines=wrapLines(ctx,text,maxWidth)
    if(lines.length<=maxLines)break
    size-=2
  }
  const actualLineHeight=Math.max(lineHeight-(fontSize-size)*0.45,size+7)
  ctx.textAlign='center'
  for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],800,y+i*actualLineHeight)
  return y+lines.length*actualLineHeight
}

async function canvasBlob(canvas:HTMLCanvasElement){
  return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not render certificate image.')),'image/png'))
}

function certificateDateParts(){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',day:'2-digit',month:'long',year:'numeric'}).formatToParts(new Date())
  const part=(type:Intl.DateTimeFormatPartTypes)=>parts.find(x=>x.type===type)?.value||''
  return {day:part('day'),month:part('month'),year:part('year')}
}

function issnText(value:string){
  const clean=value.trim()
  return clean&&!/^x{4}-x{4}$/i.test(clean)?clean:'Pending'
}

function certificateAddress(value:string){
  const first=(value||defaultInfo.officialAddress).split('|')[0].trim()
  return first.replace(/^ired\s*,\s*/i,'')
}

function drawWatermark(ctx:CanvasRenderingContext2D){
  ctx.save()
  ctx.globalAlpha=.035
  ctx.strokeStyle='#7c8b86'
  ctx.fillStyle='#7c8b86'
  ctx.lineWidth=4
  const boxes=[[115,330,120,95],[280,620,140,115],[520,760,160,100],[900,700,145,110],[1225,355,135,100]]
  for(const [x,y,w,h] of boxes){ctx.strokeRect(x,y,w,h);ctx.beginPath();ctx.moveTo(x+18,y+h-18);ctx.lineTo(x+w-18,y+h-18);ctx.stroke()}
  const circles=[[200,640,46],[1180,640,55],[1420,520,42],[500,430,34]]
  for(const [x,y,r] of circles){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke()}
  const bars=[[330,470],[730,745],[1045,470]]
  for(const [x,y] of bars){for(let i=0;i<4;i++)ctx.fillRect(x+i*34,y+(3-i)*26,20,(i+1)*26)}
  ctx.font='700 42px Arial,sans-serif';ctx.textAlign='center';ctx.fillText('DATA',800,720)
  ctx.font='700 34px Arial,sans-serif';ctx.fillText('RESEARCH',1260,790)
  ctx.restore()
}

function drawReferenceHeader(ctx:CanvasRenderingContext2D,green:string){
  ctx.save()
  ctx.fillStyle=green
  ctx.beginPath()
  ctx.moveTo(315,72);ctx.lineTo(1300,62);ctx.lineTo(1450,88);ctx.lineTo(1308,106);ctx.lineTo(1455,124);ctx.lineTo(1305,138);ctx.lineTo(1435,160);ctx.lineTo(315,160);ctx.lineTo(190,143);ctx.lineTo(318,128);ctx.lineTo(180,106);ctx.lineTo(320,93);ctx.closePath();ctx.fill()
  ctx.fillStyle='#fff'
  ctx.textAlign='center'
  ctx.font='800 58px Georgia,serif'
  ctx.fillText('The Research e-Journal',800,137)
  ctx.restore()
}

async function buildCertificatePdf(paper:Paper,info:CertificateInfo){
  if(!paper.authors)throw new Error('Author name is required before generating the certificate.')
  if(!paper.publication_month||!paper.publication_year||!paper.volume||!paper.issue)throw new Error('Month, Year, Volume and Issue must be completed before generating the certificate.')
  if(typeof document!=='undefined'&&document.fonts?.ready)await document.fonts.ready

  const canvas=document.createElement('canvas')
  canvas.width=1600
  canvas.height=1131
  const ctx=canvas.getContext('2d')
  if(!ctx)throw new Error('Certificate renderer is not available in this browser.')

  const green='#0b8d3d'
  const dark='#111111'
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height)
  ctx.fillStyle='#f5f6f3';ctx.fillRect(70,55,1460,1020)
  ctx.strokeStyle=green;ctx.lineWidth=5;ctx.strokeRect(52,36,1496,1058)
  drawWatermark(ctx)
  drawReferenceHeader(ctx,green)

  ctx.fillStyle=dark
  ctx.textAlign='center'
  ctx.font='700 28px Georgia,serif'
  ctx.fillText('International Multi-Disciplinary Peer-Reviewed Referred e-Journal',800,205)
  ctx.strokeStyle=green;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(145,232);ctx.lineTo(1455,232);ctx.stroke()

  ctx.fillStyle=green
  ctx.font='700 46px "Old English Text MT","Lucida Blackletter",Georgia,serif'
  ctx.fillText('Certificate of Publication',800,300)
  ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(145,330);ctx.lineTo(1455,330);ctx.stroke()

  ctx.fillStyle=dark
  ctx.font='400 22px Georgia,serif'
  ctx.fillText('This is to certify that our Editorial Board and Review Committee have accepted the Research Paper/Article',800,380)
  ctx.font='600 21px Georgia,serif'
  ctx.fillText('entitled',800,419)

  ctx.fillStyle='#111111'
  let y=drawWrappedCentered(ctx,paper.title,465,1250,35,44,3,'700')
  ctx.font='600 21px Georgia,serif';ctx.textAlign='center';ctx.fillText('of',800,y+2)
  y+=40
  y=drawWrappedCentered(ctx,paper.authors,y,1050,32,41,2,'700')

  const publicationText=`Has been published in a Issue-${paper.issue}, Volume-${paper.volume} in the Month of ${paper.publication_month}-${paper.publication_year} in ${info.greenTitle} (ISSN: ${issnText(info.greenIssn)}), published by ${info.publisherName}.`
  ctx.fillStyle=dark
  y=drawWrappedCentered(ctx,publicationText,y+26,1370,21,31,3,'400')
  const issued=certificateDateParts()
  ctx.font='400 20px Georgia,serif';ctx.textAlign='center'
  ctx.fillText(`This certificate issued on the ${issued.day} day of ${issued.month}, ${issued.year}.`,800,y+14)

  const signatureY=855
  const columns=[
    {x:285,name:info.editorName,role:'Editor-in-chief'},
    {x:800,name:'Chandrakant Parmar',role:'Vice-president, IRed'},
    {x:1315,name:info.chairName,role:'Chairman, Editorial Board'},
  ]
  for(const column of columns){
    ctx.strokeStyle='#7c8790';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(column.x-125,signatureY);ctx.lineTo(column.x+125,signatureY);ctx.stroke()
    ctx.fillStyle='#111111';ctx.font='700 21px Georgia,serif';ctx.textAlign='center';ctx.fillText(column.name,column.x,signatureY+42)
    ctx.font='400 18px Georgia,serif';ctx.fillText(column.role,column.x,signatureY+73)
  }

  ctx.strokeStyle=green;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(165,1007);ctx.lineTo(1435,1007);ctx.stroke()
  ctx.fillStyle=green;ctx.font='600 16px Georgia,serif';ctx.textAlign='center'
  ctx.fillText(`IRed, ${certificateAddress(info.officialAddress)}`,800,1046)

  const pngBlob=await canvasBlob(canvas)
  const pngBytes=await pngBlob.arrayBuffer()
  const pdf=await PDFDocument.create()
  const page=pdf.addPage([842,595])
  const png=await pdf.embedPng(pngBytes)
  page.drawImage(png,{x:0,y:0,width:842,height:595})
  const pdfBytes=await pdf.save()
  const pdfBuffer=pdfBytes.buffer.slice(pdfBytes.byteOffset,pdfBytes.byteOffset+pdfBytes.byteLength) as ArrayBuffer
  return new File([pdfBuffer],`certificate-${safeFileName(paper.article_id||paper.id)}.pdf`,{type:'application/pdf'})
}

export default function GreenCertificateWorkflow(){
  const supabase=useMemo(()=>createClient(),[])
  const db=supabase as unknown as {from:(table:string)=>any}
  const [papers,setPapers]=useState<Paper[]>([])
  const [info,setInfo]=useState<CertificateInfo>(defaultInfo)
  const [counts,setCounts]=useState<Counts>({total:0,draft:0,published:0,archived:0,ready:0})
  const [status,setStatus]=useState<StatusFilter>('draft')
  const [certificateFilter,setCertificateFilter]=useState<CertificateFilter>('all')
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

  useEffect(()=>{setPage(1)},[status,certificateFilter,search,year,month,pageSize])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      const [{data:site},{data:contact},{data:leaders}]=await Promise.all([
        supabase.from('site_settings').select('green_title,publisher_name,official_address').eq('id',true).maybeSingle(),
        supabase.from('contact_settings').select('green_issn').eq('id',true).maybeSingle(),
        supabase.from('editorial_members').select('name,section,sort_order').eq('is_visible',true).in('section',['editor','editorial']).order('sort_order').order('name'),
      ])
      if(cancelled)return
      const editor=(leaders||[]).find(row=>row.section==='editor')?.name
      const chair=(leaders||[]).find(row=>row.section==='editorial')?.name
      setInfo({
        greenTitle:site?.green_title||defaultInfo.greenTitle,
        publisherName:site?.publisher_name||defaultInfo.publisherName,
        officialAddress:site?.official_address||defaultInfo.officialAddress,
        greenIssn:contact?.green_issn||defaultInfo.greenIssn,
        editorName:editor||defaultInfo.editorName,
        chairName:chair||defaultInfo.chairName,
      })
    })()
    return()=>{cancelled=true}
  },[supabase])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      const [all,draft,published,archived,ready]=await Promise.all([
        db.from('green_papers').select('id',{count:'exact',head:true}),
        db.from('green_papers').select('id',{count:'exact',head:true}).eq('status','draft'),
        db.from('green_papers').select('id',{count:'exact',head:true}).eq('status','published'),
        db.from('green_papers').select('id',{count:'exact',head:true}).eq('status','archived'),
        db.from('green_papers').select('id',{count:'exact',head:true}).not('certificate_path','is',null),
      ])
      if(cancelled)return
      const error=all.error||draft.error||published.error||archived.error||ready.error
      if(error){setMessage(error.message);return}
      setCounts({total:all.count||0,draft:draft.count||0,published:published.count||0,archived:archived.count||0,ready:ready.count||0})
    })()
    return()=>{cancelled=true}
  },[db,refreshTick])

  useEffect(()=>{
    let cancelled=false
    void(async()=>{
      let query:any=db.from('green_papers').select('id,title,authors,article_id,publication_year,publication_month,volume,issue,status,certificate_path,certificate_uploaded_at',{count:'exact'})
      if(status!=='all')query=query.eq('status',status)
      if(certificateFilter==='ready')query=query.not('certificate_path','is',null)
      if(certificateFilter==='missing')query=query.is('certificate_path',null)
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
      setPapers((data||[]) as Paper[])
      setTotal(nextTotal)
    })()
    return()=>{cancelled=true}
  },[db,status,certificateFilter,search,year,month,page,pageSize,refreshTick])

  function refresh(){setRefreshTick(value=>value+1)}

  async function saveCertificateFile(file:File,paper:Paper,successMessage:string){
    if(file.size>10*1024*1024)throw new Error('Generated certificate PDF is larger than 10 MB.')
    const yearFolder=paper.publication_year||new Date().getFullYear()
    const newPath=`${yearFolder}/${paper.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`
    const {error:uploadError}=await supabase.storage.from('green-certificates').upload(newPath,file,{contentType:'application/pdf',upsert:false})
    if(uploadError)throw uploadError
    const oldPath=paper.certificate_path
    const {error:updateError}=await supabase.from('green_papers').update({certificate_path:newPath,certificate_uploaded_at:new Date().toISOString()}).eq('id',paper.id)
    if(updateError){await supabase.storage.from('green-certificates').remove([newPath]);throw updateError}
    if(oldPath)await supabase.storage.from('green-certificates').remove([oldPath])
    setMessage(successMessage)
    refresh()
  }

  async function generateCertificate(paper:Paper){
    if(paper.status==='archived'){setMessage('Move the GREEN paper out of Archive before generating its certificate.');return}
    if(paper.certificate_path&&!confirm(`Replace the existing certificate for “${paper.title}” with a newly generated certificate?`))return
    setBusyId(paper.id);setMessage('')
    try{
      const file=await buildCertificatePdf(paper,info)
      await saveCertificateFile(file,paper,paper.certificate_path?'Certificate regenerated. Review it before publishing.':'Certificate generated. Review it before publishing the paper.')
    }catch(error){setMessage(error instanceof Error?error.message:'Certificate generation failed.')}
    finally{setBusyId(null)}
  }

  async function publishPaper(paper:Paper){
    if(!paper.certificate_path){setMessage('Generate or upload the certificate first, review it, and then publish.');return}
    if(paper.status==='published')return
    if(paper.status==='archived'){setMessage('Archived papers cannot be published from the certificate workflow.');return}
    if(!confirm(`Publish “${paper.title}” together with its checked certificate?`))return
    setBusyId(paper.id);setMessage('')
    try{
      const {error}=await supabase.from('green_papers').update({status:'published',published_at:new Date().toISOString()}).eq('id',paper.id)
      if(error)throw error
      setMessage('Paper and certificate published successfully.')
      refresh()
    }catch(error){setMessage(error instanceof Error?error.message:'Could not publish the paper.')}
    finally{setBusyId(null)}
  }

  async function unpublishPaper(paper:Paper){
    if(paper.status!=='published')return
    if(!confirm(`Move “${paper.title}” back to Draft? The certificate will stop showing publicly.`))return
    setBusyId(paper.id);setMessage('')
    try{
      const {error}=await supabase.from('green_papers').update({status:'draft',published_at:null}).eq('id',paper.id)
      if(error)throw error
      setMessage('Paper moved to Draft. The certificate is no longer public.')
      refresh()
    }catch(error){setMessage(error instanceof Error?error.message:'Could not move the paper to Draft.')}
    finally{setBusyId(null)}
  }

  async function uploadCertificate(event:FormEvent<HTMLFormElement>,paper:Paper){
    event.preventDefault()
    const form=event.currentTarget
    const file=new FormData(form).get('certificate') as File
    if(!file||file.size===0){setMessage('Select a certificate PDF first.');return}
    if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){setMessage('Certificate must be a PDF file.');return}
    if(file.size>10*1024*1024){setMessage('Certificate PDF must be 10 MB or less.');return}
    setBusyId(paper.id);setMessage('')
    try{
      await saveCertificateFile(file,paper,paper.certificate_path?'Certificate replaced. Review it before publishing.':'Certificate uploaded. Review it before publishing the paper.')
      form.reset()
    }catch(error){setMessage(error instanceof Error?error.message:'Certificate upload failed.')}
    finally{setBusyId(null)}
  }

  async function removeCertificate(paper:Paper){
    if(paper.status==='published'){setMessage('Move the paper to Draft before deleting its certificate.');return}
    if(!paper.certificate_path||!confirm(`Remove certificate for “${paper.title}”?`))return
    setBusyId(paper.id);setMessage('')
    try{
      const path=paper.certificate_path
      const {error:updateError}=await supabase.from('green_papers').update({certificate_path:null,certificate_uploaded_at:null}).eq('id',paper.id)
      if(updateError)throw updateError
      await supabase.storage.from('green-certificates').remove([path])
      setMessage('Certificate removed.')
      refresh()
    }catch(error){setMessage(error instanceof Error?error.message:'Could not remove certificate.')}
    finally{setBusyId(null)}
  }

  async function openCertificate(paper:Paper,download=false){
    if(!paper.certificate_path)return
    const {data,error}=await supabase.storage.from('green-certificates').createSignedUrl(paper.certificate_path,600,download?{download:true}:undefined)
    if(error||!data?.signedUrl){setMessage(error?.message||'Could not open certificate.');return}
    window.open(data.signedUrl,'_blank','noopener,noreferrer')
  }

  const totalPages=Math.max(1,Math.ceil(total/pageSize))
  const start=total?(page-1)*pageSize+1:0
  const end=total?Math.min(page*pageSize,total):0
  const field={width:'100%',padding:'8px 9px',border:'1px solid #ccd5dd',borderRadius:5,fontSize:11,minWidth:0} as const
  const statusTabs:Array<[StatusFilter,string,number]>=[['draft','Drafts',counts.draft],['published','Published',counts.published],['archived','Archived',counts.archived],['all','All',counts.total]]

  return <section className="contentCard" style={{borderTop:'4px solid #148444'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap',marginBottom:12}}>
      <div>
        <h2 style={{margin:'0 0 5px'}}>GREEN Certificate Check & Publish</h2>
        <p style={{margin:0,fontSize:12,color:'#687586'}}>Drafts are shown first. Search and pagination keep this workflow manageable even with thousands of papers.</p>
      </div>
      <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}>
        <button className="smallBtn" type="button" onClick={refresh}>Refresh</button>
        <span style={{fontSize:10.5,padding:'5px 8px',background:'#eef8f2',border:'1px solid #cee5d6',color:'#176f3d'}}>{counts.ready} certificates ready</span>
      </div>
    </div>

    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
      {statusTabs.map(([value,label,count])=><button key={value} className={status===value?'btn btnGreen compact':'smallBtn'} type="button" onClick={()=>setStatus(value)}>{label} ({count})</button>)}
    </div>

    <div style={{display:'grid',gridTemplateColumns:'minmax(220px,2fr) repeat(4,minmax(120px,1fr))',gap:7,marginBottom:10}}>
      <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Article ID, title or author…" style={field}/>
      <input value={year} onChange={e=>setYear(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" placeholder="Year" style={field}/>
      <select value={month} onChange={e=>setMonth(e.target.value)} style={field}><option value="all">All months</option>{months.map(m=><option key={m}>{m}</option>)}</select>
      <select value={certificateFilter} onChange={e=>setCertificateFilter(e.target.value as CertificateFilter)} style={field}><option value="all">All certificates</option><option value="ready">Certificate ready</option><option value="missing">Certificate missing</option></select>
      <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} style={field}><option value={25}>25 rows</option><option value={50}>50 rows</option></select>
    </div>

    <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:10}}>
      <span style={{fontSize:11,color:'#687586'}}>{loading?'Loading…':`${total} result(s) · Page ${page} of ${totalPages}`}</span>
      <button className="smallBtn" type="button" onClick={()=>{setSearchInput('');setSearch('');setYear('');setMonth('all');setCertificateFilter('all');setStatus('draft')}}>Reset</button>
    </div>

    {message?<div style={{padding:'9px 11px',background:'#f3f8fb',border:'1px solid #cbdde8',borderRadius:5,fontSize:12,marginBottom:12}}>{message}</div>:null}
    {!loading&&papers.length===0?<p style={{fontSize:12,color:'#687586'}}>No GREEN papers match these filters.</p>:null}

    <div style={{display:'grid',gap:8}}>{papers.map(paper=>{
      const busy=busyId===paper.id
      const canGenerate=paper.status!=='archived'
      const readyToPublish=paper.status==='draft'&&Boolean(paper.certificate_path)
      const stateText=paper.status==='published'?'Published with certificate':paper.status==='archived'?'Archived':paper.certificate_path?'Certificate ready — check it, then publish':'Generate certificate, then check it before publishing'
      const stateColor=paper.status==='published'||readyToPublish?'#176f3d':'#8a6d2b'
      return <article key={paper.id} style={{border:'1px solid #dfe6eb',padding:10,background:'#fff'}}>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(320px,520px)',gap:12,alignItems:'center'}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'#148444'}}>{paper.article_id||'GREEN Research Paper'} · {paper.status}</div>
            <div style={{fontFamily:'Georgia,serif',fontWeight:700,color:'#0b2d4e',fontSize:13,marginTop:3}}>{paper.title}</div>
            <div style={{fontSize:10.5,color:'#687586',marginTop:3}}>{paper.authors||'—'}{paper.volume?` · Vol. ${paper.volume}`:''}{paper.issue?` · Issue ${paper.issue}`:''}{paper.publication_month?` · ${paper.publication_month}`:''}{paper.publication_year?` ${paper.publication_year}`:''}</div>
            <div style={{fontSize:10.5,marginTop:5,color:stateColor,fontWeight:paper.certificate_path?700:400}}>{stateText}</div>
          </div>
          <div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:6,flexWrap:'wrap',marginBottom:6}}>
              <button className="btn btnGreen compact" type="button" disabled={busy||!canGenerate} onClick={()=>generateCertificate(paper)}>{busy?'Working…':paper.certificate_path?'Regenerate Certificate':'Generate Certificate'}</button>
              {paper.certificate_path?<><button className="smallBtn" type="button" disabled={busy} onClick={()=>openCertificate(paper,false)}>View / Check</button><button className="smallBtn" type="button" disabled={busy} onClick={()=>openCertificate(paper,true)}>Download</button></>:null}
              {readyToPublish?<button className="btn btnGreen compact" type="button" disabled={busy} onClick={()=>publishPaper(paper)}>Publish Paper + Certificate</button>:null}
              {paper.status==='published'?<button className="smallBtn" type="button" disabled={busy} onClick={()=>unpublishPaper(paper)}>Move to Draft</button>:null}
            </div>
            <details>
              <summary style={{fontSize:10.5,color:'#5f6f7c',cursor:'pointer',textAlign:'right'}}>Manual certificate PDF</summary>
              <form onSubmit={event=>uploadCertificate(event,paper)} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:7,alignItems:'center',marginTop:7}}>
                <input name="certificate" type="file" accept="application/pdf,.pdf" style={field}/>
                <button className="btn btnOutline compact" type="submit" disabled={busy}>{busy?'Working…':paper.certificate_path?'Replace PDF':'Upload PDF'}</button>
              </form>
            </details>
            {paper.certificate_path&&paper.status!=='published'?<div style={{display:'flex',justifyContent:'flex-end',marginTop:6}}><button className="smallBtn" type="button" disabled={busy} onClick={()=>removeCertificate(paper)} style={{color:'#9d2525',borderColor:'#efc5c5'}}>Delete Certificate</button></div>:null}
          </div>
        </div>
      </article>
    })}</div>

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:12,flexWrap:'wrap'}}>
      <div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(1)}>« First</button><button className="smallBtn" type="button" disabled={page<=1||loading} onClick={()=>setPage(value=>Math.max(1,value-1))}>← Previous</button></div>
      <span style={{fontSize:11,color:'#687586'}}>Showing {start}–{end} of {total}</span>
      <div style={{display:'flex',gap:5}}><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(value=>Math.min(totalPages,value+1))}>Next →</button><button className="smallBtn" type="button" disabled={page>=totalPages||loading} onClick={()=>setPage(totalPages)}>Last »</button></div>
    </div>
  </section>
}
