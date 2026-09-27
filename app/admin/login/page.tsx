import Link from 'next/link'
import { adminLogin, resendStaffConfirmation } from '../actions'
import styles from '../admin.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; resent?: string; confirmed?: string; email?: string }>
}) {
  const params = await searchParams
  const error = params?.error
  const message =
    error === 'config'
      ? 'Staff security is ready, but Supabase environment variables are not configured in Vercel yet.'
      : error === 'unauthorized'
        ? 'This account does not have approved IRED staff access.'
        : error
          ? decodeURIComponent(error)
          : ''
  const notice = params?.resent === '1'
    ? 'Confirmation email sent. Open the email and confirm your account, then return here to sign in.'
    : params?.confirmed === '1'
      ? 'Email confirmation completed. You can now sign in.'
      : ''
  const email = params?.email ? decodeURIComponent(params.email) : ''

  return <main className={styles.loginPage}>
    <section className={styles.loginBrandPanel}>
      <img src="/ired-header-logo.webp?v=5" alt="IRED"/>
      <div className={styles.loginStatement}><span>Protected Academic Administration</span><h1>Editorial & Journal Management Portal</h1><p>Secure institutional access for managing IRED publications, editorial governance records and delegated academic administration.</p></div>
      <div className={styles.loginMotto}>“Knowledge for a Better Tomorrow”</div>
    </section>

    <section className={styles.loginFormPanel}>
      <div className={styles.loginCard}>
        <div className={styles.loginKicker}>Authorized Staff Access</div>
        <h2>Sign in to IRED</h2>
        <p>Use your approved administrator or Editorial Board Manager credentials. Available functions are determined by your assigned role.</p>
        {message?<div className={styles.errorBox}>{message}</div>:null}
        {notice?<div style={{padding:'10px 12px',marginBottom:12,background:'#eef7f2',border:'1px solid #c7e4d2',fontSize:12,color:'#245d3b'}}>{notice}</div>:null}
        <form action={adminLogin}>
          <label htmlFor="email">Staff email</label>
          <input id="email" name="email" type="email" autoComplete="username" defaultValue={email} required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          <button className={styles.primaryLogin} type="submit">Sign in to Administration Portal</button>
        </form>
        <form action={resendStaffConfirmation} style={{marginTop:12}}>
          <input type="hidden" name="email" value={email}/>
          <button type="submit" disabled={!email} style={{width:'100%',padding:'10px 12px',border:'1px solid #b8c7d4',background:'#fff',color:'#12395c',fontWeight:700,cursor:email?'pointer':'not-allowed',opacity:email?1:.55}}>Resend confirmation email</button>
        </form>
        <div className={styles.loginSecondary}>Invited staff member?<br/><Link href="/admin/register">Set up invited account →</Link></div>
        <Link href="/" className={styles.backLink}>← Return to IRED website</Link>
      </div>
    </section>
  </main>
}
