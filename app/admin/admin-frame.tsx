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

type IconName='overview'|'green'|'red'|'editorial'|'word'|'upload'|'settings'|'brand'|'contact'|'access'|'security'

function AdminIcon({name}:{name:IconName}){
  const common={width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true}
  if(name==='overview')return <svg {...common}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  if(name==='green')return <svg {...common}><path d="M6 3.5h9l3 3V21H6z"/><path d="M15 3.5V7h3"/><path d="M9 12h6M9 16h5"/></svg>
  if(name==='red')return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z"/></svg>
  if(name==='editorial')return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.5 2.5-5 5.5-5s4.9 1.5 5.5 5"/><circle cx="17" cy="9" r="2"/><path d="M15.5 14.5c2.8-.3 4.6 1 5 4"/></svg>
  if(name==='word')return <svg {...common}><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4"/><path d="M8.5 11l1.5 6 2-6 2 6 1.5-6"/></svg>
  if(name==='upload')return <svg {...common}><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 14v6h14v-6"/></svg>
  if(name==='settings')return <svg {...common}><path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h8M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="14" cy="18" r="2"/></svg>
  if(name==='brand')return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="9" r="2"/><path d="m5 17 4-4 3 3 2-2 5 3"/></svg>
  if(name==='contact')return <svg {...common}><path d="M7.5 4 10 8l-2 2c1.4 3 3.6 5.2 6.6 6.6l2-2 4 2.5-.8 3c-.2.7-.9 1.1-1.6 1-8-.9-14.4-7.3-15.3-15.3-.1-.7.3-1.4 1-1.6z"/></svg>
  if(name==='access')return <svg {...common}><circle cx="8" cy="8" r="3"/><path d="M3 20c.5-4 2.2-6 5-6 1.3 0 2.4.4 3.2 1.1"/><circle cx="17" cy="16" r="3"/><path d="m19.2 13.8 1.8-1.8M20.4 12.6l1 1"/></svg>
  return <svg {...common}><path d="M12 3 5 6v5c0 4.8 2.6 8.1 7 10 4.4-1.9 7-5.2 7-10V6z"/><path d="m9 12 2 2 4-5"/></svg>
}

function NavItem({href,label,icon,active}:{href:string;label:string;icon:IconName;active:boolean}){
  return <Link className={styles.navLink} href={href} style={active?{background:'#ffffff0d',borderLeftColor:'#c8a44a',color:'#fff'}:undefined}><span className={styles.navIcon}><AdminIcon name={icon}/></span><span>{label}</span></Link>
}

export default function AdminFrame({access,active,kicker,title,description,children}:Props){
  const isAdmin=access.role==='admin'
  return <div className={styles.portal}>
    <header className={styles.topbar}>
      <div className={styles.brand}><img src="/api/brand/ired_header" alt="IRED"/><span className={styles.brandDivider}/><div className={styles.brandText}><strong>Academic Administration Portal</strong><span>Institute of Research Education and Development</span></div></div>
      <div className={styles.topActions}><Link className={styles.websiteLink} href="/">View Public Website</Link><span className={styles.roleBadge}>{isAdmin?'Full Administrator':'Editorial Board Manager'}</span><form action={adminLogout}><button className={styles.logoutButton} type="submit">Sign Out</button></form></div>
    </header>
    <div className={styles.body}>
      <aside className={styles.side}>
        {isAdmin?<><div className={styles.sideTitle}>Publications</div><nav className={styles.navGroup}><NavItem href="/admin/dashboard" label="Overview" icon="overview" active={active==='dashboard'}/><NavItem href="/admin/green" label="GREEN Papers" icon="green" active={active==='green'}/><NavItem href="/admin/red" label="RED Books" icon="red" active={active==='red'}/></nav></>:null}
        <div className={styles.sideTitle}>Academic Governance</div><nav className={styles.navGroup}><NavItem href="/admin/editorial-board" label="Editorial Board" icon="editorial" active={active==='editorial-board'}/></nav>
        {isAdmin?<><div className={styles.sideTitle}>Publication Workflow</div><nav className={styles.navGroup}><NavItem href="/admin/green-generator" label="GREEN Word Formatter" icon="word" active={active==='green-generator'}/><NavItem href="/admin/upload" label="Upload Center" icon="upload" active={active==='upload'}/></nav><div className={styles.sideTitle}>Administration</div><nav className={styles.navGroup}><NavItem href="/admin/website-settings" label="Website Settings" icon="settings" active={active==='website-settings'}/><NavItem href="/admin/brand" label="Brand & Logos" icon="brand" active={active==='brand'}/><NavItem href="/admin/contact-settings" label="Contact Details" icon="contact" active={active==='contact-settings'}/><NavItem href="/admin/access" label="Staff Access" icon="access" active={active==='access'}/><NavItem href="/admin/security" label="Security & Storage" icon="security" active={active==='security'}/></nav></>:null}
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
