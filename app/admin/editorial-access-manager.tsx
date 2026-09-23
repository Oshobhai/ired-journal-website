'use client'

import {FormEvent,useCallback,useEffect,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

type AccessRow={email:string;access_status:'active'|'pending';created_at:string}

export default function EditorialAccessManager(){
  const supabase=createClient()
  const [rows,setRows]=useState<AccessRow[]>([])
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const {data,error}=await supabase.rpc('list_editorial_board_manager_access')
    if(error){setMessage(error.message);return}
    setRows((data||[]) as AccessRow[])
  },[supabase])

  useEffect(()=>{void load()},[load])

  async function grant(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage('')
    const f=new FormData(e.currentTarget)
    const email=String(f.get('email')||'').trim().toLowerCase()
    const {data,error}=await supabase.rpc('grant_editorial_board_manager',{target_email:email})
    if(error)setMessage(error.message)
    else{
      setMessage(data==='active'?'Access enabled. This user can now sign in.':'Invitation recorded. Ask this person to create their account from the Editorial Login page using the same email address.')
      e.currentTarget.reset()
    }
    await load();setBusy(false)
  }

  async function revoke(email:string){
    if(!confirm(`Remove Editorial Board Management access for ${email}?`))return
    setBusy(true);setMessage('')
    const {error}=await supabase.rpc('revoke_editorial_board_manager',{target_email:email})
    setMessage(error?error.message:'Access removed.')
    await load();setBusy(false)
  }

  return <section id="access-control" className="contentCard" style={{marginTop:20}}>
    <h2 style={{margin:'0 0 5px'}}>Editorial Board Access</h2>
    <p style={{margin:'0 0 14px',fontSize:12,lineHeight:1.6,color:'#687586'}}>Give a trusted person access only to Editorial Board Management. They will not see GREEN/RED publication controls, Upload Center, Generator, Security or staff permissions.</p>
    {message?<div style={{padding:'9px 11px',background:'#eef6fb',border:'1px solid #c9dce9',borderRadius:5,fontSize:12,marginBottom:12}}>{message}</div>:null}
    <form onSubmit={grant} style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',padding:'12px',background:'#f7f9fb',border:'1px solid #e0e6ea',marginBottom:14}}>
      <input name="email" type="email" required placeholder="person@example.com" style={{minWidth:280,flex:'1 1 320px',padding:'9px 10px',border:'1px solid #cbd5df',borderRadius:5,fontSize:12}}/>
      <button type="submit" disabled={busy} className="btn btnGold compact">Give Editorial Board Access</button>
    </form>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5,minWidth:620}}><thead><tr style={{background:'#f4f7f9',textAlign:'left'}}><th style={{padding:8}}>Email</th><th style={{padding:8}}>Access</th><th style={{padding:8}}>Added</th><th style={{padding:8}}>Action</th></tr></thead><tbody>
      {rows.length?rows.map(r=><tr key={`${r.email}-${r.access_status}`} style={{borderTop:'1px solid #e4e9ed'}}><td style={{padding:8,fontWeight:700}}>{r.email}</td><td style={{padding:8}}><span style={{fontSize:10,fontWeight:800,color:r.access_status==='active'?'#16723b':'#8a6112'}}>{r.access_status==='active'?'Active':'Pending account setup'}</span></td><td style={{padding:8}}>{new Date(r.created_at).toLocaleDateString()}</td><td style={{padding:8}}><button type="button" disabled={busy} onClick={()=>revoke(r.email)} style={{padding:'6px 9px',border:'1px solid #efc5c5',borderRadius:5,background:'#fff5f5',color:'#9d2525',fontSize:10.5,fontWeight:700,cursor:'pointer'}}>Remove Access</button></td></tr>):<tr><td colSpan={4} style={{padding:14,color:'#687586'}}>No Editorial Board Managers added yet.</td></tr>}
    </tbody></table></div>
    <div style={{marginTop:12,padding:'10px 12px',borderLeft:'3px solid #b89442',background:'#fffaf0',fontSize:11,lineHeight:1.6,color:'#66583b'}}>For a new person: add their email here first. Then ask them to open <strong>Editorial Login → Set up invited account</strong> and register using the exact same email address.</div>
  </section>
}
