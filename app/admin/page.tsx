import { requireAdmin } from '@/lib/admin-auth'
import { adminLogout } from './actions'
import PublicationManager from './publication-manager'
import ManagementConsole from './management-console'
import GreenPaperGenerator from './green-paper-generator'
import EditorialBoardManager from './editorial-board-manager'

export const dynamic = 'force-dynamic'

export default async function Admin(){
  const user = await requireAdmin()
  return <div className="adminShell"><aside className="adminSide"><h2>IRED Admin</h2><div style={{fontSize:11,opacity:.7,marginBottom:14}}>Signed in as<br/><strong>{user.email}</strong></div><a href="#dashboard">Dashboard</a><a href="#green-manager">GREEN Papers</a><a href="#red-manager">RED Books</a><a href="#editorial-board-manager">Editorial Board</a><a href="#green-generator">GREEN Generator</a><a href="#upload-center">Upload Center</a><a href="#security">Security</a><form action={adminLogout} style={{marginTop:20}}><button className="btn btnOutline" type="submit">Logout</button></form></aside><main className="adminMain"><h1>Journal Administration</h1><p>Protected Supabase-backed publication control panel for managing research publications and academic governance content.</p><ManagementConsole/><EditorialBoardManager/><GreenPaperGenerator/><div id="upload-center"><PublicationManager/></div><section id="security" className="contentCard" style={{marginTop:20}}><h2>Security & Storage</h2><p style={{fontSize:13,lineHeight:1.6}}>Admin access is authenticated through Supabase. Publication files and Editorial Board changes are protected by admin-only database policies. Use Archive for old publications and permanent Delete only when a record should be fully removed.</p></section></main></div>
}
