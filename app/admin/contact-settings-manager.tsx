'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Settings={
  phone_primary:string
  phone_secondary:string
  email:string
  secondary_email:string
  registration_no:string
  institute_address:string
  journal_office_address:string
}

const defaults:Settings={
  phone_primary:'7383000930',
  phone_secondary:'7203998343',
  email:'contact@iredjournal.org',
  secondary_email:'ired.foundation@gmail.com',
  registration_no:'GUJ/15856/AHMEDABAD',
  institute_address:'IRED, Pooja Bunglows, Kalol Highway-Road, Chandkheda, Ahmedabad-382424, Gujarat, India.',
  journal_office_address:'A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.',
}

export default function ContactSettingsManager(){
  const supabase=createClient()
  const [form,setForm]=useState<Settings>(defaults)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  useEffect(()=>{void (async()=>{
    const [contactResult,siteResult]=await Promise.all([
      supabase.from('contact_settings').select('phone_primary,phone_secondary,email,secondary_email,registration_no').eq('id',true).maybeSingle(),
      supabase.from('site_settings').select('official_address,journal_office_address').eq('id',true).maybeSingle(),
    ])
    if(contactResult.error){setMessage(contactResult.error.message);return}
    if(siteResult.error){setMessage(siteResult.error.message);return}
    const contact=contactResult.data
    const site=siteResult.data
    setForm({
      phone_primary:contact?.phone_primary||defaults.phone_primary,
      phone_secondary:contact?.phone_secondary||'',
      email:contact?.email||defaults.email,
      secondary_email:contact?.secondary_email||defaults.secondary_email,
      registration_no:contact?.registration_no||defaults.registration_no,
      institute_address:site?.official_address||defaults.institute_address,
      journal_office_address:site?.journal_office_address||defaults.journal_office_address,
    })
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
        secondary_email:form.secondary_email.trim().toLowerCase(),
        registration_no:form.registration_no.trim(),
        institute_address:form.institute_address.trim(),
        journal_office_address:form.journal_office_address.trim(),
      }
      if(!cleaned.phone_primary||!cleaned.email||!cleaned.secondary_email||!cleaned.registration_no||!cleaned.institute_address||!cleaned.journal_office_address)throw new Error('Primary phone, both emails, registration number and both addresses are required.')
      if(!/^\S+@\S+\.\S+$/.test(cleaned.email)||!/^\S+@\S+\.\S+$/.test(cleaned.secondary_email))throw new Error('Enter valid email addresses.')
      const now=new Date().toISOString()
      const {error:contactError}=await supabase.from('contact_settings').upsert({
        id:true,
        phone_primary:cleaned.phone_primary,
        phone_secondary:cleaned.phone_secondary,
        email:cleaned.email,
        secondary_email:cleaned.secondary_email,
        registration_no:cleaned.registration_no,
        updated_at:now,
        updated_by:user.id,
      },{onConflict:'id'})
      if(contactError)throw contactError
      const {error:siteError}=await supabase.from('site_settings').update({
        official_address:cleaned.institute_address,
        journal_office_address:cleaned.journal_office_address,
        updated_at:now,
        updated_by:user.id,
      }).eq('id',true)
      if(siteError)throw siteError
      setForm(cleaned)
      setMessage('Contact details and addresses updated successfully.')
    }catch(error){setMessage(error instanceof Error?error.message:'Could not update contact details.')}
    finally{setBusy(false)}
  }

  async function restore(){
    if(!confirm('Restore the default IRED contact details and addresses?'))return
    setBusy(true);setMessage('')
    try{
      const {data:{user}}=await supabase.auth.getUser()
      const now=new Date().toISOString()
      const {error:contactError}=await supabase.from('contact_settings').upsert({
        id:true,
        phone_primary:defaults.phone_primary,
        phone_secondary:defaults.phone_secondary,
        email:defaults.email,
        secondary_email:defaults.secondary_email,
        registration_no:defaults.registration_no,
        updated_at:now,
        updated_by:user?.id||null,
      },{onConflict:'id'})
      if(contactError)throw contactError
      const {error:siteError}=await supabase.from('site_settings').update({
        official_address:defaults.institute_address,
        journal_office_address:defaults.journal_office_address,
        updated_at:now,
        updated_by:user?.id||null,
      }).eq('id',true)
      if(siteError)throw siteError
      setForm(defaults)
      setMessage('Default contact details and addresses restored.')
    }catch(error){setMessage(error instanceof Error?error.message:'Could not restore defaults.')}
    finally{setBusy(false)}
  }

  const label={display:'block',fontSize:11,fontWeight:800,color:'#40566a'} as const
  const field={display:'block',width:'100%',marginTop:5,padding:'10px 11px',border:'1px solid #cbd6de',background:'#fff',fontSize:12} as const
  const area={...field,minHeight:72,resize:'vertical' as const}

  return <section className="contentCard" style={{marginTop:20,borderTop:'4px solid #0b2d4e'}}>
    <div style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#6d7d89'}}>Website Administration</div>
    <h2 style={{margin:'4px 0 5px'}}>Contact Us Details</h2>
    <p style={{margin:'0 0 15px',fontSize:12,color:'#667887',lineHeight:1.6}}>Update the public phone numbers, two contact emails, registration number, institute address and journal office address from one place. GREEN and RED ISSN particulars are managed under Website Settings.</p>
    {message?<div style={{padding:'10px 12px',marginBottom:14,border:'1px solid #cbdde8',background:'#f3f8fb',fontSize:11.5}}>{message}</div>:null}
    <form onSubmit={save} style={{display:'grid',gap:12,maxWidth:900}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <label style={label}>Primary Phone<input value={form.phone_primary} onChange={e=>setForm({...form,phone_primary:e.target.value})} style={field} required/></label>
        <label style={label}>Secondary Phone<input value={form.phone_secondary} onChange={e=>setForm({...form,phone_secondary:e.target.value})} style={field}/></label>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12}}>
        <label style={label}>Primary Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={field} required/></label>
        <label style={label}>Secondary Email<input type="email" value={form.secondary_email} onChange={e=>setForm({...form,secondary_email:e.target.value})} style={field} required/></label>
      </div>
      <label style={label}>Registration Number<input value={form.registration_no} onChange={e=>setForm({...form,registration_no:e.target.value})} style={field} required/></label>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12}}>
        <label style={label}>Institute Address<textarea value={form.institute_address} onChange={e=>setForm({...form,institute_address:e.target.value})} style={area} required/></label>
        <label style={label}>Journal Office Address<textarea value={form.journal_office_address} onChange={e=>setForm({...form,journal_office_address:e.target.value})} style={area} required/></label>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingTop:3}}><button className="btn btnNavy" type="submit" disabled={busy}>{busy?'Saving…':'Save Contact Details'}</button><button className="btn btnOutline" type="button" disabled={busy} onClick={restore}>Restore Default</button></div>
    </form>
  </section>
}
