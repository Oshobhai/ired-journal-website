import Link from 'next/link'
import { adminLogout } from './actions'
import styles from './admin.module.css'

type Access = {
  user: { email?: string | null }
  role: 'admin' | 'editorial_board_manager'
}

type Props = {
  access: Access
  active: string
  kicker: string
  title: string
  description: string
  children: React.ReactNode
}

function NavItem({href,label,code,active}:{href:string;label:string;code:string;active:boolean}){
  return <Link className={styles.navLink} href={href} style={active?{background:'#ffffff0d',borderLeftColor:'#c8a44a',color:'#fff'}:undefined}><span className={styles.navIcon}>{code}</span><span>{label}</span></Link>
}

export default function AdminFrame({access,active,kicker,title,description,children}:Props){
  const isAdmin=access.role==='admin'
  return <div className={styles.portal}>
    <header className={styles.topbar}>
      <div className={styles.brand}><img src="/ired-header-logo.webp?v=5" alt="IRED"/><span className={styles.brandDivider}/><div className={styles.brandText}><strong>Academic Administration Portal</strong><span>Institute of Research Education and Development</span></div></div>
      <div className={styles.topActions}><Link className={styles.websiteLink} href="/">View Public Website</Link><span className={styles.roleBadge}>{isAdmin?'Full Administrator':'Editorial Board Manager'}</span><form action={adminLogout}><button className={styles.logoutButton} type="submit">Sign Out</button></form></div>
    </header>
    <div className={styles.body}>
      <aside className={styles.side}>
        {isAdmin?<><div className={styles.sideTitle}>Publications</div><nav className={styles.navGroup}><NavItem href="/admin/dashboard" label="Overview" code="01" active={active==='dashboard'}/><NavItem href="/admin/green" label="GREEN Papers" code="G" active={active==='green'}/><NavItem href="/admin/red" label="RED Books" code="R" active={active==='red'}/></nav></>:null}
        <div className={styles.sideTitle}>Academic Governance</div><nav className={styles.navGroup}><NavItem href="/admin/editorial-board" label="Editorial Board" code="EB" active={active==='editorial-board'}/></nav>
        {isAdmin?<><div className={styles.sideTitle}>Publication Workflow</div><nav className={styles.navGroup}><NavItem href="/admin/green-generator" label="GREEN Generator" code="PG" active={active==='green-generator'}/><NavItem href="/admin/upload" label="Upload Center" code="UP" active={active==='upload'}/></nav><div className={styles.sideTitle}>Administration</div><nav className={styles.navGroup}><NavItem href="/admin/access" label="Staff Access" code="AC" active={active==='access'}/><NavItem href="/admin/security" label="Security & Storage" code="SC" active={active==='security'}/></nav></>:null}
        <div className={styles.accountBox}><div className={styles.accountLabel}>Signed in account</div><div className={styles.accountEmail}>{access.user.email}</div><div className={styles.accountRole}>{isAdmin?'Administrator — full control':'Editorial Board Manager — restricted access'}</div></div>
        <div className={styles.sideMotto}>“Knowledge for a Better Tomorrow”</div>
      </aside>
      <main className={styles.main}>
        <section className={styles.intro}><div><div className={styles.kicker}>{kicker}</div><h1>{title}</h1><p>{description}</p></div><div className={styles.introMeta}><strong>IRED · Ahmedabad</strong>{isAdmin?'Administrative authority: Full':'Administrative authority: Limited'}<br/>Authentication: Supabase<br/>Access control: Role-based</div></section>
        {children}
        <footer className={styles.portalFooter}><span>Institute of Research Education and Development · Academic Administration</span><span>Protected staff workspace · Role-based access</span></footer>
      </main>
    </div>
  </div>
}
