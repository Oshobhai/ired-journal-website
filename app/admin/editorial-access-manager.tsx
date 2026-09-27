'use client'

import {FormEvent,useCallback,useEffect,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type StaffRole='admin'|'editorial_board_manager'
type AccessRow={email:string;role:StaffRole;access_status:'active'|'pending';created_at:string}

const roleLabel:Record<StaffRole,string>={
  admin:'Full Administrator',
  editorial_board_manager:'Editorial Board Manager',
}

export default function EditorialAccessManager(){
  const supabase=createClient()
  const [rows,setRows]=useState<AccessRow[]>([])
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const {data,error}=await supabase.rpc('list_staff_access')
    if(error){setMessage(error.message);return}
    setRows((data||[]) as AccessRow[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  async function grant(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage('')
    const f=new FormData(e.currentTarget)
    const email=String(f.get('email')||'').trim().toLowerCase()
    const role=String(f.get('role')||'editorial_board_manager') as StaffRole
    const {data,error}=await supabase.rpc('grant_staff_access',{target_email:email,target_role:role})
    if(error)setMessage(error.message)
    else{
      setMessage(data==='active'?`${roleLabel[role]} access is active. This user can now sign in.`:`Invitation recorded for ${roleLabel[role]}. Ask this person to create their account from the Editorial Login page using the same email address.`)
      e.currentTarget.reset()
    }
    await load();setBusy(false)
  }

  async function revoke(email:string){
    if(!confirm(`Remove staff access for ${email}?`))return
    setBusy(true);setMessage('')
    const {error}=await supabase.rpc('revoke_staff_access',{target_email:email})
    setMessage(error?error.message:'Access removed.')
    await load();setBusy(false)
  }

  return <section id="access-control" className="contentCard" style={{marginTop:20}}>
    <h2 style={{margin:'0 0 5px'}}>Staff Access</h2>
    <p style={{margin:'0 0 14px',fontSize:12,lineHeight:1.6,color:'#687586'}}>Grant either full administrator access or restricted Editorial Board Manager access. Full administrators can manage publications, website settings, staff access, security and storage.</p>
    {message?<div style={{padding:'9px 11px',background:'#eef6fb',border:'1px solid #c9dce9',borderRadius:5,fontSize:12,marginBottom:12}}>{message}</div>:null}
    <form onSubmit={grant} style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',padding:'12px',background:'#f7f9fb',border:'1px solid #e0e6ea',marginBottom:14}}>
      <input name="email" type="email" required placeholder="person@example.com" style={{minWidth:260,flex:'1 1 300px',padding:'9px 10px',border:'1px solid #cbd5df',borderRadius:5,fontSize:12}}/>
      <select name="role" defaultValue="editorial_board_manager" style={{minWidth:210,padding:'9px 10px',border:'1px solid #cbd5df',borderRadius:5,fontSize:12,background:'#fff'}}>
        <option value="editorial_board_manager">Editorial Board Manager</option>
        <option value="admin">Full Administrator</option>
      </select>
      <button type="submit" disabled={busy} className="btn btnGold compact">Grant Access</button>
    </form>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5,minWidth:720}}><thead><tr style={{background:'#f4f7f9',textAlign:'left'}}><th style={{padding:8}}>Email</th><th style={{padding:8}}>Role</th><th style={{padding:8}}>Access</th><th style={{padding:8}}>Added</th><th style={{padding:8}}>Action</th></tr></thead><tbody>
      {rows.length?rows.map(r=><tr key={`${r.email}-${r.role}-${r.access_status}`} style={{borderTop:'1px solid #e4e9ed'}}><td style={{padding:8,fontWeight:700}}>{r.email}</td><td style={{padding:8,fontWeight:700}}>{roleLabel[r.role]}</td><td style={{padding:8}}><span style={{fontSize:10,fontWeight:800,color:r.access_status==='active'?'#16723b':'#8a6112'}}>{r.access_status==='active'?'Active':'Pending account setup'}</span></td><td style={{padding:8}}>{new Date(r.created_at).toLocaleDateString()}</td><td style={{padding:8}}><button type="button" disabled={busy} onClick={()=>revoke(r.email)} style={{padding:'6px 9px',border:'1px solid #efc5c5',borderRadius:5,background:'#fff5f5',color:'#9d2525',fontSize:10.5,fontWeight:700,cursor:'pointer'}}>Remove Access</button></td></tr>):<tr><td colSpan={5} style={{padding:14,color:'#687586'}}>No additional staff access has been added yet.</td></tr>}
    </tbody></table></div>
    <div style={{marginTop:12,padding:'10px 12px',borderLeft:'3px solid #b89442',background:'#fffaf0',fontSize:11,lineHeight:1.6,color:'#66583b'}}>For a new person: enter their email, choose the required role, then click <strong>Grant Access</strong>. If they do not yet have an account, ask them to open <strong>Editorial Login → Set up invited account</strong> and register using the exact same email address.</div>
  </section>
}
