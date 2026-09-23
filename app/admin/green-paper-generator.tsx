'use client'

import { ChangeEvent, DragEvent, FormEvent, useMemo, useRef, useState } from 'react'
import mammoth from 'mammoth/mammoth.browser'
import { createClient } from '@/lib/supabase/client'

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MAX_DOCX_SIZE = 25 * 1024 * 1024

type DocumentLanguage = 'auto'|'gujarati'|'hindi'|'english'|'other'
type Detection = {language:string;title:boolean;authors:boolean;affiliation:boolean;abstract:boolean;keywords:boolean}

const languageNames:Record<DocumentLanguage,string> = {
  auto:'Auto Detect',
  gujarati:'Gujarati',
  hindi:'Hindi / Devanagari',
  english:'English',
  other:'Other / Any Unicode Language',
}

const labels = {
  abstract: [
    'abstract','summary','સારાંશ','સંક્ષેપ','સંક્ષિપ્ત સાર','सारांश','संक्षेप','सार',
    'সারাংশ','সংক্ষিপ্তসার','ਸਾਰ','ਸੰਖੇਪ','சுருக்கம்','સારાંશ',
    'సారాంశం','ಸಾರಾಂಶ','സാരാംശം','خلاصہ'
  ],
  keywords: [
    'keywords','keyword','key words','ચાવીરૂપ શબ્દો','મુખ્ય શબ્દો','કીવર્ડ્સ','મુખ્યશબ્દો',
    'मुख्य शब्द','कुंजी शब्द','प्रमुख शब्द','कीवर्ड्स','की-वर्ड्स','মূল শব্দ','কীওয়ার্ড',
    'ਮੁੱਖ ਸ਼ਬਦ','ਕੀਵਰਡ','முக்கிய சொற்கள்','முதன்மைச் சொற்கள்','ముఖ్య పదాలు','కీవర్డ్స్',
    'ಮುಖ್ಯ ಪದಗಳು','ಕೀವರ್ಡ್ಸ್','പ്രധാന പദങ്ങൾ','കീവേഡുകൾ','کلیدی الفاظ'
  ],
  introduction: [
    'introduction','background','પ્રસ્તાવના','પરિચય','ભૂમિકા','भूमिका','परिचय','प्रस्तावना',
    'ভূমিকা','পরিচিতি','ਜਾਣ-ਪਛਾਣ','ਭੂਮਿਕਾ','அறிமுகம்','முன்னுரை','పరిచయం','ఉపోద్ఘాతం',
    'ಪರಿಚಯ','ಪ್ರಸ್ತಾವನೆ','ആമുഖം','പരിചയം','تعارف','تمہید'
  ]
}

function safeFileName(name:string){return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')}
function cleanText(value:string){return value.replace(/\s+/g,' ').trim()}
function normalize(value:string){return cleanText(value).toLocaleLowerCase().replace(/[：:–—-]+$/g,'').trim()}

function detectScript(text:string){
  const sample=text.slice(0,12000)
  const gu=(sample.match(/[\u0A80-\u0AFF]/g)||[]).length
  const deva=(sample.match(/[\u0900-\u097F]/g)||[]).length
  const latin=(sample.match(/[A-Za-z]/g)||[]).length
  if(gu>20 && gu>=deva && gu>=latin/2) return {key:'gujarati' as DocumentLanguage,name:'Gujarati'}
  if(deva>20 && deva>=gu && deva>=latin/2) return {key:'hindi' as DocumentLanguage,name:'Hindi / Devanagari'}
  if(latin>30) return {key:'english' as DocumentLanguage,name:'English / Latin'}
  return {key:'other' as DocumentLanguage,name:'Other Unicode Language'}
}

function labelSet(language:DocumentLanguage){
  if(language==='english') return {
    abstract:['abstract','summary'],keywords:['keywords','keyword','key words'],introduction:['introduction','background']
  }
  if(language==='gujarati') return {
    abstract:['સારાંશ','સંક્ષેપ','સંક્ષિપ્ત સાર','abstract'],
    keywords:['ચાવીરૂપ શબ્દો','મુખ્ય શબ્દો','કીવર્ડ્સ','મુખ્યશબ્દો','keywords','key words'],
    introduction:['પ્રસ્તાવના','પરિચય','ભૂમિકા','introduction']
  }
  if(language==='hindi') return {
    abstract:['सारांश','संक्षेप','सार','abstract'],
    keywords:['मुख्य शब्द','कुंजी शब्द','प्रमुख शब्द','कीवर्ड्स','की-वर्ड्स','keywords'],
    introduction:['भूमिका','परिचय','प्रस्तावना','introduction']
  }
  return labels
}

function startsWithLabel(text:string,candidates:string[]){
  const norm=normalize(text)
  return candidates.find(label=>norm===normalize(label) || norm.startsWith(`${normalize(label)}:`) || norm.startsWith(`${normalize(label)} -`) || norm.startsWith(`${normalize(label)} –`) || norm.startsWith(`${normalize(label)} —`)) || null
}

function valueAfterLabel(text:string,label:string){
  const raw=cleanText(text)
  const lower=raw.toLocaleLowerCase()
  const idx=lower.indexOf(label.toLocaleLowerCase())
  if(idx<0)return ''
  return raw.slice(idx+label.length).replace(/^[\s:：–—-]+/,'').trim()
}

function extractMetadata(html:string,languageChoice:DocumentLanguage){
  const doc = new DOMParser().parseFromString(html,'text/html')
  const fullText=cleanText(doc.body.textContent||'')
  const auto=detectScript(fullText)
  const activeLanguage=languageChoice==='auto'?auto.key:languageChoice
  const activeLabels=languageChoice==='auto'?labels:labelSet(activeLanguage)
  const blocks=Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6,p')).filter(el=>cleanText(el.textContent||''))
  const texts=blocks.map(el=>cleanText(el.textContent||''))

  const titleNode=doc.querySelector('h1') || doc.querySelector('h2') || blocks[0] || null
  const title=cleanText(titleNode?.textContent||texts[0]||'')
  const titleIndex=Math.max(0,blocks.indexOf(titleNode as Element))

  const isSectionLabel=(text:string)=>Boolean(
    startsWithLabel(text,activeLabels.abstract) || startsWithLabel(text,activeLabels.keywords) || startsWithLabel(text,activeLabels.introduction)
  )

  let authors=''
  let authorNode:Element|null=null
  for(let i=titleIndex+1;i<Math.min(blocks.length,titleIndex+5);i++){
    const t=texts[i]
    if(t.length<=220 && !isSectionLabel(t)){
      authors=t;authorNode=blocks[i];break
    }
  }

  let affiliation=''
  let affiliationNode:Element|null=null
  if(authorNode){
    const authorIndex=blocks.indexOf(authorNode)
    for(let i=authorIndex+1;i<Math.min(blocks.length,authorIndex+4);i++){
      const t=texts[i]
      if(isSectionLabel(t))break
      if(t.length<=280){affiliation=t;affiliationNode=blocks[i];break}
    }
  }

  let abstract=''
  let abstractLabelNode:Element|null=null
  let abstractValueNode:Element|null=null
  let keywords=''
  let keywordLabelNode:Element|null=null
  let keywordValueNode:Element|null=null
  let introductionNode:Element|null=null

  for(let i=0;i<blocks.length;i++){
    const el=blocks[i]
    const text=texts[i]
    if(!abstract){
      const match=startsWithLabel(text,activeLabels.abstract)
      if(match){
        abstractLabelNode=el
        const own=valueAfterLabel(text,match)
        if(own){abstract=own;abstractValueNode=el}
        else{
          const next=blocks[i+1]
          const nextText=texts[i+1]||''
          if(next && nextText && !isSectionLabel(nextText)){abstract=nextText;abstractValueNode=next}
        }
      }
    }
    if(!keywords){
      const match=startsWithLabel(text,activeLabels.keywords)
      if(match){
        keywordLabelNode=el
        const own=valueAfterLabel(text,match)
        if(own){keywords=own;keywordValueNode=el}
        else{
          const next=blocks[i+1]
          const nextText=texts[i+1]||''
          if(next && nextText && !isSectionLabel(nextText)){keywords=nextText;keywordValueNode=next}
        }
      }
    }
    if(!introductionNode && startsWithLabel(text,activeLabels.introduction)) introductionNode=el
  }

  // Preserve the original multilingual manuscript. Only remove duplicated front matter when
  // section structure is confidently recognized; otherwise keep the complete body for manual review.
  let cleanedBody=html
  const structureFound=Boolean(abstractLabelNode || keywordLabelNode || introductionNode)
  if(structureFound){
    const clone=new DOMParser().parseFromString(html,'text/html')
    const cloneBlocks=Array.from(clone.querySelectorAll('h1,h2,h3,h4,h5,h6,p')).filter(el=>cleanText(el.textContent||''))
    const removeByText=(value:string)=>{
      if(!value)return
      const node=cloneBlocks.find(el=>cleanText(el.textContent||'')===cleanText(value))
      node?.remove()
    }
    removeByText(title)
    removeByText(authors)
    removeByText(affiliation)

    for(const el of Array.from(clone.querySelectorAll('h1,h2,h3,h4,h5,h6,p'))){
      const t=cleanText(el.textContent||'')
      if(startsWithLabel(t,activeLabels.abstract) || startsWithLabel(t,activeLabels.keywords)){
        const next=el.nextElementSibling
        if(next && (cleanText(next.textContent||'')===cleanText(abstract) || cleanText(next.textContent||'')===cleanText(keywords))) next.remove()
        el.remove()
      }
    }
    cleanedBody=clone.body.innerHTML
  }

  return {
    title:title.length<=350?title:'',
    authors,
    affiliation,
    abstract,
    keywords,
    bodyHtml:cleanedBody,
    detection:{
      language:languageChoice==='auto'?auto.name:languageNames[languageChoice],
      title:Boolean(title),authors:Boolean(authors),affiliation:Boolean(affiliation),abstract:Boolean(abstract),keywords:Boolean(keywords)
    } satisfies Detection
  }
}

export default function GreenPaperGenerator(){
  const supabase=createClient()
  const fileInput=useRef<HTMLInputElement|null>(null)
  const [step,setStep]=useState<1|2|3>(1)
  const [docx,setDocx]=useState<File|null>(null)
  const [rawHtml,setRawHtml]=useState('')
  const [bodyHtml,setBodyHtml]=useState('')
  const [language,setLanguage]=useState<DocumentLanguage>('auto')
  const [detection,setDetection]=useState<Detection|null>(null)
  const [busy,setBusy]=useState(false)
  const [dragging,setDragging]=useState(false)
  const [advanced,setAdvanced]=useState(false)
  const [message,setMessage]=useState('')
  const [meta,setMeta]=useState({title:'',authors:'',affiliation:'',email:'',abstract:'',keywords:'',month:months[new Date().getMonth()],year:String(new Date().getFullYear()),volume:'1',issue:'1',issn:'',articleType:'Research Article'})

  const articleId=useMemo(()=>`GREEN-${meta.year||new Date().getFullYear()}-AUTO`,[meta.year])
  const canPreview=Boolean(docx && meta.title.trim() && meta.authors.trim())

  function applyExtraction(html:string,choice:DocumentLanguage,overwrite=false){
    const detected=extractMetadata(html,choice)
    setBodyHtml(detected.bodyHtml)
    setDetection(detected.detection)
    setMeta(m=>({
      ...m,
      title:overwrite?(detected.title||m.title):(m.title||detected.title),
      authors:overwrite?(detected.authors||m.authors):(m.authors||detected.authors),
      affiliation:overwrite?(detected.affiliation||m.affiliation):(m.affiliation||detected.affiliation),
      abstract:overwrite?(detected.abstract||m.abstract):(m.abstract||detected.abstract),
      keywords:overwrite?(detected.keywords||m.keywords):(m.keywords||detected.keywords),
    }))
    return detected
  }

  async function processDocx(f:File|null){
    setMessage('')
    if(!f){setDocx(null);setRawHtml('');setBodyHtml('');setDetection(null);return}
    if(!f.name.toLowerCase().endsWith('.docx')){setMessage('Please choose a Microsoft Word .docx file.');return}
    if(f.size>MAX_DOCX_SIZE){setMessage('DOCX must be 25 MB or smaller.');return}

    setBusy(true)
    try{
      const arrayBuffer=await f.arrayBuffer()
      const result=await mammoth.convertToHtml({arrayBuffer},{includeDefaultStyleMap:true})
      setDocx(f)
      setRawHtml(result.value)
      const detected=applyExtraction(result.value,language)
      const found=['Title','Author',detected.affiliation?'Affiliation':'',detected.abstract?'Abstract':'',detected.keywords?'Keywords':''].filter(Boolean).join(', ')
      setMessage(`DOCX loaded. Language: ${detected.detection.language}. Detected: ${found||'basic document structure only'}. Please verify all fields before saving.`)
      setStep(2)
    }catch(err){setMessage(err instanceof Error?err.message:'Could not read DOCX.')}
    finally{setBusy(false)}
  }

  async function onDocx(e:ChangeEvent<HTMLInputElement>){await processDocx(e.target.files?.[0]||null)}
  async function onDrop(e:DragEvent<HTMLDivElement>){e.preventDefault();setDragging(false);await processDocx(e.dataTransfer.files?.[0]||null)}
  function update(k:keyof typeof meta,v:string){setMeta(m=>({...m,[k]:v}))}
  function changeLanguage(value:DocumentLanguage){
    setLanguage(value)
    if(rawHtml){
      const detected=applyExtraction(rawHtml,value,true)
      setMessage(`Re-detected using ${detected.detection.language}. Please check the extracted details.`)
    }
  }

  async function saveDraft(e:FormEvent){
    e.preventDefault()
    if(!docx){setMessage('Upload the source DOCX first.');setStep(1);return}
    if(!meta.title.trim()||!meta.authors.trim()){setMessage('Title and Author(s) are required.');setStep(2);return}
    setBusy(true);setMessage('')
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser();if(userError||!user)throw new Error('Admin session expired.')
      const manuscriptPath=`${meta.year||new Date().getFullYear()}/${crypto.randomUUID()}-${safeFileName(docx.name)}`
      const {error:upErr}=await supabase.storage.from('green-manuscripts').upload(manuscriptPath,docx,{contentType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',upsert:false});if(upErr)throw upErr
      const {count}=await supabase.from('green_papers').select('id',{count:'exact',head:true}).eq('publication_year',Number(meta.year)||null)
      const seq=String((count||0)+1).padStart(4,'0')
      const id=`GREEN-${meta.year}-${seq}`
      const {error:insertErr}=await supabase.from('green_papers').insert({
        article_id:id,title:meta.title.trim(),authors:meta.authors.trim(),affiliation:meta.affiliation.trim()||null,author_email:meta.email.trim()||null,
        abstract:meta.abstract.trim()||null,keywords:meta.keywords.split(',').map(x=>x.trim()).filter(Boolean),publication_month:meta.month,publication_year:Number(meta.year)||null,
        volume:meta.volume.trim()||null,issue:meta.issue.trim()||null,issn:meta.issn.trim()||null,article_type:meta.articleType,source_docx_path:manuscriptPath,
        pdf_path:`pending/${id}.pdf`,status:'draft',created_by:user.id
      })
      if(insertErr){await supabase.storage.from('green-manuscripts').remove([manuscriptPath]);throw insertErr}
      setMessage(`Draft saved successfully as ${id}. It is not public yet.`)
    }catch(err){setMessage(err instanceof Error?err.message:'Could not save draft.')}
    finally{setBusy(false)}
  }

  const field={width:'100%',padding:'10px 11px',border:'1px solid #cbd5df',borderRadius:4,fontSize:12,background:'#fff'} as const
  const label={display:'block',fontSize:11,fontWeight:700,color:'#273b50'} as const
  const stepButton=(n:1|2|3)=>({flex:'1 1 180px',padding:'11px 12px',border:'1px solid '+(step===n?'#176d42':'#d6dfe5'),background:step===n?'#eef7f2':'#fff',color:step===n?'#176d42':'#677684',fontWeight:800,fontSize:11,textAlign:'left' as const,cursor:'pointer'})

  return <section id="green-generator" className="contentCard" style={{marginTop:20,padding:0,overflow:'hidden'}}>
    <div style={{padding:'20px 22px 14px',borderBottom:'1px solid #dde5ea',background:'#fff'}}>
      <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#176d42'}}>GREEN Publication Workflow</div>
      <h2 style={{margin:'4px 0 4px',fontFamily:'Georgia,serif',color:'#0b2d4e'}}>GREEN Paper Generator</h2>
      <p style={{fontSize:12,color:'#657483',margin:0,lineHeight:1.6}}>Multilingual DOCX workflow: upload the manuscript in any Unicode language, verify extracted details, review the GREEN layout, and save a protected draft.</p>
    </div>

    <div style={{display:'flex',gap:8,flexWrap:'wrap',padding:'14px 22px',background:'#f8fafb',borderBottom:'1px solid #e1e7eb'}}>
      <button type="button" style={stepButton(1)} onClick={()=>setStep(1)}><span style={{display:'block',fontSize:9,letterSpacing:'.08em'}}>STEP 1</span>Upload Manuscript</button>
      <button type="button" style={stepButton(2)} onClick={()=>docx&&setStep(2)}><span style={{display:'block',fontSize:9,letterSpacing:'.08em'}}>STEP 2</span>Check Details</button>
      <button type="button" style={stepButton(3)} onClick={()=>canPreview&&setStep(3)}><span style={{display:'block',fontSize:9,letterSpacing:'.08em'}}>STEP 3</span>Preview & Save Draft</button>
    </div>

    <div style={{padding:'20px 22px'}}>
      {message?<div style={{padding:'10px 12px',background:'#eef7f2',border:'1px solid #cae3d3',borderRadius:4,fontSize:12,marginBottom:14,lineHeight:1.55}}>{message}</div>:null}

      {step===1?<div>
        <div style={{maxWidth:320,marginBottom:12}}><label style={label}>Document Language<select value={language} onChange={e=>changeLanguage(e.target.value as DocumentLanguage)} style={{...field,marginTop:5}}><option value="auto">Auto Detect</option><option value="gujarati">Gujarati</option><option value="hindi">Hindi / Devanagari</option><option value="english">English</option><option value="other">Other / Any Unicode Language</option></select></label><div style={{fontSize:10,color:'#7b8893',marginTop:4}}>Keep Auto Detect for normal use. Select a language only if extraction needs help.</div></div>
        <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={onDrop} onClick={()=>fileInput.current?.click()} style={{border:`2px dashed ${dragging?'#176d42':'#b9c8d2'}`,background:dragging?'#f0f8f3':'#fbfcfd',padding:'42px 20px',textAlign:'center',cursor:'pointer'}}>
          <input ref={fileInput} type="file" hidden accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onDocx}/>
          <div style={{width:44,height:52,border:'1px solid #9eb1bf',margin:'0 auto 12px',display:'grid',placeItems:'center',fontFamily:'Georgia,serif',fontWeight:700,color:'#0b2d4e',background:'#fff'}}>DOCX</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:18,color:'#0b2d4e',fontWeight:700}}>{docx?docx.name:'Drop the author Word file here'}</div>
          <div style={{fontSize:11,color:'#71808c',marginTop:6}}>{docx?`${(docx.size/1024/1024).toFixed(2)} MB · Click to replace`:'or click to choose a .docx file · maximum 25 MB'}</div>
        </div>
        <div style={{marginTop:14,fontSize:11.5,lineHeight:1.6,color:'#657483',background:'#f7f9fb',borderLeft:'3px solid #b89442',padding:'10px 12px'}}>The original Unicode manuscript is preserved. The system recognizes common section labels across Gujarati, Hindi/Devanagari, English and several Indian-language scripts; for any other language it uses document structure and always allows manual correction.</div>
      </div>:null}

      {step===2?<form onSubmit={e=>{e.preventDefault();if(canPreview)setStep(3)}}>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:13}}>
          <span style={{fontSize:10,fontWeight:800,padding:'5px 8px',background:'#eef3f7',border:'1px solid #d6e0e7',color:'#43576a'}}>Language: {detection?.language||languageNames[language]}</span>
          {detection?.title?<span style={{fontSize:10,padding:'5px 8px',background:'#eef7f2',border:'1px solid #c7e0d0',color:'#176d42'}}>Title detected</span>:null}
          {detection?.authors?<span style={{fontSize:10,padding:'5px 8px',background:'#eef7f2',border:'1px solid #c7e0d0',color:'#176d42'}}>Author detected</span>:null}
          {detection?.affiliation?<span style={{fontSize:10,padding:'5px 8px',background:'#eef7f2',border:'1px solid #c7e0d0',color:'#176d42'}}>Affiliation detected</span>:null}
          {detection?.abstract?<span style={{fontSize:10,padding:'5px 8px',background:'#eef7f2',border:'1px solid #c7e0d0',color:'#176d42'}}>Abstract detected</span>:null}
          {detection?.keywords?<span style={{fontSize:10,padding:'5px 8px',background:'#eef7f2',border:'1px solid #c7e0d0',color:'#176d42'}}>Keywords detected</span>:null}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>
          <label style={{...label,gridColumn:'1/-1'}}>Paper Title<input value={meta.title} onChange={e=>update('title',e.target.value)} required placeholder="Enter the full research paper title" style={{...field,marginTop:5,fontFamily:'Georgia,serif',fontSize:13}}/></label>
          <label style={{...label,gridColumn:'1/-1'}}>Author(s)<input value={meta.authors} onChange={e=>update('authors',e.target.value)} required placeholder="Author name(s)" style={{...field,marginTop:5}}/></label>
          <label style={label}>Affiliation<input value={meta.affiliation} onChange={e=>update('affiliation',e.target.value)} placeholder="Institution / University" style={{...field,marginTop:5}}/></label>
          <label style={label}>Author Email<input value={meta.email} onChange={e=>update('email',e.target.value)} type="email" placeholder="author@example.com" style={{...field,marginTop:5}}/></label>
          <label style={{...label,gridColumn:'1/-1'}}>Abstract / Summary<textarea value={meta.abstract} onChange={e=>update('abstract',e.target.value)} rows={5} placeholder="Abstract / summary in the paper language" style={{...field,marginTop:5,resize:'vertical'}}/></label>
          <label style={{...label,gridColumn:'1/-1'}}>Keywords / Key Terms<input value={meta.keywords} onChange={e=>update('keywords',e.target.value)} placeholder="Comma-separated key terms; any language is supported" style={{...field,marginTop:5}}/></label>
        </div>

        <div style={{marginTop:16,padding:'13px 14px',border:'1px solid #dce4e9',background:'#fafbfc'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><div><strong style={{fontSize:12,color:'#0b2d4e'}}>Publication Details</strong><div style={{fontSize:10.5,color:'#71808c',marginTop:2}}>Only the routine issue details are required here.</div></div><button type="button" onClick={()=>setAdvanced(v=>!v)} style={{border:0,background:'transparent',color:'#176d42',fontSize:11,fontWeight:800,cursor:'pointer'}}>{advanced?'Hide Advanced Details':'Advanced Details'}</button></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginTop:12}}>
            <label style={label}>Month<select value={meta.month} onChange={e=>update('month',e.target.value)} style={{...field,marginTop:5}}>{months.map(m=><option key={m}>{m}</option>)}</select></label>
            <label style={label}>Year<input value={meta.year} onChange={e=>update('year',e.target.value)} type="number" min="1900" max="2100" style={{...field,marginTop:5}}/></label>
            <label style={label}>Volume<input value={meta.volume} onChange={e=>update('volume',e.target.value)} style={{...field,marginTop:5}}/></label>
            <label style={label}>Issue<input value={meta.issue} onChange={e=>update('issue',e.target.value)} style={{...field,marginTop:5}}/></label>
          </div>
          {advanced?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:12,paddingTop:12,borderTop:'1px solid #e4e9ed'}}>
            <label style={label}>Document Language<select value={language} onChange={e=>changeLanguage(e.target.value as DocumentLanguage)} style={{...field,marginTop:5}}><option value="auto">Auto Detect</option><option value="gujarati">Gujarati</option><option value="hindi">Hindi / Devanagari</option><option value="english">English</option><option value="other">Other / Any Unicode Language</option></select></label>
            <label style={label}>Article Type<select value={meta.articleType} onChange={e=>update('articleType',e.target.value)} style={{...field,marginTop:5}}><option>Research Article</option><option>Review Article</option><option>Short Communication</option><option>Case Study</option></select></label>
            <label style={label}>ISSN<input value={meta.issn} onChange={e=>update('issn',e.target.value)} placeholder="Leave blank until officially assigned" style={{...field,marginTop:5}}/></label>
            <label style={label}>Article ID Preview<input value={articleId} readOnly style={{...field,marginTop:5,background:'#f1f4f6'}}/></label>
          </div>:null}
        </div>

        <div style={{display:'flex',justifyContent:'space-between',gap:10,marginTop:16}}><button type="button" onClick={()=>setStep(1)} className="btn btnOutline">Back</button><button type="submit" className="btn btnGreen" disabled={!canPreview}>Generate Preview</button></div>
      </form>:null}

      {step===3?<form onSubmit={saveDraft}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:10,flexWrap:'wrap'}}><div><strong style={{fontSize:12,color:'#0b2d4e'}}>Standard GREEN Preview</strong><div style={{fontSize:10.5,color:'#71808c'}}>Original Unicode manuscript text is preserved. Check title, author details and extracted front matter before saving.</div></div><div style={{fontSize:10.5,color:'#8a6112',background:'#fff8e8',border:'1px solid #ead8a6',padding:'6px 8px'}}>Draft only · final PDF is not generated automatically here</div></div>
        <div style={{background:'#dfe6e2',padding:14,borderRadius:4,overflowX:'auto'}}>
          <article className="green-paper-sheet">
            <header className="green-paper-header">
              <div><img src="/green-logo.png?v=2" alt="GREEN The Research Journal" style={{width:300,maxHeight:84,objectFit:'contain',objectPosition:'left'}}/><div style={{fontWeight:700,fontSize:14,marginTop:4}}>Institute of Research Education and Development (IRED)</div><div style={{fontStyle:'italic',color:'#14733d',fontSize:13}}>Knowledge for a Better Tomorrow</div></div>
              <div style={{textAlign:'right',fontSize:14,lineHeight:1.5,fontWeight:700}}>Volume {meta.volume||'—'} | Issue {meta.issue||'—'} | {meta.year||'—'}<br/>{meta.issn?<>ISSN: {meta.issn} (Online)<br/></>:null}Article ID: {articleId}<div style={{marginTop:6,display:'inline-block',background:'#16733e',color:'#fff',padding:'5px 12px'}}>{meta.articleType}</div></div>
            </header>
            <main className="green-paper-content">
              <section style={{textAlign:'center',padding:'24px 20px 16px'}}><h1 style={{fontSize:25,lineHeight:1.25,margin:'0 0 14px'}}>{meta.title||'Research Paper Title'}</h1><div style={{fontSize:18,fontWeight:700}}>{meta.authors||'Author Name'}</div>{meta.affiliation?<div style={{fontSize:14,marginTop:5}}>{meta.affiliation}</div>:null}{meta.email?<div style={{fontSize:13,marginTop:3}}>Email: {meta.email}</div>:null}</section>
              {(meta.abstract||meta.keywords)?<section style={{background:'#eef6f1',padding:'12px 14px',marginBottom:18}}>{meta.abstract?<><h2 style={{color:'#14733d',fontSize:18,margin:'0 0 6px'}}>Abstract / Summary</h2><p style={{fontSize:13,lineHeight:1.5,textAlign:'justify',margin:'0 0 9px'}}>{meta.abstract}</p></>:null}{meta.keywords?<div style={{fontSize:13}}><strong style={{color:'#14733d'}}>Keywords / Key Terms:</strong> {meta.keywords}</div>:null}</section>:null}
              <div className="green-docx-preview" dangerouslySetInnerHTML={{__html:bodyHtml||'<p style="color:#777;text-align:center;padding:50px 0">No manuscript body available.</p>'}}/>
            </main>
            <footer className="green-paper-footer"><span>© {meta.year||new Date().getFullYear()} IRED. All rights reserved.</span><span className="green-page-number">Page</span><span>www.ired.org</span></footer>
          </article>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',gap:10,marginTop:16,flexWrap:'wrap'}}><button type="button" onClick={()=>setStep(2)} className="btn btnOutline">Edit Details</button><button className="btn btnGreen" type="submit" disabled={busy||!docx}>{busy?'Saving Draft…':'Save GREEN Draft'}</button></div>
      </form>:null}
    </div>
  </section>
}
