import Link from 'next/link'
import { adminLogin } from '../actions'

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

  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#eef3f7',padding:'24px'}}>
      <section style={{width:'100%',maxWidth:420,background:'#fff',border:'1px solid #d9e1e8',borderRadius:10,padding:28,boxShadow:'0 18px 45px #0b2d4e18'}}>
        <div style={{fontSize:12,letterSpacing:'.14em',textTransform:'uppercase',color:'#687586',marginBottom:6}}>Protected Staff Access</div>
        <h1 style={{margin:'0 0 8px',fontFamily:'Georgia,serif',color:'#0b2d4e'}}>IRED Editorial Login</h1>
        <p style={{margin:'0 0 20px',fontSize:13,lineHeight:1.6,color:'#687586'}}>Approved administrators and Editorial Board Managers can sign in here. Access is limited according to the assigned role.</p>
        {message ? <div style={{background:'#fff2f2',border:'1px solid #efc4c4',color:'#9c1c1c',padding:'10px 12px',borderRadius:5,fontSize:12,marginBottom:14}}>{message}</div> : null}
        <form action={adminLogin}>
          <label style={{display:'block',fontSize:12,fontWeight:700,marginBottom:5}} htmlFor="email">Staff email</label>
          <input id="email" name="email" type="email" autoComplete="username" required style={{width:'100%',padding:'11px 12px',border:'1px solid #cbd6df',borderRadius:5,marginBottom:14}} />
          <label style={{display:'block',fontSize:12,fontWeight:700,marginBottom:5}} htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required style={{width:'100%',padding:'11px 12px',border:'1px solid #cbd6df',borderRadius:5,marginBottom:16}} />
          <button type="submit" style={{width:'100%',padding:'11px 14px',border:0,borderRadius:5,background:'#0b2d4e',color:'#fff',fontWeight:700,cursor:'pointer'}}>Sign in securely</button>
        </form>
        <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid #e7ecef',textAlign:'center'}}>
          <div style={{fontSize:11,color:'#74818c',marginBottom:6}}>Invited as an Editorial Board Manager?</div>
          <Link href="/admin/register" style={{fontSize:12,fontWeight:700,color:'#176b42'}}>Set up invited account →</Link>
        </div>
        <Link href="/" style={{display:'block',textAlign:'center',marginTop:14,fontSize:12,color:'#526577'}}>← Back to website</Link>
      </section>
    </main>
  )
}
