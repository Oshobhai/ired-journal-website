import Link from 'next/link'
import { requireStaff } from '@/lib/admin-auth'
import { adminLogout } from './actions'
import PublicationManager from './publication-manager'
import ManagementConsole from './management-console'
import GreenPaperGenerator from './green-paper-generator'
import EditorialBoardManager from './editorial-board-manager'
import EditorialAccessManager from './editorial-access-manager'
import styles from './admin.module.css'

export const dynamic = 'force-dynamic'

function NavItem({href,label,code}:{href:string;label:string;code:string}){
  return <a className={styles.navLink} href={href}><span className={styles.navIcon}>{code}</span><span>{label}</span></a>
}

export default async function Admin(){
  const access = await requireStaff()
  const isAdmin = access.role === 'admin'

  return <div className={styles.portal}>
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <img src="/ired-header-logo.webp?v=5" alt="IRED"/>
        <span className={styles.brandDivider}/>
        <div className={styles.brandText}><strong>Academic Administration Portal</strong><span>Institute of Research Education and Development</span></div>
      </div>
      <div className={styles.topActions}>
        <Link className={styles.websiteLink} href="/">View Public Website</Link>
        <span className={styles.roleBadge}>{isAdmin?'Full Administrator':'Editorial Board Manager'}</span>
        <form action={adminLogout}><button className={styles.logoutButton} type="submit">Sign Out</button></form>
      </div>
    </header>

    <div className={styles.body}>
      <aside className={styles.side}>
        {isAdmin ? <>
          <div className={styles.sideTitle}>Publications</div>
          <nav className={styles.navGroup}><NavItem href="#dashboard" label="Overview" code="01"/><NavItem href="#green-manager" label="GREEN Papers" code="G"/><NavItem href="#red-manager" label="RED Books" code="R"/></nav>
        </> : null}

        <div className={styles.sideTitle}>Academic Governance</div>
        <nav className={styles.navGroup}><NavItem href="#editorial-board-manager" label="Editorial Board" code="EB"/></nav>

        {isAdmin ? <>
          <div className={styles.sideTitle}>Publication Workflow</div>
          <nav className={styles.navGroup}><NavItem href="#green-generator" label="GREEN Generator" code="PG"/><NavItem href="#upload-center" label="Upload Center" code="UP"/></nav>
          <div className={styles.sideTitle}>Administration</div>
          <nav className={styles.navGroup}><NavItem href="#access-control" label="Staff Access" code="AC"/><NavItem href="#security" label="Security & Storage" code="SC"/></nav>
        </> : null}

        <div className={styles.accountBox}><div className={styles.accountLabel}>Signed in account</div><div className={styles.accountEmail}>{access.user.email}</div><div className={styles.accountRole}>{isAdmin?'Administrator — full control':'Editorial Board Manager — restricted access'}</div></div>
        <div className={styles.sideMotto}>“Knowledge for a Better Tomorrow”</div>
      </aside>

      <main className={styles.main}>
        <section className={styles.intro}>
          <div>
            <div className={styles.kicker}>{isAdmin?'Institutional Control Panel':'Restricted Academic Workspace'}</div>
            <h1>{isAdmin?'Journal & Research Administration':'Editorial Board Administration'}</h1>
            <p>{isAdmin?'Manage IRED research publications, academic governance records, publication workflows and delegated staff access from one protected institutional workspace.':'Manage Editorial Board and Review Committee records. Your role is intentionally restricted from publication uploads, GREEN/RED management, security and staff permissions.'}</p>
          </div>
          <div className={styles.introMeta}><strong>IRED · Ahmedabad</strong>{isAdmin?'Administrative authority: Full':'Administrative authority: Limited'}<br/>Authentication: Supabase<br/>Access control: Role-based</div>
        </section>

        {!isAdmin?<div className={styles.restrictedNotice}><strong>Restricted access:</strong> this account can edit only Editorial Board and Review Committee records. Other administrative functions are not available to this role.</div>:null}

        {isAdmin ? <ManagementConsole/> : null}
        <EditorialBoardManager/>
        {isAdmin ? <>
          <GreenPaperGenerator/>
          <div id="upload-center"><PublicationManager/></div>
          <EditorialAccessManager/>
          <section id="security" className={styles.securityBox}><h2>Security & Storage</h2><p>Full administrators can manage research publications, storage files and delegated staff access. Editorial Board Managers are restricted at both interface and database-policy level to Editorial Board and Review Committee records. Publication PDFs and covers remain stored in protected Supabase storage workflows.</p></section>
        </> : null}

        <footer className={styles.portalFooter}><span>Institute of Research Education and Development · Academic Administration</span><span>Protected staff workspace · Role-based access</span></footer>
      </main>
    </div>
  </div>
}
