'use client';

import {useState} from 'react';

export default function ShareButtons({title,authors}:{title:string;authors:string}){
  const [copied,setCopied]=useState(false);

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

  async function nativeShare(){
    const url=currentUrl();
    if(!url)return;
    if(navigator.share){
      try{await navigator.share({title,text:`${title} — ${authors}`,url});}catch{}
    }else{
      await copyLink();
    }
  }

  const button={border:'1px solid #d5dee5',background:'#fff',color:'#27465e',padding:'7px 9px',borderRadius:5,fontSize:10.5,fontWeight:700,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5} as const;

  return <section style={{marginTop:18,paddingTop:15,borderTop:'1px solid #e1e7eb'}}>
    <div style={{fontFamily:'Georgia,serif',fontSize:17,fontWeight:700,color:'#0b2d4e',marginBottom:4}}>Share this Paper</div>
    <p style={{fontSize:10.5,lineHeight:1.55,color:'#6a7986',margin:'0 0 10px'}}>Share the official IRED publication page instead of sending an unofficial copy.</p>
    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
      <button type="button" onClick={copyLink} style={button}>🔗 {copied?'Link Copied':'Copy Link'}</button>
      <button type="button" onClick={()=>openShare('whatsapp')} style={button}>WhatsApp</button>
      <button type="button" onClick={()=>openShare('email')} style={button}>Email</button>
      <button type="button" onClick={()=>openShare('linkedin')} style={button}>LinkedIn</button>
      <button type="button" onClick={nativeShare} style={{...button,borderColor:'#148444',color:'#126f3a'}}>Share</button>
    </div>
  </section>;
}
