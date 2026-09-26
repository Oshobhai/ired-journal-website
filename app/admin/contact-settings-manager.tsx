'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Settings={phone_primary:string;phone_secondary:string;email:string;registration_no:string;green_issn:string;red_eissn:string}
const defaults:Settings={phone_primary:'7383000930',phone_secondary:'7203998343',email:'ired.foundation@gmail.com',registration_no:'GUJ/15856/AHMEDABAD',green_issn:'XXXX-XXXX',red_eissn:'XXXX-XXXX'}

export default function ContactSettingsManager(){
  const supabase=createClient()
  const [form,setForm]=useState<Settings>(defaults)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  useEffect(()=>{void (async()=>{
    const {data,error}=await supabase.from('contact_settings').select('phone_primary,phone_secondary,email,registration_no,green_issn,red_eissn').eq('id',true).maybeSingle()
    if(error){setMessage(error.message);return}
    if(data)setForm({phone_primary:data.phone_primary||'',phone_secondary:data.phone_secondary||'',email:data.email||'',registration_no:data.registration_no||'',green_issn:data.green_issn||'XXXX-XXXX',red_eissn:data.red_eissn||'XXXX-XXXX'})
  })()},[])

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage('')
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser()
      if(userError||!user)throw new Error('Admin session expired. Please sign in again.')
      const cleaned={
        phone_primary:form.phone_primary.trim(),
        phone_secondary:form.phone_secondary.trim(),
        email:form.email.trim().toLowerCase(),
        registration_no:form.registration_no.trim(),
        green_issn:form.green_issn.trim()||'XXXX-XXXX',
        red_eissn:form.red_eissn.trim()||'XXXX-XXXX',
      }
      if(!cleaned.phone_primary||!cleaned.email||!cleaned.registration_no)throw new Error('Primary phone, email and registration number are required.')
      if(!/^\S+@\S+\.\S+$/.test(cleaned.email))throw new Error('Enter a valid email address.')
      const {error}=await supabase.from('contact_settings').upsert({id:true,...cleaned,updated_at:new Date().toISOString(),updated_by:user.id},{onConflict:'id'})
      if(error)throw error
      setForm(cleaned)
      setMessage('Contact details and journal ISSN values updated successfully.')
    }catch(error){setMessage(error instanceof Error?error.message:'Could not update contact details.')}
    finally{setBusy(false)}
  }

  async function restore(){
    if(!confirm('Restore the default IRED contact details and ISSN placeholders?'))return
    setBusy(true);setMessage('')
    try{
      const {data:{user}}=await supabase.auth.getUser()
      const {error}=await supabase.from('contact_settings').upsert({id:true,...defaults,updated_at:new Date().toISOString(),updated_by:user?.id||null},{onConflict:'id'})
      if(error)throw error
      setForm(defaults);setMessage('Default contact details and ISSN placeholders restored.')
    }catch(error){setMessage(error instanceof Error?error.message:'Could not restore defaults.')}
    finally{setBusy(false)}
  }

  const label={display:'block',fontSize:11,fontWeight:800,color:'#40566a'} as const
  const field={display:'block',width:'100%',marginTop:5,padding:'10px 11px',border:'1px solid #cbd6de',background:'#fff',fontSize:12} as const

  return <section className="contentCard" style={{marginTop:20,borderTop:'4px solid #0b2d4e'}}>
    <div style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#6d7d89'}}>Website Administration</div>
    <h2 style={{margin:'4px 0 5px'}}>Contact Us Details</h2>
    <p style={{margin:'0 0 15px',fontSize:12,color:'#667887',lineHeight:1.6}}>Update the public phone numbers, editorial email, registration number and journal ISSN values from one place. These details are used across the website and GREEN publication header.</p>
    {message?<div style={{padding:'10px 12px',marginBottom:14,border:'1px solid #cbdde8',background:'#f3f8fb',fontSize:11.5}}>{message}</div>:null}
    <form onSubmit={save} style={{display:'grid',gap:12,maxWidth:760}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <label style={label}>Primary Phone<input value={form.phone_primary} onChange={e=>setForm({...form,phone_primary:e.target.value})} style={field} required/></label>
        <label style={label}>Secondary Phone<input value={form.phone_secondary} onChange={e=>setForm({...form,phone_secondary:e.target.value})} style={field}/></label>
      </div>
      <label style={label}>Editorial Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={field} required/></label>
      <label style={label}>Registration Number<input value={form.registration_no} onChange={e=>setForm({...form,registration_no:e.target.value})} style={field} required/></label>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <label style={label}>GREEN ISSN<input value={form.green_issn} onChange={e=>setForm({...form,green_issn:e.target.value})} style={field} placeholder="XXXX-XXXX"/></label>
        <label style={label}>RED e-ISSN<input value={form.red_eissn} onChange={e=>setForm({...form,red_eissn:e.target.value})} style={field} placeholder="XXXX-XXXX"/></label>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingTop:3}}><button className="btn btnNavy" type="submit" disabled={busy}>{busy?'Saving…':'Save Contact Details'}</button><button className="btn btnOutline" type="button" disabled={busy} onClick={restore}>Restore Default</button></div>
    </form>
  </section>
}
