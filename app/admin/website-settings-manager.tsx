'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Settings={
  institution_name:string;institution_short_name:string;motto:string;publisher_name:string;official_address:string;journal_office_address:string;
  green_title:string;green_description:string;green_scope:string;green_editor_in_chief:string;green_frequency:string;green_language:string;green_format:string;green_subject:string;
  red_title:string;red_description:string;red_scope:string;red_frequency:string;red_language:string;red_format:string;red_subject:string;red_starting_year:number;
  first_volume_year:number;article_id_prefix:string;doi_prefix:string;submission_status:string;
  homepage_kicker:string;homepage_title:string;homepage_highlight:string;homepage_description:string;homepage_notice:string;
  seo_title:string;seo_description:string;seo_keywords:string;
}

type IssnSettings={green_issn:string;red_eissn:string}

const defaults:Settings={
  institution_name:'Institute of Research Education and Development',institution_short_name:'IRED',motto:'Knowledge for a Better Tomorrow',publisher_name:'Institute of Research Education and Development (IRED)',official_address:'IRED, Pooja Bunglows, Kalol Highway-Road, Chandkheda, Ahmedabad-382424, Gujarat, India.',journal_office_address:'A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.',
  green_title:'GREEN: The Research e-Journal',green_description:'International, peer-reviewed, open-access multidisciplinary research e-Journal for original research papers and scholarly articles.',green_scope:'Accounting, Archaeology, Biology, Business, Chemistry, Commerce, Economics, Education, Law, Linguistics, Management, Physics, Political Science, Social Work, Arts, Humanities, Sciences, Social Sciences and related academic disciplines.',green_editor_in_chief:'Dr. Bhavika Kadikar — Librarian and Assistant Professor, Surendranagar University, Wadhwan',green_frequency:'Monthly',green_language:'English, Gujarati',green_format:'Online',green_subject:'Multidisciplinary',
  red_title:'RED: The Research Journal',red_description:'Print research journals to disseminate scholarly and research-based knowledge across multiple academic disciplines.',red_scope:'Multidisciplinary research across Arts, Humanities, Sciences, Social Sciences, Commerce, Education, Management, Law and other academic disciplines.',red_frequency:'Monthly',red_language:'English, Gujarati',red_format:'Print',red_subject:'Multidisciplinary',red_starting_year:2026,
  first_volume_year:2026,article_id_prefix:'GREEN',doi_prefix:'',submission_status:'Open for Submission',
  homepage_kicker:'Research · Education · Development',homepage_title:'Research Knowledge',homepage_highlight:'for a Better Tomorrow',homepage_description:'A platform for researchers, academicians, and students to share knowledge and create a positive impact.',homepage_notice:'',
  seo_title:'IRED | GREEN: The Research e-Journal & RED: The Research Journal',seo_description:'Official publication website of the Institute of Research Education and Development (IRED), publisher of GREEN: The Research e-Journal and RED: The Research Journal.',seo_keywords:'IRED, Institute of Research Education and Development, GREEN: The Research e-Journal, RED: The Research Journal, peer-reviewed journal, open-access journal, research journal, academic publications'
}

const issnDefaults:IssnSettings={green_issn:'Pending',red_eissn:'Pending'}
const sectionStyle={border:'1px solid #d9e2e8',background:'#fff',padding:16} as const
const label={display:'block',fontSize:11,fontWeight:800,color:'#40566a'} as const
const field={display:'block',width:'100%',marginTop:5,padding:'10px 11px',border:'1px solid #cbd6de',background:'#fff',fontSize:12} as const
const area={...field,minHeight:86,resize:'vertical' as const}

export default function WebsiteSettingsManager(){
  const supabase=createClient()
  const [form,setForm]=useState<Settings>(defaults)
  const [issn,setIssn]=useState<IssnSettings>(issnDefaults)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  useEffect(()=>{void(async()=>{
    const [siteResult,contactResult]=await Promise.all([
      supabase.from('site_settings').select('*').eq('id',true).maybeSingle(),
      supabase.from('contact_settings').select('green_issn,red_eissn').eq('id',true).maybeSingle(),
    ])
    if(siteResult.error){setMessage(siteResult.error.message);return}
    if(contactResult.error){setMessage(contactResult.error.message);return}
    if(siteResult.data)setForm({...defaults,...siteResult.data})
    if(contactResult.data)setIssn({green_issn:contactResult.data.green_issn||'Pending',red_eissn:contactResult.data.red_eissn||'Pending'})
  })()},[])

  function set<K extends keyof Settings>(key:K,value:Settings[K]){setForm(v=>({...v,[key]:value}))}

  async function save(e:FormEvent){
    e.preventDefault();setBusy(true);setMessage('')
    try{
      const {data:{user}}=await supabase.auth.getUser()
      if(!user)throw new Error('Admin session expired. Please sign in again.')
      const cleaned:Settings={
        ...form,
        institution_name:form.institution_name.trim(),institution_short_name:form.institution_short_name.trim(),motto:form.motto.trim(),publisher_name:form.publisher_name.trim(),official_address:form.official_address.trim(),journal_office_address:form.journal_office_address.trim(),
        green_title:form.green_title.trim(),green_description:form.green_description.trim(),green_scope:form.green_scope.trim(),green_editor_in_chief:form.green_editor_in_chief.trim(),green_frequency:form.green_frequency.trim(),green_language:form.green_language.trim(),green_format:form.green_format.trim(),green_subject:form.green_subject.trim(),
        red_title:form.red_title.trim(),red_description:form.red_description.trim(),red_scope:form.red_scope.trim(),red_frequency:form.red_frequency.trim(),red_language:form.red_language.trim(),red_format:form.red_format.trim(),red_subject:form.red_subject.trim(),
        article_id_prefix:form.article_id_prefix.trim().toUpperCase(),doi_prefix:form.doi_prefix.trim(),submission_status:form.submission_status.trim(),homepage_kicker:form.homepage_kicker.trim(),homepage_title:form.homepage_title.trim(),homepage_highlight:form.homepage_highlight.trim(),homepage_description:form.homepage_description.trim(),homepage_notice:form.homepage_notice.trim(),seo_title:form.seo_title.trim(),seo_description:form.seo_description.trim(),seo_keywords:form.seo_keywords.trim(),
      }
      const cleanedIssn={green_issn:issn.green_issn.trim()||'Pending',red_eissn:issn.red_eissn.trim()||'Pending'}
      if(!cleaned.institution_name||!cleaned.publisher_name||!cleaned.green_title||!cleaned.red_title||!cleaned.official_address||!cleaned.journal_office_address)throw new Error('Institution, publisher, both office addresses and journal titles are required.')
      if(!cleaned.green_frequency||!cleaned.green_language||!cleaned.green_format||!cleaned.green_subject||!cleaned.red_frequency||!cleaned.red_language||!cleaned.red_format||!cleaned.red_subject)throw new Error('Complete all GREEN and RED journal particulars.')
      if(cleaned.first_volume_year<1900||cleaned.first_volume_year>2100||cleaned.red_starting_year<1900||cleaned.red_starting_year>2100)throw new Error('Enter valid GREEN and RED starting years.')
      const now=new Date().toISOString()
      const {error:siteError}=await supabase.from('site_settings').upsert({id:true,...cleaned,updated_at:now,updated_by:user.id},{onConflict:'id'})
      if(siteError)throw siteError
      const {error:contactError}=await supabase.from('contact_settings').upsert({id:true,...cleanedIssn,updated_at:now,updated_by:user.id},{onConflict:'id'})
      if(contactError)throw contactError
      setForm(cleaned);setIssn(cleanedIssn)
      setMessage('GREEN and RED journal particulars, ISSN status and website settings updated successfully.')
    }catch(error){setMessage(error instanceof Error?error.message:'Could not save website settings.')}
    finally{setBusy(false)}
  }

  async function restore(){
    if(!confirm('Restore default website and journal particulars?'))return
    setBusy(true);setMessage('')
    try{
      const {data:{user}}=await supabase.auth.getUser();const now=new Date().toISOString()
      const {error:siteError}=await supabase.from('site_settings').upsert({id:true,...defaults,updated_at:now,updated_by:user?.id||null},{onConflict:'id'})
      if(siteError)throw siteError
      const {error:contactError}=await supabase.from('contact_settings').upsert({id:true,...issnDefaults,updated_at:now,updated_by:user?.id||null},{onConflict:'id'})
      if(contactError)throw contactError
      setForm(defaults);setIssn(issnDefaults);setMessage('Default website and journal particulars restored.')
    }catch(error){setMessage(error instanceof Error?error.message:'Could not restore defaults.')}
    finally{setBusy(false)}
  }

  return <form onSubmit={save} style={{display:'grid',gap:14,marginTop:20}}>
    {message?<div style={{padding:'10px 12px',border:'1px solid #cbdde8',background:'#f3f8fb',fontSize:11.5}}>{message}</div>:null}

    <section style={sectionStyle}><h2 style={{margin:'0 0 12px'}}>Institution</h2><div style={{display:'grid',gridTemplateColumns:'1fr 180px',gap:12}}><label style={label}>Institution Name<input style={field} value={form.institution_name} onChange={e=>set('institution_name',e.target.value)}/></label><label style={label}>Short Name<input style={field} value={form.institution_short_name} onChange={e=>set('institution_short_name',e.target.value)}/></label></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}><label style={label}>Motto<input style={field} value={form.motto} onChange={e=>set('motto',e.target.value)}/></label><label style={label}>Publisher Name<input style={field} value={form.publisher_name} onChange={e=>set('publisher_name',e.target.value)}/></label></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}><label style={label}>Institute Address<textarea style={area} value={form.official_address} onChange={e=>set('official_address',e.target.value)}/></label><label style={label}>Journal / Editorial Office Address<textarea style={area} value={form.journal_office_address} onChange={e=>set('journal_office_address',e.target.value)}/></label></div><p style={{fontSize:10.5,color:'#6b7884',margin:'8px 0 0'}}>Use the Institute Address as the publisher address and the Journal / Editorial Office as the journal correspondence address.</p></section>

    <section style={{...sectionStyle,borderTop:'4px solid #148444'}}><h2 style={{margin:'0 0 6px',color:'#126f3a'}}>GREEN Journal — ISSN Particulars</h2><p style={{fontSize:11,color:'#687586',margin:'0 0 12px'}}>These values appear on the Home page and Journal Information page. Keep the official title exactly identical across the website, article PDFs and ISSN application.</p><label style={label}>GREEN Official Title<input style={field} value={form.green_title} onChange={e=>set('green_title',e.target.value)}/></label><label style={{...label,marginTop:10}}>GREEN Description<textarea style={area} value={form.green_description} onChange={e=>set('green_description',e.target.value)}/></label><label style={{...label,marginTop:10}}>Aims & Scope<textarea style={area} value={form.green_scope} onChange={e=>set('green_scope',e.target.value)}/></label><label style={{...label,marginTop:10}}>GREEN Editor in Chief<input style={field} value={form.green_editor_in_chief} onChange={e=>set('green_editor_in_chief',e.target.value)}/></label><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginTop:12}}><label style={label}>Frequency<input style={field} value={form.green_frequency} onChange={e=>set('green_frequency',e.target.value)}/></label><label style={label}>Language(s)<input style={field} value={form.green_language} onChange={e=>set('green_language',e.target.value)}/></label><label style={label}>Starting Year<input type="number" style={field} value={form.first_volume_year} onChange={e=>set('first_volume_year',Number(e.target.value))}/></label><label style={label}>Publication Format<input style={field} value={form.green_format} onChange={e=>set('green_format',e.target.value)}/></label><label style={label}>Subject<input style={field} value={form.green_subject} onChange={e=>set('green_subject',e.target.value)}/></label><label style={label}>ISSN / e-ISSN or Status<input style={field} placeholder="Pending" value={issn.green_issn} onChange={e=>setIssn(v=>({...v,green_issn:e.target.value}))}/></label></div></section>

    <section style={{...sectionStyle,borderTop:'4px solid #bd2025'}}><h2 style={{margin:'0 0 6px',color:'#a61d22'}}>RED Journal — ISSN Particulars</h2><p style={{fontSize:11,color:'#687586',margin:'0 0 12px'}}>These values appear on the Home page and Journal Information page. Until ISSN is assigned, keep the ISSN field as Pending.</p><label style={label}>RED Official Title<input style={field} value={form.red_title} onChange={e=>set('red_title',e.target.value)}/></label><label style={{...label,marginTop:10}}>RED Description<textarea style={area} value={form.red_description} onChange={e=>set('red_description',e.target.value)}/></label><label style={{...label,marginTop:10}}>Aims & Scope<textarea style={area} value={form.red_scope} onChange={e=>set('red_scope',e.target.value)}/></label><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginTop:12}}><label style={label}>Frequency<input style={field} value={form.red_frequency} onChange={e=>set('red_frequency',e.target.value)}/></label><label style={label}>Language(s)<input style={field} value={form.red_language} onChange={e=>set('red_language',e.target.value)}/></label><label style={label}>Starting Year<input type="number" style={field} value={form.red_starting_year} onChange={e=>set('red_starting_year',Number(e.target.value))}/></label><label style={label}>Publication Format<input style={field} value={form.red_format} onChange={e=>set('red_format',e.target.value)}/></label><label style={label}>Subject<input style={field} value={form.red_subject} onChange={e=>set('red_subject',e.target.value)}/></label><label style={label}>ISSN or Status<input style={field} placeholder="Pending" value={issn.red_eissn} onChange={e=>setIssn(v=>({...v,red_eissn:e.target.value}))}/></label></div></section>

    <section style={sectionStyle}><h2 style={{margin:'0 0 12px'}}>Publication Settings</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}><label style={label}>Article ID Prefix<input style={field} value={form.article_id_prefix} onChange={e=>set('article_id_prefix',e.target.value)}/></label><label style={label}>DOI Prefix<input style={field} placeholder="Optional" value={form.doi_prefix} onChange={e=>set('doi_prefix',e.target.value)}/></label><label style={label}>Submission Status<input style={field} value={form.submission_status} onChange={e=>set('submission_status',e.target.value)}/></label></div></section>
    <section style={sectionStyle}><h2 style={{margin:'0 0 12px'}}>Homepage</h2><label style={label}>Kicker<input style={field} value={form.homepage_kicker} onChange={e=>set('homepage_kicker',e.target.value)}/></label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:10}}><label style={label}>Main Title<input style={field} value={form.homepage_title} onChange={e=>set('homepage_title',e.target.value)}/></label><label style={label}>Highlighted Line<input style={field} value={form.homepage_highlight} onChange={e=>set('homepage_highlight',e.target.value)}/></label></div><label style={{...label,marginTop:10}}>Homepage Description<textarea style={area} value={form.homepage_description} onChange={e=>set('homepage_description',e.target.value)}/></label><label style={{...label,marginTop:10}}>Announcement / Notice<textarea style={area} placeholder="Leave blank to hide notice" value={form.homepage_notice} onChange={e=>set('homepage_notice',e.target.value)}/></label></section>
    <section style={sectionStyle}><h2 style={{margin:'0 0 12px'}}>SEO & Search Metadata</h2><label style={label}>Website SEO Title<input style={field} value={form.seo_title} onChange={e=>set('seo_title',e.target.value)}/></label><label style={{...label,marginTop:10}}>SEO Description<textarea style={area} value={form.seo_description} onChange={e=>set('seo_description',e.target.value)}/></label><label style={{...label,marginTop:10}}>SEO Keywords<textarea style={area} value={form.seo_keywords} onChange={e=>set('seo_keywords',e.target.value)}/></label></section>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn btnNavy" disabled={busy} type="submit">{busy?'Saving…':'Save Website Settings'}</button><button className="btn btnOutline" disabled={busy} type="button" onClick={restore}>Restore Defaults</button></div>
  </form>
}
