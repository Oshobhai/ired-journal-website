'use client'

import Link from 'next/link'
import {FormEvent,useState} from 'react'
import {createClient} from '@/lib/supabase/client'
import styles from '../admin.module.css'

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

  return <main className={styles.loginPage}>
    <section className={styles.loginBrandPanel}>
      <img src="/ired-header-logo.webp?v=5" alt="IRED"/>
      <div className={styles.loginStatement}><span>Invited Academic Staff</span><h1>Editorial Board Manager Account Setup</h1><p>Create a restricted staff account for maintaining Editorial Board and Review Committee records. Publication management and security controls remain unavailable to this role.</p></div>
      <div className={styles.loginMotto}>Institute of Research Education and Development</div>
    </section>

    <section className={styles.loginFormPanel}>
      <div className={styles.loginCard}>
        <div className={styles.loginKicker}>Invitation Required</div>
        <h2>Set up your account</h2>
        <p>Use the exact email address approved by the IRED administrator. Your account will receive only Editorial Board Management access.</p>
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
          <button disabled={busy} className={styles.primaryLogin} type="submit">{busy?'Creating account…':'Create Editorial Account'}</button>
        </form>
        <Link href="/admin/login" className={styles.backLink}>← Back to Editorial Login</Link>
      </div>
    </section>
  </main>
}
