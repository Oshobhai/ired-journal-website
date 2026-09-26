'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type AssetKey='ired_header'|'ired_footer'|'green_logo'|'red_logo'|'favicon'
type Asset={key:AssetKey;label:string;description:string;fallback:string}

const assets:Asset[]=[
  {key:'ired_header',label:'IRED Main Header Logo',description:'Shown in the public website header and admin portal header.',fallback:'/ired-header-red.svg?v=1'},
  {key:'ired_footer',label:'IRED Footer Logo',description:'Shown in the public website footer.',fallback:'/ired-header-red.svg?v=1'},
  {key:'green_logo',label:'GREEN Journal Logo',description:'Shown on homepage, GREEN journal page and journal information.',fallback:'/green-logo-family.svg?v=1'},
  {key:'red_logo',label:'RED Journal Logo',description:'Shown on homepage, RED journal page and journal information.',fallback:'/red-logo-family.svg?v=1'},
  {key:'favicon',label:'Website Favicon',description:'Browser tab icon. Use a square PNG, JPG or WebP image.',fallback:'/favicon.ico'},
]

function safeName(name:string){return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')}

export default function BrandManager(){
  const supabase=createClient()
  const [paths,setPaths]=useState<Record<string,string|null>>({})
  const [busy,setBusy]=useState<string|null>(null)
  const [message,setMessage]=useState('')

  async function load(){
    const {data,error}=await supabase.from('brand_assets').select('asset_key,storage_path')
    if(error){setMessage(error.message);return}
    const next:Record<string,string|null>={}
    for(const row of data||[])next[row.asset_key]=row.storage_path
    setPaths(next)
  }

  useEffect(()=>{void load()},[])

  function preview(asset:Asset){
    const path=paths[asset.key]
    return path?supabase.storage.from('brand-assets').getPublicUrl(path).data.publicUrl:asset.fallback
  }

  async function upload(asset:Asset,event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0]
    event.target.value=''
    if(!file)return
    setMessage('')
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){setMessage('Please upload PNG, JPG/JPEG or WebP only.');return}
    if(file.size>5*1024*1024){setMessage('Logo file must be 5 MB or smaller.');return}
    setBusy(asset.key)
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')
      const oldPath=paths[asset.key]
      const ext=file.name.split('.').pop()?.toLowerCase()||'png'
      const path=`${asset.key}/${Date.now()}-${crypto.randomUUID()}-${safeName(file.name.replace(/\.[^.]+$/,''))}.${ext}`
      const {error:uploadError}=await supabase.storage.from('brand-assets').upload(path,file,{contentType:file.type,upsert:false})
      if(uploadError)throw uploadError
      const {error:updateError}=await supabase.from('brand_assets').upsert({asset_key:asset.key,storage_path:path,updated_at:new Date().toISOString(),updated_by:user.id},{onConflict:'asset_key'})
      if(updateError){await supabase.storage.from('brand-assets').remove([path]);throw updateError}
      if(oldPath)await supabase.storage.from('brand-assets').remove([oldPath])
      setPaths(p=>({...p,[asset.key]:path}))
      setMessage(`${asset.label} updated successfully.`)
    }catch(error){setMessage(error instanceof Error?error.message:'Could not update the logo.')}
    finally{setBusy(null)}
  }

  async function restore(asset:Asset){
    if(!confirm(`Restore the default ${asset.label}?`))return
    setBusy(asset.key);setMessage('')
    try{
      const oldPath=paths[asset.key]
      const {error}=await supabase.from('brand_assets').update({storage_path:null,updated_at:new Date().toISOString(),updated_by:null}).eq('asset_key',asset.key)
      if(error)throw error
      if(oldPath)await supabase.storage.from('brand-assets').remove([oldPath])
      setPaths(p=>({...p,[asset.key]:null}))
      setMessage(`${asset.label} restored to the website default.`)
    }catch(error){setMessage(error instanceof Error?error.message:'Could not restore the default logo.')}
    finally{setBusy(null)}
  }

  return <section className="contentCard" style={{marginTop:20,borderTop:'4px solid #c8a44a'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'flex-start',flexWrap:'wrap'}}>
      <div><div style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#8a6b21'}}>Brand Administration</div><h2 style={{margin:'4px 0 5px'}}>Website Logos & Brand Assets</h2><p style={{margin:0,fontSize:12,color:'#667887',maxWidth:760,lineHeight:1.6}}>Replace the main IRED, GREEN and RED website logos without editing code. Changes apply through the central brand library, and Restore Default returns the built-in official artwork.</p></div>
      <div style={{fontSize:10.5,padding:'6px 9px',border:'1px solid #d7dfe5',background:'#f8fafb'}}>PNG · JPG · WebP · max 5 MB</div>
    </div>

    {message?<div style={{marginTop:14,padding:'10px 12px',background:'#eef6fb',border:'1px solid #c9dce9',fontSize:11.5}}>{message}</div>:null}

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12,marginTop:16}}>
      {assets.map(asset=><article key={asset.key} style={{border:'1px solid #dce4e9',background:'#fbfcfd',padding:14}}>
        <div style={{height:110,display:'grid',placeItems:'center',background:'#fff',border:'1px solid #e3e8ec',padding:10,marginBottom:11}}><img src={preview(asset)} alt={asset.label} style={{maxWidth:'100%',maxHeight:88,objectFit:'contain'}}/></div>
        <h3 style={{margin:'0 0 4px',fontFamily:'Georgia,serif',fontSize:15,color:'#0b2d4e'}}>{asset.label}</h3>
        <p style={{margin:'0 0 11px',fontSize:10.5,lineHeight:1.5,color:'#667887'}}>{asset.description}</p>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
          <label className="btn btnNavy compact" style={{cursor:busy?'default':'pointer',opacity:busy&&busy!==asset.key?.65:1}}>{busy===asset.key?'Uploading…':'Choose New Logo'}<input hidden disabled={Boolean(busy)} type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" onChange={e=>upload(asset,e)}/></label>
          <button type="button" className="btn btnOutline compact" disabled={Boolean(busy)||!paths[asset.key]} onClick={()=>restore(asset)}>Restore Default</button>
        </div>
        <div style={{fontSize:9.5,color:paths[asset.key]?'#16723b':'#7a8791',marginTop:9,fontWeight:700}}>{paths[asset.key]?'Custom logo active':'Website default active'}</div>
      </article>)}
    </div>
  </section>
}
