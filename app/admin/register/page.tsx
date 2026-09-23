'use client'

import Link from 'next/link'
import {FormEvent,useState} from 'react'
import {createClient} from '@/lib/supabase/client'

export default function EditorialRegister(){
  const supabase=createClient()
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage('');setError('')
    const f=new FormData(e.currentTarget)
    const email=String(f.get('email')||'').trim().toLowerCase()
    const password=String(f.get('password')||'')
    const confirmPassword=String(f.get('confirm_password')||'')

    if(password.length<8){setError('Password must be at least 8 characters.');setBusy(false);return}
    if(password!==confirmPassword){setError('Passwords do not match.');setBusy(false);return}

    const {data:invited,error:inviteError}=await supabase.rpc('is_editorial_manager_invited',{target_email:email})
    if(inviteError||!invited){setError('This email does not have an Editorial Board Manager invitation. Ask the IRED administrator to add your email first.');setBusy(false);return}

    const {error:signupError}=await supabase.auth.signUp({email,password})
    if(signupError){setError(signupError.message);setBusy(false);return}

    setMessage('Account created. If email confirmation is required, confirm the email first, then return to Editorial Login and sign in.')
    e.currentTarget.reset();setBusy(false)
  }

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#eef3f7',padding:24}}>
    <section style={{width:'100%',maxWidth:450,background:'#fff',border:'1px solid #d9e1e8',borderRadius:10,padding:28,boxShadow:'0 18px 45px #0b2d4e18'}}>
      <div style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'#687586',marginBottom:6}}>Invited Staff Access</div>
      <h1 style={{margin:'0 0 8px',fontFamily:'Georgia,serif',color:'#0b2d4e'}}>Editorial Board Manager Setup</h1>
      <p style={{margin:'0 0 18px',fontSize:12.5,lineHeight:1.6,color:'#687586'}}>Use the exact email address that the IRED administrator approved. This account receives access only to Editorial Board Management.</p>
      {error?<div style={{background:'#fff2f2',border:'1px solid #efc4c4',color:'#9c1c1c',padding:'10px 12px',borderRadius:5,fontSize:12,marginBottom:14}}>{error}</div>:null}
      {message?<div style={{background:'#edf8f1',border:'1px solid #b9dfc7',color:'#1a6a39',padding:'10px 12px',borderRadius:5,fontSize:12,lineHeight:1.55,marginBottom:14}}>{message}</div>:null}
      <form onSubmit={submit}>
        <label style={{display:'block',fontSize:12,fontWeight:700,marginBottom:5}}>Approved email</label>
        <input name="email" type="email" required autoComplete="email" style={{width:'100%',padding:'11px 12px',border:'1px solid #cbd6df',borderRadius:5,marginBottom:14}}/>
        <label style={{display:'block',fontSize:12,fontWeight:700,marginBottom:5}}>Create password</label>
        <input name="password" type="password" minLength={8} required autoComplete="new-password" style={{width:'100%',padding:'11px 12px',border:'1px solid #cbd6df',borderRadius:5,marginBottom:14}}/>
        <label style={{display:'block',fontSize:12,fontWeight:700,marginBottom:5}}>Confirm password</label>
        <input name="confirm_password" type="password" minLength={8} required autoComplete="new-password" style={{width:'100%',padding:'11px 12px',border:'1px solid #cbd6df',borderRadius:5,marginBottom:16}}/>
        <button disabled={busy} type="submit" style={{width:'100%',padding:'11px 14px',border:0,borderRadius:5,background:'#0b2d4e',color:'#fff',fontWeight:700,cursor:'pointer'}}>{busy?'Creating account…':'Create Editorial Account'}</button>
      </form>
      <Link href="/admin/login" style={{display:'block',textAlign:'center',marginTop:16,fontSize:12,color:'#526577'}}>← Back to Editorial Login</Link>
    </section>
  </main>
}
