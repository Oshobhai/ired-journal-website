import { requireStaff } from '@/lib/admin-auth'
import { adminLogout } from './actions'
import PublicationManager from './publication-manager'
import ManagementConsole from './management-console'
import GreenPaperGenerator from './green-paper-generator'
import EditorialBoardManager from './editorial-board-manager'
import EditorialAccessManager from './editorial-access-manager'

export const dynamic = 'force-dynamic'

export default async function Admin(){
  const access = await requireStaff()
  const isAdmin = access.role === 'admin'

  return <div className="adminShell">
    <aside className="adminSide">
      <h2>{isAdmin ? 'IRED Admin' : 'IRED Editorial'}</h2>
      <div style={{fontSize:11,opacity:.7,marginBottom:14}}>Signed in as<br/><strong>{access.user.email}</strong><br/><span>{isAdmin?'Administrator':'Editorial Board Manager'}</span></div>
      {isAdmin ? <><a href="#dashboard">Dashboard</a><a href="#green-manager">GREEN Papers</a><a href="#red-manager">RED Books</a></> : null}
      <a href="#editorial-board-manager">Editorial Board</a>
      {isAdmin ? <><a href="#green-generator">GREEN Generator</a><a href="#upload-center">Upload Center</a><a href="#access-control">Access Control</a><a href="#security">Security</a></> : null}
      <form action={adminLogout} style={{marginTop:20}}><button className="btn btnOutline" type="submit">Logout</button></form>
    </aside>
    <main className="adminMain">
      <h1>{isAdmin ? 'Journal Administration' : 'Editorial Board Administration'}</h1>
      <p>{isAdmin ? 'Protected Supabase-backed publication control panel for managing research publications and academic governance content.' : 'Restricted workspace for managing only Editorial Board and Review Committee members.'}</p>
      {isAdmin ? <ManagementConsole/> : null}
      <EditorialBoardManager/>
      {isAdmin ? <><GreenPaperGenerator/><div id="upload-center"><PublicationManager/></div><EditorialAccessManager/><section id="security" className="contentCard" style={{marginTop:20}}><h2>Security & Storage</h2><p style={{fontSize:13,lineHeight:1.6}}>Full administrators can manage publications, files and staff access. Editorial Board Managers are limited to Editorial Board and Review Committee records by database policies.</p></section></> : null}
    </main>
  </div>
}
