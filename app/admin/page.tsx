import { requireAdmin } from '@/lib/admin-auth'
import { adminLogout } from './actions'

export const dynamic = 'force-dynamic'

export default async function Admin(){
  const user = await requireAdmin()
  return <div className="adminShell"><aside className="adminSide"><h2>IRED Admin</h2><div style={{fontSize:11,opacity:.7,marginBottom:14}}>Signed in as<br/><strong>{user.email}</strong></div>{['Dashboard','Papers','RED Books','Submissions','Authors','Reviewers','Issues','Editorial Board','Security Logs','Settings'].map(x=><a key={x} href="#">{x}</a>)}<form action={adminLogout} style={{marginTop:20}}><button className="btn btnOutline" type="submit">Logout</button></form></aside><main className="adminMain"><h1>Journal Administration</h1><p>Protected admin area. Database and storage actions will be connected to Supabase with admin-only policies.</p><div className="stats"><div className="stat"><span>Total Papers</span><strong>—</strong></div><div className="stat"><span>Published</span><strong>—</strong></div><div className="stat"><span>Pending Review</span><strong>—</strong></div><div className="stat"><span>RED Books</span><strong>—</strong></div></div><div className="contentCard"><h2>Quick Actions</h2><button className="btn btnGreen">+ Add Paper</button> <button className="btn btnRed">+ Add RED Book</button> <button className="btn btnNavy">View Submissions</button></div></main></div>
}
