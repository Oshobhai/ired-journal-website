'use client'

import {FormEvent,useCallback,useEffect,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type Section='editor'|'editorial'|'review'
type Member={id:string;section:Section;name:string;role:string|null;institution:string;location:string|null;sort_order:number;is_visible:boolean;photo_path:string|null}

function sectionLabel(section:Section){
  if(section==='editor')return 'Editor'
  if(section==='editorial')return 'Editorial Board'
  return 'Review Committee'
}

function safeFileName(name:string){return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'photo'}

export default function EditorialBoardManager(){
  const supabase=createClient()
  const [members,setMembers]=useState<Member[]>([])
  const [editing,setEditing]=useState<string|null>(null)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const {data,error}=await supabase.from('editorial_members').select('id,section,name,role,institution,location,sort_order,is_visible,photo_path').order('section').order('sort_order').order('name')
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

  async function addMember(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage('')
    const form=e.currentTarget
    const f=new FormData(form)
    const photo=f.get('photo') as File
    const payload={section:String(f.get('section')||'editor') as Section,name:String(f.get('name')||'').trim(),role:String(f.get('role')||'').trim()||null,institution:String(f.get('institution')||'').trim(),location:String(f.get('location')||'').trim()||null,sort_order:Number(f.get('sort_order'))||0,is_visible:true}
    let createdId='';let uploadedPath=''
    try{
      const {data,error}=await supabase.from('editorial_members').insert(payload).select('id').single()
      if(error)throw error
      createdId=data.id
      if(photo&&photo.size>0){
        uploadedPath=await uploadPhoto(photo,createdId)
        const {error:updateError}=await supabase.from('editorial_members').update({photo_path:uploadedPath}).eq('id',createdId)
        if(updateError)throw updateError
      }
      setMessage('Member added successfully.')
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
    const f=new FormData(e.currentTarget)
    const photo=f.get('photo') as File
    let newPhotoPath=''
    try{
      if(photo&&photo.size>0)newPhotoPath=await uploadPhoto(photo,member.id)
      const payload={section:String(f.get('section')||member.section) as Section,name:String(f.get('name')||'').trim(),role:String(f.get('role')||'').trim()||null,institution:String(f.get('institution')||'').trim(),location:String(f.get('location')||'').trim()||null,sort_order:Number(f.get('sort_order'))||0,is_visible:f.get('is_visible')==='on',...(newPhotoPath?{photo_path:newPhotoPath}:{})}
      const {error}=await supabase.from('editorial_members').update(payload).eq('id',member.id)
      if(error)throw error
      if(newPhotoPath&&member.photo_path)await supabase.storage.from('editorial-photos').remove([member.photo_path])
      setMessage(newPhotoPath?'Member and photo updated successfully.':'Member updated successfully.')
      setEditing(null)
    }catch(error){
      if(newPhotoPath)await supabase.storage.from('editorial-photos').remove([newPhotoPath])
      setMessage(error instanceof Error?error.message:'Could not update member.')
    }
    await load();setBusy(false)
  }

  async function removePhoto(member:Member){
    if(!member.photo_path)return
    setBusy(true);setMessage('')
    const {error}=await supabase.from('editorial_members').update({photo_path:null}).eq('id',member.id)
    if(error)setMessage(error.message)
    else{
      await supabase.storage.from('editorial-photos').remove([member.photo_path])
      setMessage('Photo removed.')
    }
    await load();setBusy(false)
  }

  async function toggleVisibility(member:Member){
    setBusy(true);setMessage('')
    const {error}=await supabase.from('editorial_members').update({is_visible:!member.is_visible}).eq('id',member.id)
    setMessage(error?error.message:(member.is_visible?'Member hidden from public page.':'Member visible on public page.'))
    await load();setBusy(false)
  }

  async function removeMember(member:Member){
    if(!confirm(`Remove “${member.name}” permanently from the Editorial Board database?`))return
    setBusy(true);setMessage('')
    const {error}=await supabase.from('editorial_members').delete().eq('id',member.id)
    if(!error&&member.photo_path)await supabase.storage.from('editorial-photos').remove([member.photo_path])
    setMessage(error?error.message:'Member removed.')
    await load();setBusy(false)
  }

  const photoUrl=(path:string|null)=>path?supabase.storage.from('editorial-photos').getPublicUrl(path).data.publicUrl:null
  const field={padding:'8px 10px',border:'1px solid #cbd5df',borderRadius:5,fontSize:12,background:'#fff'} as const
  const btn={padding:'7px 10px',border:'1px solid #cbd5df',borderRadius:5,background:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'} as const

  return <section id="editorial-board-manager" className="contentCard" style={{marginTop:20}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap',marginBottom:14}}><div><h2 style={{margin:'0 0 5px'}}>Editorial Board Management</h2><p style={{margin:0,fontSize:12,color:'#687586'}}>Add, edit, upload photos, hide/show, reorder or remove Editor, Editorial Board and Review Committee members.</p></div><a className="smallBtn" href="/editorial-board" target="_blank" rel="noreferrer">View Public Page</a></div>
    {message?<div style={{padding:'9px 11px',background:'#eef6fb',border:'1px solid #c9dce9',borderRadius:5,fontSize:12,marginBottom:12}}>{message}</div>:null}

    <form onSubmit={addMember} style={{display:'grid',gridTemplateColumns:'135px 1.05fr .9fr 1.3fr .9fr 80px 170px auto',gap:7,alignItems:'end',padding:'12px',background:'#f7f9fb',border:'1px solid #e0e6ea',marginBottom:16}}>
      <label style={{fontSize:10,fontWeight:700}}>Section<select name="section" defaultValue="editor" style={{...field,width:'100%',marginTop:4}}><option value="editor">Editor</option><option value="editorial">Editorial Board</option><option value="review">Review Committee</option></select></label>
      <label style={{fontSize:10,fontWeight:700}}>Name<input name="name" required style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Designation<input name="role" style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Institution<input name="institution" required style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Location<input name="location" style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Order<input name="sort_order" type="number" defaultValue={10} style={{...field,width:'100%',marginTop:4}}/></label>
      <label style={{fontSize:10,fontWeight:700}}>Photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" style={{...field,width:'100%',marginTop:4,padding:'6px'}}/></label>
      <button type="submit" disabled={busy} style={{...btn,background:'#12395c',borderColor:'#12395c',color:'#fff'}}>Add Member</button>
    </form>

    <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5,minWidth:1000}}><thead><tr style={{background:'#f4f7f9',textAlign:'left'}}><th style={{padding:8}}>Photo</th><th style={{padding:8}}>Section</th><th style={{padding:8}}>Name</th><th style={{padding:8}}>Designation</th><th style={{padding:8}}>Institution</th><th style={{padding:8}}>Location</th><th style={{padding:8}}>Order</th><th style={{padding:8}}>Status</th><th style={{padding:8}}>Actions</th></tr></thead><tbody>{members.map(m=>{const url=photoUrl(m.photo_path);return <tr key={m.id} style={{borderTop:'1px solid #e4e9ed',verticalAlign:'top'}}>
      <td style={{padding:8}}>{url?<img src={url} alt={m.name} style={{width:42,height:42,borderRadius:'50%',objectFit:'cover',border:'1px solid #d4dde4'}}/>:<div style={{width:42,height:42,borderRadius:'50%',display:'grid',placeItems:'center',background:'#eef3f6',border:'1px solid #d4dde4',fontWeight:700,color:'#12395c'}}>{m.name.trim().charAt(0)}</div>}</td><td style={{padding:8}}>{sectionLabel(m.section)}</td><td style={{padding:8,fontWeight:700}}>{m.name}</td><td style={{padding:8}}>{m.role||'—'}</td><td style={{padding:8}}>{m.institution}</td><td style={{padding:8}}>{m.location||'—'}</td><td style={{padding:8}}>{m.sort_order}</td><td style={{padding:8}}><span style={{fontSize:10,fontWeight:700,color:m.is_visible?'#16723b':'#777'}}>{m.is_visible?'Visible':'Hidden'}</span></td><td style={{padding:8}}><div style={{display:'flex',gap:5,flexWrap:'wrap'}}><button type="button" style={btn} onClick={()=>setEditing(editing===m.id?null:m.id)}>Edit</button><button type="button" style={btn} disabled={busy} onClick={()=>toggleVisibility(m)}>{m.is_visible?'Hide':'Show'}</button>{m.photo_path?<button type="button" style={btn} disabled={busy} onClick={()=>removePhoto(m)}>Remove Photo</button>:null}<button type="button" style={{...btn,color:'#9d2525',borderColor:'#efc5c5',background:'#fff5f5'}} disabled={busy} onClick={()=>removeMember(m)}>Delete</button></div></td>
      {editing===m.id?<td colSpan={9} style={{padding:'0 8px 10px'}}><form onSubmit={e=>saveMember(e,m)} style={{display:'grid',gridTemplateColumns:'130px 1fr 1fr 1.4fr 1fr 70px 170px auto auto',gap:7,padding:10,border:'1px solid #dbe3e9',background:'#fbfcfd'}}><select name="section" defaultValue={m.section} style={field}><option value="editor">Editor</option><option value="editorial">Editorial Board</option><option value="review">Review Committee</option></select><input name="name" required defaultValue={m.name} style={field}/><input name="role" defaultValue={m.role||''} style={field}/><input name="institution" required defaultValue={m.institution} style={field}/><input name="location" defaultValue={m.location||''} style={field}/><input name="sort_order" type="number" defaultValue={m.sort_order} style={field}/><input name="photo" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" style={{...field,padding:'6px'}}/><label style={{display:'flex',alignItems:'center',gap:5,fontSize:11}}><input name="is_visible" type="checkbox" defaultChecked={m.is_visible}/> Visible</label><button type="submit" disabled={busy} style={{...btn,background:'#167843',borderColor:'#167843',color:'#fff'}}>Save</button></form></td>:null}
    </tr>})}</tbody></table></div>
  </section>
}
