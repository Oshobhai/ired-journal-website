'use client'

import {FormEvent,useCallback,useEffect,useState} from 'react'
import {PDFDocument} from 'pdf-lib'
import {createClient} from '@/lib/supabase/client'

type Paper={
  id:string
  title:string
  authors:string|null
  article_id:string|null
  publication_year:number|null
  publication_month:string|null
  volume:string|null
  issue:string|null
  status:'draft'|'published'|'archived'
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

const defaultInfo:CertificateInfo={
  greenTitle:'GREEN: The Research Journal',
  publisherName:'Institute of Research Education and Development (IRED)',
  officialAddress:'A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India',
  greenIssn:'XXXX-XXXX',
  editorName:'Dr. Bhavika Kadikar',
  chairName:'Dr. Kumarpal Parmar',
}

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'certificate.pdf'
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
  while(size>=20){
    ctx.font=`${weight} ${size}px "Nirmala UI","Noto Sans Gujarati","Shruti","Arial Unicode MS",Arial,sans-serif`
    lines=wrapLines(ctx,text,maxWidth)
    if(lines.length<=maxLines)break
    size-=2
  }
  const actualLineHeight=Math.max(lineHeight-(fontSize-size)*0.5,size+8)
  ctx.textAlign='center'
  for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],800,y+i*actualLineHeight)
  return y+lines.length*actualLineHeight
}

async function loadImage(src:string){
  return await new Promise<HTMLImageElement>((resolve,reject)=>{
    const image=new Image()
    image.onload=()=>resolve(image)
    image.onerror=()=>reject(new Error('Could not load certificate logo.'))
    image.src=src
  })
}

async function canvasBlob(canvas:HTMLCanvasElement){
  return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not render certificate image.')),'image/png'))
}

function certificateDate(){
  return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',day:'2-digit',month:'long',year:'numeric'}).format(new Date())
}

function issnText(value:string){
  const clean=value.trim()
  return clean&&!/^x{4}-x{4}$/i.test(clean)?`ISSN: ${clean}`:'ISSN: Pending'
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

  const green='#138a44'
  const dark='#0b2d4e'
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height)

  ctx.strokeStyle=green;ctx.lineWidth=5;ctx.strokeRect(28,24,1544,1083)
  ctx.strokeStyle='#b8d9c4';ctx.lineWidth=1.5;ctx.strokeRect(43,39,1514,1053)

  ctx.save()
  ctx.globalAlpha=.035
  ctx.fillStyle=green
  ctx.font='800 210px Georgia,serif'
  ctx.textAlign='center'
  ctx.fillText('IRED',800,670)
  ctx.restore()

  const logo=await loadImage('/green-logo.png').catch(()=>null)
  if(logo){
    const maxW=560,maxH=118
    const scale=Math.min(maxW/logo.width,maxH/logo.height)
    const w=logo.width*scale,h=logo.height*scale
    ctx.drawImage(logo,(1600-w)/2,54,w,h)
  }else{
    ctx.fillStyle=green;ctx.font='700 58px Georgia,serif';ctx.textAlign='center';ctx.fillText(info.greenTitle,800,125)
  }

  ctx.fillStyle='#111827';ctx.font='700 27px Georgia,serif';ctx.textAlign='center'
  ctx.fillText('International Multi-Disciplinary Peer-Reviewed e-Journal',800,190)
  ctx.strokeStyle=green;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(120,218);ctx.lineTo(1480,218);ctx.stroke()

  ctx.fillStyle=green;ctx.font='700 48px Georgia,serif';ctx.fillText('Certificate of Publication',800,286)
  ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(145,316);ctx.lineTo(1455,316);ctx.stroke()

  ctx.fillStyle='#111827';ctx.font='400 24px Georgia,serif';ctx.fillText('This is to certify that the Editorial Board and Review Committee have accepted the Research Paper/Article',800,365)
  ctx.font='600 23px Georgia,serif';ctx.fillText('entitled',800,405)

  ctx.fillStyle='#0f172a'
  let y=drawWrappedCentered(ctx,paper.title,455,1320,38,47,3,'700')
  ctx.font='600 23px Georgia,serif';ctx.textAlign='center';ctx.fillText('of',800,y+4)
  y+=44
  ctx.fillStyle='#0f172a'
  y=drawWrappedCentered(ctx,paper.authors,y,1220,36,44,2,'700')

  const publicationText=`Has been published in Issue-${paper.issue}, Volume-${paper.volume} in the Month of ${paper.publication_month}-${paper.publication_year} in ${info.greenTitle} (${issnText(info.greenIssn)}), published by ${info.publisherName}.`
  ctx.fillStyle='#111827'
  y=drawWrappedCentered(ctx,publicationText,y+24,1420,24,35,4,'400')
  ctx.font='400 22px Georgia,serif';ctx.textAlign='center';ctx.fillText(`This certificate is issued on ${certificateDate()}.`,800,y+16)

  if(paper.article_id){ctx.fillStyle='#64748b';ctx.font='600 17px Arial,sans-serif';ctx.fillText(`Article ID: ${paper.article_id}`,800,y+54)}

  const signatureY=860
  const columns=[
    {x:280,name:info.editorName,role:'Editor-in-Chief'},
    {x:800,name:'Chandrakant Parmar',role:'Vice-President, IRED'},
    {x:1320,name:info.chairName,role:'Chairman, Editorial Board'},
  ]
  for(const column of columns){
    ctx.strokeStyle='#607080';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(column.x-145,signatureY);ctx.lineTo(column.x+145,signatureY);ctx.stroke()
    ctx.fillStyle=dark;ctx.font='700 22px Georgia,serif';ctx.textAlign='center';ctx.fillText(column.name,column.x,signatureY+40)
    ctx.fillStyle='#273746';ctx.font='400 18px Arial,sans-serif';ctx.fillText(column.role,column.x,signatureY+71)
  }

  ctx.strokeStyle=green;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(145,1012);ctx.lineTo(1455,1012);ctx.stroke()
  ctx.fillStyle=green;ctx.font='600 17px Arial,sans-serif';ctx.textAlign='center'
  const address=info.officialAddress||defaultInfo.officialAddress
  const addressLines=wrapLines(ctx,`IRED, ${address}`,1380)
  addressLines.slice(0,2).forEach((line,index)=>ctx.fillText(line,800,1048+index*24))
  ctx.fillStyle='#7a8792';ctx.font='400 12px Arial,sans-serif';ctx.fillText('Digitally generated by the IRED Journal Platform from the approved publication record.',800,1094)

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

export default function GreenCertificateManager(){
  const supabase=createClient()
  const [papers,setPapers]=useState<Paper[]>([])
  const [info,setInfo]=useState<CertificateInfo>(defaultInfo)
  const [busyId,setBusyId]=useState<string|null>(null)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const [{data:paperData,error},{data:site},{data:contact},{data:leaders}]=await Promise.all([
      supabase.from('green_papers').select('id,title,authors,article_id,publication_year,publication_month,volume,issue,status,certificate_path,certificate_uploaded_at').order('created_at',{ascending:false}),
      supabase.from('site_settings').select('green_title,publisher_name,official_address').eq('id',true).maybeSingle(),
      supabase.from('contact_settings').select('green_issn').eq('id',true).maybeSingle(),
      supabase.from('editorial_members').select('name,section,sort_order').eq('is_visible',true).in('section',['editor','editorial']).order('sort_order').order('name'),
    ])
    if(error){setMessage(error.message);return}
    setPapers((paperData||[]) as Paper[])
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
  },[supabase])

  useEffect(()=>{
    void load()
    const timer=window.setInterval(()=>{void load()},4000)
    return()=>window.clearInterval(timer)
  },[load])

  async function saveCertificateFile(file:File,paper:Paper,successMessage:string){
    if(file.size>10*1024*1024)throw new Error('Generated certificate PDF is larger than 10 MB.')
    const year=paper.publication_year||new Date().getFullYear()
    const newPath=`${year}/${paper.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`
    const {error:uploadError}=await supabase.storage.from('green-certificates').upload(newPath,file,{contentType:'application/pdf',upsert:false})
    if(uploadError)throw uploadError
    const oldPath=paper.certificate_path
    const {error:updateError}=await supabase.from('green_papers').update({certificate_path:newPath,certificate_uploaded_at:new Date().toISOString()}).eq('id',paper.id)
    if(updateError){await supabase.storage.from('green-certificates').remove([newPath]);throw updateError}
    if(oldPath)await supabase.storage.from('green-certificates').remove([oldPath])
    setMessage(successMessage)
    await load()
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
    if(paper.status==='published'){return}
    if(paper.status==='archived'){setMessage('Archived papers cannot be published from the certificate workflow.');return}
    if(!confirm(`Publish “${paper.title}” together with its checked certificate?`))return
    setBusyId(paper.id);setMessage('')
    try{
      const {error}=await supabase.from('green_papers').update({status:'published',published_at:new Date().toISOString()}).eq('id',paper.id)
      if(error)throw error
      setMessage('Paper and certificate published successfully.')
      await load()
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
      await load()
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
      <div>
        <h2 style={{margin:'0 0 5px'}}>GREEN Certificate Check & Publish</h2>
        <p style={{margin:0,fontSize:12,color:'#687586'}}>Workflow: upload paper as Draft → generate certificate → View and check it → Publish Paper + Certificate. A GREEN paper cannot be published without a certificate.</p>
      </div>
      <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}>
        <button className="smallBtn" type="button" onClick={()=>void load()}>Refresh Papers</button>
        <span style={{fontSize:10.5,padding:'5px 8px',background:'#eef8f2',border:'1px solid #cee5d6',color:'#176f3d'}}>{papers.filter(p=>p.certificate_path).length} certificate{papers.filter(p=>p.certificate_path).length===1?'':'s'} ready</span>
      </div>
    </div>

    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:12,fontSize:10.5}}>
      <span style={{padding:'4px 7px',border:'1px solid #dbe3e9',background:'#f8fafb'}}>1. Upload Paper</span>
      <span style={{padding:'4px 7px',border:'1px solid #dbe3e9',background:'#f8fafb'}}>2. Generate Certificate</span>
      <span style={{padding:'4px 7px',border:'1px solid #dbe3e9',background:'#f8fafb'}}>3. View / Check</span>
      <span style={{padding:'4px 7px',border:'1px solid #cfe5d6',background:'#eef8f2',color:'#176f3d',fontWeight:800}}>4. Publish Both</span>
    </div>

    {message?<div style={{padding:'9px 11px',background:'#f3f8fb',border:'1px solid #cbdde8',borderRadius:5,fontSize:12,marginBottom:12}}>{message}</div>:null}
    {papers.length===0?<p style={{fontSize:12,color:'#687586'}}>Upload a GREEN paper first.</p>:<div style={{display:'grid',gap:10}}>{papers.map(paper=>{
      const busy=busyId===paper.id
      const canGenerate=paper.status!=='archived'
      const readyToPublish=paper.status==='draft'&&Boolean(paper.certificate_path)
      const stateText=paper.status==='published'?'Published with certificate':paper.status==='archived'?'Archived':paper.certificate_path?'Certificate ready — check it, then publish':'Generate certificate, then check it before publishing'
      const stateColor=paper.status==='published'||readyToPublish?'#176f3d':'#8a6d2b'
      return <article key={paper.id} style={{border:'1px solid #dfe6eb',padding:12,background:'#fff'}}>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(330px,520px)',gap:14,alignItems:'center'}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'#148444'}}>{paper.article_id||'GREEN Research Paper'} · {paper.status}</div>
            <div style={{fontFamily:'Georgia,serif',fontWeight:700,color:'#0b2d4e',fontSize:13,marginTop:3}}>{paper.title}</div>
            <div style={{fontSize:10.5,color:'#687586',marginTop:3}}>{paper.authors||'—'}{paper.volume?` · Vol. ${paper.volume}`:''}{paper.issue?` · Issue ${paper.issue}`:''}{paper.publication_month?` · ${paper.publication_month}`:''}{paper.publication_year?` ${paper.publication_year}`:''}</div>
            <div style={{fontSize:10.5,marginTop:5,color:stateColor,fontWeight:paper.certificate_path?700:400}}>{stateText}</div>
          </div>
          <div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:7,flexWrap:'wrap',marginBottom:8}}>
              <button className="btn btnGreen compact" type="button" disabled={busy||!canGenerate} onClick={()=>generateCertificate(paper)}>{busy?'Working…':paper.certificate_path?'Regenerate Certificate':'Generate Certificate'}</button>
              {paper.certificate_path?<><button className="smallBtn" type="button" disabled={busy} onClick={()=>openCertificate(paper,false)}>View / Check</button><button className="smallBtn" type="button" disabled={busy} onClick={()=>openCertificate(paper,true)}>Download</button></>:null}
              {readyToPublish?<button className="btn btnGreen compact" type="button" disabled={busy} onClick={()=>publishPaper(paper)}>Publish Paper + Certificate</button>:null}
              {paper.status==='published'?<button className="smallBtn" type="button" disabled={busy} onClick={()=>unpublishPaper(paper)}>Move to Draft</button>:null}
            </div>
            <details>
              <summary style={{fontSize:10.5,color:'#5f6f7c',cursor:'pointer',textAlign:'right'}}>Manual certificate PDF fallback</summary>
              <form onSubmit={event=>uploadCertificate(event,paper)} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:7,alignItems:'center',marginTop:7}}>
                <input name="certificate" type="file" accept="application/pdf,.pdf" style={field}/>
                <button className="btn btnOutline compact" type="submit" disabled={busy}>{busy?'Working…':paper.certificate_path?'Replace PDF':'Upload PDF'}</button>
              </form>
            </details>
            {paper.certificate_path&&paper.status!=='published'?<div style={{display:'flex',justifyContent:'flex-end',marginTop:7}}><button className="smallBtn" type="button" disabled={busy} onClick={()=>removeCertificate(paper)} style={{color:'#9d2525',borderColor:'#efc5c5'}}>Delete Certificate</button></div>:null}
          </div>
        </div>
      </article>
    })}</div>}
  </section>
}
