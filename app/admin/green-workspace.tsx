'use client'

import {useState} from 'react'
import ManagementConsole from './management-console'
import GreenFinalPdfManager from './green-final-pdf-manager'
import GreenCertificateWorkflow from './green-certificate-workflow'
import GreenEnglishMetadataManager from './green-english-metadata-manager'
import GreenCurrentIssueManager from './green-current-issue-manager'

type StatusFilter='all'|'draft'|'published'|'archived'
type View='current-issue'|'papers'|'certificates'|'english'|'final-pdf'
type Queue='all'|'drafts'|'final-pdf'|'certificate-missing'|'ready'

type Props={initialStatus?:StatusFilter;initialView?:View;initialQueue?:Queue}

export default function GreenWorkspace({initialStatus='all',initialView='current-issue',initialQueue='all'}:Props){
  const [view,setView]=useState<View>(initialView)
  const tabs:Array<[View,string,string]>=[
    ['current-issue','Current Issue','Daily work by Volume / Issue'],
    ['papers','All Papers','Search, edit, publish and archive'],
    ['certificates','Certificates','Generate, check and publish'],
    ['english','English Metadata','ISSN bibliographic support'],
    ['final-pdf','Final PDF Queue','Attach pending final PDFs'],
  ]

  return <div style={{marginTop:20}}>
    <section className="contentCard" style={{padding:10,marginBottom:0}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:7}}>
        {tabs.map(([value,label,desc])=>{
          const active=view===value
          return <button key={value} type="button" onClick={()=>setView(value)} style={{textAlign:'left',padding:'10px 12px',border:active?'1px solid #176f3d':'1px solid #d5dee5',borderTop:active?'4px solid #148444':'4px solid #dfe6eb',background:active?'#f1f8f3':'#fff',cursor:'pointer',minWidth:0}}>
            <strong style={{display:'block',fontFamily:'Georgia,serif',fontSize:13,color:active?'#0c6031':'#12395c'}}>{label}</strong>
            <span style={{display:'block',fontSize:9.5,lineHeight:1.4,color:'#687586',marginTop:3}}>{desc}</span>
          </button>
        })}
      </div>
    </section>

    {view==='current-issue'?<GreenCurrentIssueManager initialQueue={initialQueue}/>:null}
    {view==='papers'?<ManagementConsole initialKind="green" lockedKind="green" initialStatus={initialStatus} showStats={false}/>:null}
    {view==='certificates'?<GreenCertificateWorkflow/>:null}
    {view==='english'?<GreenEnglishMetadataManager/>:null}
    {view==='final-pdf'?<GreenFinalPdfManager/>:null}
  </div>
}
