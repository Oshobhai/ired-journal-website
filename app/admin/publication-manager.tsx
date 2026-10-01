'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')
}

function cleanSection(value:string){
  return value.replace(/\s*\n\s*/g,' ').replace(/\s+/g,' ').replace(/^[\s:;,.\-–—]+|[\s:;,.\-–—]+$/g,'').trim()
}

function findHeading(text:string,pattern:RegExp,from=0){
  const match=pattern.exec(text.slice(from))
  if(!match)return null
  return {start:from+match.index,end:from+match.index+match[0].length}
}

function parsePdfMetadata(rawText:string){
  const text=rawText.replace(/\r/g,'\n').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()
  const abstractHeading=/(?:^|\n)\s*(?:abstract|summary)\s*[:.\-–—]*/i
  const keywordsHeading=/(?:^|\n)\s*(?:keywords?|key\s*words?|index\s*terms?)\s*[:.\-–—]*/i
  const nextSection=/(?:^|\n)\s*(?:(?:1|i)\s*[.)-]?\s*)?(?:introduction|background|methodology|research methodology|materials and methods|objectives?)\s*[:.\-–—]*/i

  let abstract=''
  const abstractAt=findHeading(text,abstractHeading)
  const keywordsAt=findHeading(text,keywordsHeading,abstractAt?.end||0)
  if(abstractAt){
    const introAt=findHeading(text,nextSection,abstractAt.end)
    const possibleEnds=[keywordsAt?.start,introAt?.start,abstractAt.end+5000].filter((value):value is number=>typeof value==='number'&&value>abstractAt.end)
    const end=Math.min(...possibleEnds)
    abstract=cleanSection(text.slice(abstractAt.end,end)).slice(0,5000)
  }

  let keywordText=''
  const keywordStart=keywordsAt||findHeading(text,keywordsHeading)
  if(keywordStart){
    const introAt=findHeading(text,nextSection,keywordStart.end)
    const end=introAt?.start&&introAt.start>keywordStart.end?Math.min(introAt.start,keywordStart.end+1200):Math.min(text.length,keywordStart.end+1200)
    keywordText=text.slice(keywordStart.end,end).trim()
  }
  let keywordParts=keywordText.split(/\s*[,;•·|]\s*/).map(cleanSection).filter(Boolean)
  if(keywordParts.length<=1&&keywordText.includes('\n'))keywordParts=keywordText.split(/\n+/).map(cleanSection).filter(Boolean)
  const keywords=[...new Set(keywordParts.filter(item=>item.length<=120).slice(0,20))]
  return {abstract,keywords,textLength:text.length}
}

async function extractPdfMetadata(file:File){
  const pdfjs=await import('pdfjs-dist/webpack.mjs')
  const bytes=new Uint8Array(await file.arrayBuffer())
  const loadingTask=pdfjs.getDocument({data:bytes})
  const pdf=await loadingTask.promise
  const pages:string[]=[]
  try{
    const pageCount=Math.min(pdf.numPages,6)
    for(let pageNumber=1;pageNumber<=pageCount;pageNumber++){
      const page=await pdf.getPage(pageNumber)
      const content=await page.getTextContent()
      const lines:string[]=[]
      let line=''
      for(const rawItem of content.items as unknown as Array<{str?:string;hasEOL?:boolean}>){
        if(typeof rawItem.str!=='string')continue
        const piece=rawItem.str.trim()
        if(piece)line+=`${piece} `
        if(rawItem.hasEOL){if(line.trim())lines.push(line.trim());line=''}
      }
      if(line.trim())lines.push(line.trim())
      pages.push(lines.join('\n'))
    }
  }finally{
    await pdf.destroy()
  }
  return parsePdfMetadata(pages.join('\n'))
}

export default function PublicationManager(){
  const supabase=createClient()
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [extracting,setExtracting]=useState(false)
  const [greenAbstract,setGreenAbstract]=useState('')
  const [greenKeywords,setGreenKeywords]=useState('')
  const [extractionNote,setExtractionNote]=useState('')

  async function handleGreenPdf(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0]
    setGreenAbstract('')
    setGreenKeywords('')
    setExtractionNote('')
    if(!file)return
    if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){setExtractionNote('Please select a PDF file.');return}
    if(file.size>50*1024*1024){setExtractionNote('PDF is larger than the 50 MB GREEN upload limit.');return}
    setExtracting(true)
    setExtractionNote('Reading PDF for Abstract and Keywords…')
    try{
      const extracted=await extractPdfMetadata(file)
      setGreenAbstract(extracted.abstract)
      setGreenKeywords(extracted.keywords.join(', '))
      if(extracted.abstract&&extracted.keywords.length)setExtractionNote('Abstract and Keywords were detected from the PDF. Review or edit them before upload.')
      else if(extracted.abstract)setExtractionNote('Abstract was detected. Keywords were not found; add them manually if needed.')
      else if(extracted.keywords.length)setExtractionNote('Keywords were detected. Abstract was not found; add it manually if needed.')
      else if(extracted.textLength)setExtractionNote('PDF text was readable, but Abstract/Keywords headings were not detected. You can enter them manually.')
      else setExtractionNote('No selectable text was detected. If this is a scanned PDF, enter Abstract and Keywords manually.')
    }catch(error){
      setExtractionNote(error instanceof Error?`Could not read PDF metadata: ${error.message}`:'Could not read PDF metadata. Enter Abstract and Keywords manually.')
    }finally{setExtracting(false)}
  }

  async function uploadGreen(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    const formEl=event.currentTarget
    const form=new FormData(formEl)
    const file=form.get('pdf') as File
    const certificate=form.get('certificate') as File
    setBusy(true);setMessage('')
    let path=''
    let certificatePath=''
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')
      if(!file||file.size===0)throw new Error('Please select the GREEN paper PDF.')
      if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf'))throw new Error('GREEN paper must be a PDF file.')
      if(file.size>50*1024*1024)throw new Error('GREEN paper PDF must be 50 MB or less.')
      if(certificate&&certificate.size>0){
        if(certificate.type!=='application/pdf'&&!certificate.name.toLowerCase().endsWith('.pdf'))throw new Error('Certificate must be a PDF file.')
        if(certificate.size>10*1024*1024)throw new Error('Certificate PDF must be 10 MB or less.')
      }

      const title=String(form.get('paper_title')||'').trim()
      const author=String(form.get('author_name')||'').trim()
      const researchScholar=String(form.get('research_scholar')||'').trim()
      const publicationMonth=String(form.get('publication_month')||'').trim()
      const publicationYear=Number(form.get('publication_year'))
      const volume=String(form.get('volume')||'').trim()
      const issue=String(form.get('issue')||'').trim()
      const abstract=String(form.get('abstract')||'').trim()||null
      const keywords=String(form.get('keywords')||'').split(/[,;\n]+/).map(value=>value.trim()).filter(Boolean).slice(0,20)
      if(!title||!author||!researchScholar)throw new Error('Paper Title, Author Name and Research Scholar are required.')
      if(!months.includes(publicationMonth))throw new Error('Please select the GREEN publication month.')
      if(!Number.isInteger(publicationYear)||publicationYear<1900||publicationYear>2100)throw new Error('Please enter a valid GREEN publication year.')
      if(!volume||!issue)throw new Error('Volume and Issue are required for GREEN papers.')

      path=`${publicationYear}/${crypto.randomUUID()}-${safeFileName(file.name)}`
      const {error:uploadError}=await supabase.storage.from('green-papers').upload(path,file,{contentType:'application/pdf',upsert:false})
      if(uploadError)throw uploadError

      if(certificate&&certificate.size>0){
        certificatePath=`${publicationYear}/${crypto.randomUUID()}-${safeFileName(certificate.name)}`
        const {error:certificateError}=await supabase.storage.from('green-certificates').upload(certificatePath,certificate,{contentType:'application/pdf',upsert:false})
        if(certificateError)throw certificateError
      }

      const {error:insertError}=await supabase.from('green_papers').insert({
        title,
        authors:author,
        affiliation:researchScholar,
        abstract,
        keywords,
        publication_month:publicationMonth,
        publication_year:publicationYear,
        volume,
        issue,
        pdf_path:path,
        pdf_size:file.size,
        certificate_path:certificatePath||null,
        certificate_uploaded_at:certificatePath?new Date().toISOString():null,
        status:'draft',
        published_at:null,
        created_by:user.id,
      })
      if(insertError)throw insertError

      formEl.reset()
      setGreenAbstract('')
      setGreenKeywords('')
      setExtractionNote('')
      setMessage(certificatePath
        ? 'GREEN paper and certificate uploaded successfully as Draft. Continue management from GREEN Papers.'
        : 'GREEN paper uploaded successfully as Draft. Continue certificate and publication work from GREEN Papers.')
    }catch(error){
      if(path)await supabase.storage.from('green-papers').remove([path])
      if(certificatePath)await supabase.storage.from('green-certificates').remove([certificatePath])
      setMessage(error instanceof Error?error.message:'GREEN upload failed.')
    }finally{setBusy(false)}
  }

  async function uploadRed(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    const formEl=event.currentTarget
    const form=new FormData(formEl)
    const file=form.get('pdf') as File
    const cover=form.get('cover') as File
    let pdfPath=''
    let coverPath=''
    setBusy(true);setMessage('')
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')
      if(!file||file.type!=='application/pdf')throw new Error('Please select a PDF file.')
      if(file.size>200*1024*1024)throw new Error('RED publication PDF must be 200 MB or less.')

      if(cover&&cover.size>0){
        if(!['image/jpeg','image/png','image/webp'].includes(cover.type))throw new Error('Cover must be JPG, PNG, or WebP.')
        if(cover.size>5*1024*1024)throw new Error('Cover image must be 5 MB or less.')
        coverPath=`${new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(cover.name)}`
        const {error}=await supabase.storage.from('red-book-covers').upload(coverPath,cover,{contentType:cover.type,upsert:false})
        if(error)throw error
      }

      pdfPath=`${new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(file.name)}`
      const {error:pdfError}=await supabase.storage.from('red-books').upload(pdfPath,file,{contentType:'application/pdf',upsert:false})
      if(pdfError)throw pdfError

      const status=String(form.get('status')||'draft')
      const publicationMonth=String(form.get('publication_month')||'').trim()||null
      const publicationYear=Number(form.get('publication_year'))||null
      const {error:insertError}=await supabase.from('red_books').insert({
        title:String(form.get('title')||'').trim(),
        subtitle:String(form.get('subtitle')||'').trim()||null,
        editors:String(form.get('editors')||'').trim()||null,
        publication_year:publicationYear,
        publication_month:publicationMonth,
        volume:String(form.get('volume')||'').trim()||null,
        issue:String(form.get('issue')||'').trim()||null,
        issn:String(form.get('issn')||'').trim()||null,
        publication_label:publicationMonth&&publicationYear?`${publicationMonth} ${publicationYear}`:publicationMonth||(publicationYear?String(publicationYear):null),
        cover_path:coverPath||null,
        pdf_path:pdfPath,
        pdf_size:file.size,
        status,
        published_at:status==='published'?new Date().toISOString():null,
        created_by:user.id,
      })
      if(insertError)throw insertError
      formEl.reset()
      setMessage('RED publication uploaded successfully. Continue management from RED Publications.')
    }catch(error){
      if(pdfPath)await supabase.storage.from('red-books').remove([pdfPath])
      if(coverPath)await supabase.storage.from('red-book-covers').remove([coverPath])
      setMessage(error instanceof Error?error.message:'RED upload failed.')
    }finally{setBusy(false)}
  }

  const fieldStyle={width:'100%',padding:'9px 10px',border:'1px solid #ccd5dd',borderRadius:5,marginTop:4,marginBottom:10} as const
  const labelStyle={display:'block',fontSize:12,fontWeight:700} as const

  return <div style={{display:'grid',gap:22,marginTop:24}}>
    {message?<div style={{padding:'11px 13px',background:'#eef7f2',border:'1px solid #c7e4d2',borderRadius:6,fontSize:13}}>{message}</div>:null}

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:18}}>
      <section className="contentCard">
        <h2>Add GREEN Research Paper</h2>
        <p style={{fontSize:12,color:'#687586',marginTop:-4}}>Upload a new GREEN paper as Draft. Abstract and Keywords are read from the PDF when possible, then remain editable for review.</p>
        <form onSubmit={uploadGreen}>
          <label style={labelStyle}>Paper Title<input name="paper_title" required style={fieldStyle}/></label>
          <label style={labelStyle}>Author Name<input name="author_name" required style={fieldStyle}/></label>
          <label style={labelStyle}>Research Scholar<input name="research_scholar" required placeholder="Research Scholar / Institution" style={fieldStyle}/></label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginTop:2}}>
            <label style={labelStyle}>Month<select name="publication_month" defaultValue="" required style={fieldStyle}><option value="" disabled>Select month</option>{months.map(month=><option key={month} value={month}>{month}</option>)}</select></label>
            <label style={labelStyle}>Year<input name="publication_year" type="number" min="1900" max="2100" required placeholder="2026" style={fieldStyle}/></label>
            <label style={labelStyle}>Volume<input name="volume" type="number" min="1" required placeholder="1" style={fieldStyle}/></label>
            <label style={labelStyle}>Issue<input name="issue" type="number" min="1" required placeholder="1" style={fieldStyle}/></label>
          </div>
          <div style={{fontSize:10.5,color:'#667b6e',marginTop:-3,marginBottom:10}}>Month, Year, Volume and Issue are saved exactly as entered. Article ID remains automatic.</div>
          <label style={labelStyle}>Paper PDF (max 50 MB)<input name="pdf" type="file" accept="application/pdf,.pdf" required onChange={handleGreenPdf} style={fieldStyle}/></label>
          {extractionNote?<div style={{fontSize:10.5,lineHeight:1.5,color:extractionNote.startsWith('Could not')?'#9a3c32':'#526b5d',padding:'8px 10px',background:'#f7faf8',border:'1px solid #dbe7df',margin:'-3px 0 10px'}}>{extractionNote}</div>:null}
          <label style={labelStyle}>Abstract <span style={{fontWeight:400,color:'#75828d'}}>(auto-filled when detected)</span><textarea name="abstract" value={greenAbstract} onChange={event=>setGreenAbstract(event.target.value)} rows={7} maxLength={10000} placeholder="Abstract will be extracted from a text-based PDF when possible. You may edit it before upload." style={{...fieldStyle,resize:'vertical',lineHeight:1.55}}/></label>
          <label style={labelStyle}>Keywords <span style={{fontWeight:400,color:'#75828d'}}>(comma-separated)</span><textarea name="keywords" value={greenKeywords} onChange={event=>setGreenKeywords(event.target.value)} rows={2} maxLength={1500} placeholder="Keyword 1, Keyword 2, Keyword 3" style={{...fieldStyle,resize:'vertical',lineHeight:1.5}}/></label>
          <label style={labelStyle}>Certificate PDF (optional · max 10 MB)<input name="certificate" type="file" accept="application/pdf,.pdf" style={fieldStyle}/></label>
          <div style={{fontSize:10.5,color:'#667b6e',marginTop:-3,marginBottom:10}}>Scanned/image-only PDFs may not expose selectable text. In that case, review and enter Abstract/Keywords manually. Certificate work and publishing are handled from GREEN Papers after upload.</div>
          <button className="btn btnGreen" disabled={busy||extracting} type="submit">{extracting?'Reading PDF…':busy?'Uploading…':'Upload GREEN Paper'}</button>
        </form>
      </section>

      <section className="contentCard">
        <h2>Add RED Print Publication</h2>
        <p style={{fontSize:12,color:'#687586',marginTop:-4}}>Upload a new RED print publication. Existing records are managed from RED Publications.</p>
        <form onSubmit={uploadRed}>
          <label style={labelStyle}>Cover (JPG, PNG, WebP · max 5 MB)<input name="cover" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" style={fieldStyle}/></label>
          <label style={labelStyle}>Title<input name="title" required style={fieldStyle}/></label>
          <label style={labelStyle}>Subtitle<input name="subtitle" style={fieldStyle}/></label>
          <label style={labelStyle}>Editor(s)<input name="editors" style={fieldStyle}/></label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            <label style={labelStyle}>Month<select name="publication_month" defaultValue="August" style={fieldStyle}>{months.map(month=><option key={month}>{month}</option>)}</select></label>
            <label style={labelStyle}>Year<input name="publication_year" type="number" min="1900" max="2100" style={fieldStyle}/></label>
            <label style={labelStyle}>Volume<input name="volume" style={fieldStyle}/></label>
            <label style={labelStyle}>Issue<input name="issue" style={fieldStyle}/></label>
          </div>
          <label style={labelStyle}>ISSN<input name="issn" style={fieldStyle}/></label>
          <label style={labelStyle}>PDF (max 200 MB)<input name="pdf" type="file" accept="application/pdf,.pdf" required style={fieldStyle}/></label>
          <label style={labelStyle}>Initial status<select name="status" defaultValue="draft" style={fieldStyle}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <button className="btn btnRed" disabled={busy} type="submit">{busy?'Working…':'Upload RED Publication'}</button>
        </form>
      </section>
    </div>
  </div>
}
