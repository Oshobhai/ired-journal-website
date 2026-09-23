import Link from 'next/link'
import { adminLogin } from '../actions'
import styles from '../admin.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
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
        <form action={adminLogin}>
          <label htmlFor="email">Staff email</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          <button className={styles.primaryLogin} type="submit">Sign in to Administration Portal</button>
        </form>
        <div className={styles.loginSecondary}>Invited as an Editorial Board Manager?<br/><Link href="/admin/register">Set up invited account →</Link></div>
        <Link href="/" className={styles.backLink}>← Return to IRED website</Link>
      </div>
    </section>
  </main>
}
