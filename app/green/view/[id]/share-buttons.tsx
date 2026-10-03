'use client';

import {useState} from 'react';

export default function ShareButtons({title,authors}:{title:string;authors:string}){
  const [copied,setCopied]=useState(false);
  const [researchGateCopied,setResearchGateCopied]=useState(false);

  function currentUrl(){
    return typeof window==='undefined'?'':window.location.href;
  }

  async function copyLink(){
    const url=currentUrl();
    if(!url)return;
    try{
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(()=>setCopied(false),1800);
    }catch{
      window.prompt('Copy this paper link:',url);
    }
  }

  function openShare(kind:'whatsapp'|'linkedin'|'email'){
    const url=currentUrl();
    if(!url)return;
    const text=`${title} — ${authors}`;
    if(kind==='whatsapp'){
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,'_blank','noopener,noreferrer');
      return;
    }
    if(kind==='linkedin'){
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,'_blank','noopener,noreferrer');
      return;
    }
    window.location.href=`mailto:?subject=${encodeURIComponent(`Research Paper: ${title}`)}&body=${encodeURIComponent(`${text}\n\nView the published paper here:\n${url}`)}`;
  }

  async function openResearchGate(){
    const url=currentUrl();
    if(!url)return;
    window.open('https://www.researchgate.net/','_blank','noopener,noreferrer');
    try{
      await navigator.clipboard.writeText(url);
      setResearchGateCopied(true);
      window.setTimeout(()=>setResearchGateCopied(false),2200);
    }catch{
      window.prompt('Copy this official IRED paper link for ResearchGate:',url);
    }
  }

  async function nativeShare(){
    const url=currentUrl();
    if(!url)return;
    if(navigator.share){
      try{await navigator.share({title,text:`${title} — ${authors}`,url});}catch{}
    }else{
      await copyLink();
    }
  }

  const button={border:'1px solid #d7e0e6',background:'#fff',color:'#27465e',padding:'8px 11px',borderRadius:6,fontSize:10.5,fontWeight:700,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:34} as const;

  return <section>
    <div style={{fontSize:9.5,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#73818c',marginBottom:4}}>Share & Reference</div>
    <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:700,color:'#0b2d4e',marginBottom:4}}>Share this Paper</div>
    <p style={{fontSize:11,lineHeight:1.6,color:'#667684',margin:'0 0 12px'}}>Use the official IRED article page when sharing or referencing this publication.</p>
    <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
      <button type="button" onClick={copyLink} style={button}>{copied?'Link Copied':'Copy Link'}</button>
      <button type="button" onClick={()=>openShare('whatsapp')} style={button}>WhatsApp</button>
      <button type="button" onClick={()=>openShare('email')} style={button}>Email</button>
      <button type="button" onClick={()=>openShare('linkedin')} style={button}>LinkedIn</button>
      <button type="button" onClick={openResearchGate} title="Copy the official IRED link and open ResearchGate" style={{...button,borderColor:'#b8d1e5',color:'#276796'}}>{researchGateCopied?'ResearchGate · Link Copied':'ResearchGate'}</button>
      <button type="button" onClick={nativeShare} style={{...button,borderColor:'#abd4bb',color:'#126f3a',background:'#f5fbf7'}}>Share</button>
    </div>
  </section>;
}
