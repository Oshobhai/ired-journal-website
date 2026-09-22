import { requireAdmin } from '@/lib/admin-auth'
import { adminLogout } from './actions'
import PublicationManager from './publication-manager'

export const dynamic = 'force-dynamic'

export default async function Admin(){
  const user = await requireAdmin()
  return <div className="adminShell"><aside className="adminSide"><h2>IRED Admin</h2><div style={{fontSize:11,opacity:.7,marginBottom:14}}>Signed in as<br/><strong>{user.email}</strong></div>{['Dashboard','GREEN Papers','RED Books','Submissions','Authors','Reviewers','Issues','Editorial Board','Security Logs','Settings'].map(x=><a key={x} href="#">{x}</a>)}<form action={adminLogout} style={{marginTop:20}}><button className="btn btnOutline" type="submit">Logout</button></form></aside><main className="adminMain"><h1>Journal Administration</h1><p>Protected Supabase-backed publication control panel. Only approved administrators can upload, publish, unpublish, or delete journal files.</p><div className="stats"><div className="stat"><span>GREEN Papers</span><strong>DB</strong></div><div className="stat"><span>RED Books</span><strong>DB</strong></div><div className="stat"><span>PDF Storage</span><strong>Private</strong></div><div className="stat"><span>Access</span><strong>Admin</strong></div></div><PublicationManager/></main></div>
}
