'use client'

import {FormEvent,useCallback,useEffect,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type Section='editor'|'editorial'|'review'
type Member={id:string;section:Section;name:string;role:string|null;institution:string;location:string|null;institutional_address:string|null;institutional_email:string|null;profile_url:string|null;sort_order:number;is_visible:boolean;photo_path:string|null;is_issn_faculty_verified:boolean;issn_faculty_verified_at:string|null}

function sectionLabel(section:Section){
  if(section==='editor')return 'Editor'
  if(section==='editorial')return 'Editorial Board'
  return 'Review Committee'
}

function safeFileName(name:string){return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'photo'}
function text(v:FormDataEntryValue|null){return String(v||'').trim()||null}

export default function EditorialBoardManager(){
  const supabase=createClient()
  const [members,setMembers]=useState<Member[]>([])
  const [editing,setEditing]=useState<string|null>(null)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const {data,error}=await supabase.from('editorial_members').select('id,section,name,role,institution,location,institutional_address,institutional_email,profile_url,sort_order,is_visible,photo_path,is_issn_faculty_verified,issn_faculty_verified_at').order('section').order('sort_order').order('name')
    if(error){setMessage(error.message);return}
    setMembers((data||[]) as Member[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  async function uploadPhoto(file:File,memberId:string){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Photo must be JPG, PNG or WebP.')
    if(file.size>5*1024*1024)throw new Error('Photo must be 5 MB or smaller.')
    const path=`${memberId}/${crypto.randomUUID()}-${safeFileName(file.name)}`
    const {error}=await supabase.storage.from('editorial-photos').upload(path,file,{contentType:file.type,upsert:false})
    if(error)throw error
    return path
  }

  function payloadFrom(f:FormData,member?:Member){
    const facultyVerified=f.get('is_issn_faculty_verified')==='on'
    return {
      section:String(f.get('section')||member?.section||'editor') as Section,
      name:String(f.get('name')||'').trim(),
      role:text(f.get('role')),
      institution:String(f.get('institution')||'').trim(),
      location:text(f.get('location')),
      institutional_address:text(f.get('institutional_address')),
      institutional_email:text(f.get('institutional_email')),
      profile_url:text(f.get('profile_url')),
      sort_order:Number(f.get('sort_order'))||0,
      is_visible:member?f.get('is_visible')==='on':true,
      is_issn_faculty_verified:facultyVerified,
      issn_faculty_verified_at:facultyVerified?(member?.is_issn_faculty_verified&&member.issn_faculty_verified_at?member.issn_faculty_verified_at:new Date().toISOString()):null,
    }
  }

  async function addMember(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage('')
    const form=e.currentTarget;const f=new FormData(form);const photo=f.get('photo') as File
    const payload=payloadFrom(f)
    let createdId='';let uploadedPath=''
    try{
      const {data,error}=await supabase.from('editorial_members').insert(payload).select('id').single()
      if(error)throw error
      createdId=data.id
      if(photo&&photo.size>0){uploadedPath=await uploadPhoto(photo,createdId);const {error:updateError}=await supabase.from('editorial_members').update({photo_path:uploadedPath}).eq('id',createdId);if(updateError)throw updateError}
      setMessage('Member added successfully. Add institutional email, full address and official profile URL, then verify senior/appropriate faculty status for ISSN readiness.')
      form.reset()
    }catch(error){
      if(uploadedPath)await supabase.storage.from('editorial-photos').remove([uploadedPath])
      if(createdId)await supabase.from('editorial_members').delete().eq('id',createdId)
      setMessage(error instanceof Error?error.message:'Could not add member.')
    }
    await load();setBusy(false)
  }

  async function saveMember(e:FormEvent<HTMLFormElement>,member:Member){
    e.preventDefault();setBusy(true);setMessage('')
    const f=new FormData(e.currentTarget);const photo=f.get('photo') as File
    let newPhotoPath=''
    try{
      if(photo&&photo.size>0)newPhotoPath=await uploadPhoto(photo,member.id)
      const payload={...payloadFrom(f,member),...(newPhotoPath?{photo_path:newPhotoPath}:{})}
      const {error}=await supabase.from('editorial_members').update(payload).eq('id',member.id)
      if(error)throw error
      if(newPhotoPath&&member.photo_path)await supabase.storage.from('editorial-photos').remove([member.photo_path])
      setMessage(newPhotoPath?'Member and photo updated successfully.':'Member updated successfully.')
      setEditing(null)
    }catch(error){if(newPhotoPath)await supabase.storage.from('editorial-photos').remove([newPhotoPath]);setMessage(error instanceof Error?error.message:'Could not update member.')}
    await load();setBusy(false)
  }

  async function removePhoto(member:Member){
    if(!member.photo_path)return
    setBusy(true);setMessage('')
    const {error}=await supabase.from('editorial_members').update({photo_path:null}).eq('id',member.id)
    if(error)setMessage(error.message);else{await supabase.storage.from('editorial-photos').remove([member.photo_path]);setMessage('Photo removed.')}
    await load();setBusy(false)
  }

  async function toggleVisibility(member:Member){setBusy(true);setMessage('');const {error}=await supabase.from('editorial_members').update({is_visible:!member.is_visible}).eq('id',member.id);setMessage(error?error.message:(member.is_visible?'Member hidden from public page.':'Member visible on public page.'));await load();setBusy(false)}
  async function removeMember(member:Member){if(!confirm(`Remove “${member.name}” permanently from the Editorial Board database?`))return;setBusy(true);setMessage('');const {error}=await supabase.from('editorial_members').delete().eq('id',member.id);if(!error&&member.photo_path)await supabase.storage.from('editorial-photos').remove([member.photo_path]);setMessage(error?error.message:'Member removed.');await load();setBusy(false)}

  const photoUrl=(path:string|null)=>path?supabase.storage.from('editorial-photos').getPublicUrl(path).data.publicUrl:null
  const field={padding:'8px 10px',border:'1px solid #cbd5df',borderRadius:5,fontSize:12,background:'#fff'} as const
  const btn={padding:'7px 10px',border:'1px solid #cbd5df',borderRadius:5,background:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'} as const

  return <section id="editorial-board-manager" className="contentCard" style={{marginTop:20}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap',marginBottom:14}}><div><h2 style={{margin:'0 0 5px'}}>Editorial Board Management</h2><p style={{margin:0,fontSize:12,color:'#687586'}}>For ISSN India, keep each member’s full name, designation, institution, complete institutional address, institutional email and official institutional profile URL. Mark “ISSN Faculty Verified” only after confirming the member is senior/appropriate faculty from the official institutional profile.</p></div><a className="smallBtn" href="/editorial-board" target="_blank" rel="noreferrer">View Public Page</a></div>
    {message?<div style={{padding:'9px 11px',background:'#eef6fb',border:'1px solid #c9dce9',borderRadius:5,fontSize:12,marginBottom:12}}>{message}</div>:null}

    <form onSubmit={addMember} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8,alignItems:'end',padding:'12px',background:'#f7f9fb',border:'1px solid #e0e6ea',marginBottom:16}}>
      <label style={{fontSize:10,fontWeight:700}}>Section<select name="section" defaultValue="editor" style={{...field,width:'100%',marginTop:4}}><option value="editor">Editor</option><option value="editorial">Editorial Board</option><option value="review">Review Committee</option></select></label>
      <label style={{fontSize:10,fontWeight:700}}>Full Name<input name="name" required style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Designation<input name="role" style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Institution<input name="institution" required style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Institutional Email<input name="institutional_email" type="email" placeholder="name@university.ac.in" style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Institutional Profile URL<input name="profile_url" type="url" placeholder="https://institution/..." style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700,gridColumn:'span 2'}}>Complete Institutional Address<input name="institutional_address" style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>City / Location<input name="location" style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Order<input name="sort_order" type="number" defaultValue={10} style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" style={{...field,width:'100%',marginTop:4,padding:'6px'}}/></label>
      <label style={{display:'flex',alignItems:'center',gap:6,fontSize:11,fontWeight:700,minHeight:36}}><input name="is_issn_faculty_verified" type="checkbox"/> ISSN Faculty Verified</label>
      <button type="submit" disabled={busy} style={{...btn,background:'#12395c',borderColor:'#12395c',color:'#fff',height:36}}>Add Member</button>
    </form>

    <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5,minWidth:1220}}><thead><tr style={{background:'#f4f7f9',textAlign:'left'}}><th style={{padding:8}}>Photo</th><th style={{padding:8}}>Section</th><th style={{padding:8}}>Name</th><th style={{padding:8}}>Designation / Institution</th><th style={{padding:8}}>ISSN Verification Details</th><th style={{padding:8}}>ISSN Faculty</th><th style={{padding:8}}>Status</th><th style={{padding:8}}>Actions</th></tr></thead><tbody>{members.map(m=>{const url=photoUrl(m.photo_path);const complete=Boolean(m.role&&m.institutional_address&&m.institutional_email&&m.profile_url);const issnReady=complete&&m.is_issn_faculty_verified;return <tr key={m.id} style={{borderTop:'1px solid #e4e9ed',verticalAlign:'top'}}>
      <td style={{padding:8}}>{url?<img src={url} alt={m.name} style={{width:42,height:42,borderRadius:'50%',objectFit:'cover',border:'1px solid #d4dde4'}}/>:<div style={{width:42,height:42,borderRadius:'50%',display:'grid',placeItems:'center',background:'#eef3f6',border:'1px solid #d4dde4',fontWeight:700,color:'#12395c'}}>{m.name.trim().charAt(0)}</div>}</td>
      <td style={{padding:8}}>{sectionLabel(m.section)}</td><td style={{padding:8,fontWeight:700}}>{m.name}</td><td style={{padding:8}}>{m.role||'—'}<div style={{color:'#687586',marginTop:3}}>{m.institution}{m.location?` · ${m.location}`:''}</div></td>
      <td style={{padding:8}}><div style={{fontWeight:700,color:issnReady?'#16723b':complete?'#9a6614':'#9a6614'}}>{issnReady?'ISSN Ready':complete?'Details complete · faculty verification pending':'Needs details'}</div><div style={{fontSize:10,color:'#687586',marginTop:3}}>{m.institutional_email||'No institutional email'}{m.profile_url?' · Profile linked':''}</div></td>
      <td style={{padding:8}}><span style={{display:'inline-block',fontSize:10,fontWeight:800,padding:'3px 7px',borderRadius:12,background:m.is_issn_faculty_verified?'#e8f6ed':'#fff5dc',color:m.is_issn_faculty_verified?'#16723b':'#8a6112'}}>{m.is_issn_faculty_verified?'Verified':'Not verified'}</span>{m.is_issn_faculty_verified&&m.issn_faculty_verified_at?<div style={{fontSize:9.5,color:'#71808d',marginTop:4}}>{new Date(m.issn_faculty_verified_at).toLocaleDateString()}</div>:null}</td>
      <td style={{padding:8}}><span style={{fontSize:10,fontWeight:700,color:m.is_visible?'#16723b':'#777'}}>{m.is_visible?'Visible':'Hidden'}</span></td>
      <td style={{padding:8}}><div style={{display:'flex',gap:5,flexWrap:'wrap'}}><button type="button" style={btn} onClick={()=>setEditing(editing===m.id?null:m.id)}>Edit</button><button type="button" style={btn} disabled={busy} onClick={()=>toggleVisibility(m)}>{m.is_visible?'Hide':'Show'}</button>{m.photo_path?<button type="button" style={btn} disabled={busy} onClick={()=>removePhoto(m)}>Remove Photo</button>:null}<button type="button" style={{...btn,color:'#9d2525',borderColor:'#efc5c5',background:'#fff5f5'}} disabled={busy} onClick={()=>removeMember(m)}>Delete</button></div></td>
      {editing===m.id?<td colSpan={8} style={{padding:'0 8px 12px'}}><form onSubmit={e=>saveMember(e,m)} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8,padding:12,border:'1px solid #dbe3e9',background:'#fbfcfd'}}><select name="section" defaultValue={m.section} style={field}><option value="editor">Editor</option><option value="editorial">Editorial Board</option><option value="review">Review Committee</option></select><input name="name" required defaultValue={m.name} placeholder="Full name" style={field}/><input name="role" defaultValue={m.role||''} placeholder="Designation" style={field}/><input name="institution" required defaultValue={m.institution} placeholder="Institution" style={field}/><input name="institutional_email" type="email" defaultValue={m.institutional_email||''} placeholder="Institutional email" style={field}/><input name="profile_url" type="url" defaultValue={m.profile_url||''} placeholder="Official institutional profile URL" style={field}/><input name="institutional_address" defaultValue={m.institutional_address||''} placeholder="Complete institutional address" style={{...field,gridColumn:'span 2'}}/><input name="location" defaultValue={m.location||''} placeholder="City / location" style={field}/><input name="sort_order" type="number" defaultValue={m.sort_order} style={field}/><input name="photo" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" style={{...field,padding:'6px'}}/><label style={{display:'flex',alignItems:'center',gap:5,fontSize:11}}><input name="is_visible" type="checkbox" defaultChecked={m.is_visible}/> Visible</label><label style={{display:'flex',alignItems:'center',gap:5,fontSize:11,fontWeight:700,color:'#5d4a1c'}}><input name="is_issn_faculty_verified" type="checkbox" defaultChecked={m.is_issn_faculty_verified}/> ISSN Faculty Verified</label><button type="submit" disabled={busy} style={{...btn,background:'#167843',borderColor:'#167843',color:'#fff'}}>Save</button></form></td>:null}
    </tr>})}</tbody></table></div>
  </section>
}
