'use client'

import Link from 'next/link'
import {FormEvent,useState} from 'react'
import {createClient} from '@/lib/supabase/client'
import styles from '../admin.module.css'

export default function StaffRegister(){
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
    if(inviteError||!invited){setError('This email does not have an active IRED staff invitation. Ask the administrator to add the exact email under Staff Access first.');setBusy(false);return}

    const {error:signupError}=await supabase.auth.signUp({email,password})
    if(signupError){
      const text=signupError.message.toLowerCase()
      if(text.includes('rate limit')){
        setError('Supabase has temporarily limited confirmation emails because several account setup attempts were made. Please wait before trying again; repeated clicks can extend the problem. Your staff invitation remains safe and pending.')
      }else{
        setError(signupError.message)
      }
      setBusy(false);return
    }

    setMessage('Account created. If email confirmation is required, confirm the email first, then return to Staff Login and sign in.')
    e.currentTarget.reset();setBusy(false)
  }

  return <main className={styles.loginPage}>
    <section className={styles.loginBrandPanel}>
      <img src="/ired-header-logo.webp?v=5" alt="IRED"/>
      <div className={styles.loginStatement}><span>Invited Academic Staff</span><h1>IRED Staff Account Setup</h1><p>Create the account approved under Staff Access. Your available administration functions are determined automatically by the role assigned to your email.</p></div>
      <div className={styles.loginMotto}>Institute of Research Education and Development</div>
    </section>

    <section className={styles.loginFormPanel}>
      <div className={styles.loginCard}>
        <div className={styles.loginKicker}>Invitation Required</div>
        <h2>Set up your account</h2>
        <p>Use the exact email address approved by the IRED administrator. Full Administrator and Editorial Board Manager invitations are both supported.</p>
        <div className={styles.registerNote}>An administrator must add your email under <strong>Staff Access</strong> before this form will accept your registration.</div>
        {error?<div className={styles.errorBox}>{error}</div>:null}
        {message?<div className={styles.successBox}>{message}</div>:null}
        <form onSubmit={submit}>
          <label>Approved email</label>
          <input name="email" type="email" required autoComplete="email" />
          <label>Create password</label>
          <input name="password" type="password" minLength={8} required autoComplete="new-password" />
          <label>Confirm password</label>
          <input name="confirm_password" type="password" minLength={8} required autoComplete="new-password" />
          <button disabled={busy} className={styles.primaryLogin} type="submit">{busy?'Creating account…':'Create Staff Account'}</button>
        </form>
        <Link href="/admin/login" className={styles.backLink}>← Back to Staff Login</Link>
      </div>
    </section>
  </main>
}
