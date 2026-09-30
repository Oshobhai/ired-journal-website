import Link from 'next/link';
import {getContactSettings} from '@/lib/contact-settings';
import {getSiteSettings} from '@/lib/site-settings';

export function JournalTitle({kind,title,size=18}:{kind:'green'|'red';title?:string;size?:number}){
  const isGreen=kind==='green';
  const color=isGreen?'#148444':'#bd2025';
  const label=title||(isGreen?'GREEN: The Research e-Journal':'RED: The Research Journal');
  const iconSize=Math.max(15,Math.round(size*.9));
  return <span style={{display:'inline-flex',alignItems:'center',gap:Math.max(5,Math.round(size*.32)),color,fontFamily:'Georgia,serif',fontWeight:700,fontSize:size,lineHeight:1.2}}>
    <span aria-hidden="true" style={{width:iconSize+8,height:iconSize+8,borderRadius:5,display:'inline-grid',placeItems:'center',background:isGreen?'#edf8f1':'#fff1f1',border:`1px solid ${isGreen?'#cee7d6':'#efd2d3'}`,color,flex:'0 0 auto'}}>
      {isGreen?<svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h4M8 12h8M8 16h6"/></svg>:<svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8"/></svg>}
    </span>
    <span>{label}</span>
  </span>;
}

export async function Header(){
  const [contact,settings]=await Promise.all([getContactSettings(),getSiteSettings()]);
  const phones=[contact.phone_primary,contact.phone_secondary].filter(Boolean).join(' · ');
  const languages=Array.from(new Set(`${settings.green_language},${settings.red_language}`.split(',').map(x=>x.trim()).filter(Boolean))).join(' · ');
  return <>
    <div className="utilityBar"><div className="container utilityInner"><div className="utilityLeft"><span>● Ahmedabad, Gujarat, India</span><span>✉ {contact.email} · {contact.secondary_email}</span><span>☎ {phones}</span></div><div className="utilityRight"><Link href="/admin" style={{color:'inherit',textDecoration:'none',fontWeight:700}}>♟ Editorial Login</Link>{languages?<span>Languages: {languages}</span>:null}</div></div></div>
    <header className="siteHeader"><div className="container brandRow">
      <Link href="/" className="brandLogoLink" aria-label={`${settings.institution_short_name} home`}><img className="iredLogo" src="/api/brand/ired_header" alt={`${settings.institution_short_name} — ${settings.institution_name}`}/></Link>
      <div className="headerActions"><form className="search" action="/search" method="get"><input name="q" aria-label="Search publications" placeholder="Search papers, journals, authors, keywords..."/><button type="submit" aria-label="Search">⌕</button></form><Link className="btn btnGold compact" href="/contact">Contact to Submit</Link></div>
    </div></header>
    <nav className="mainNav"><div className="container navInner"><Link href="/">Home</Link><Link href="/about">About {settings.institution_short_name}</Link><Link href="/journal-information">Journal Information</Link><Link href="/green">GREEN</Link><Link href="/red">RED</Link><Link href="/editorial-board">Editorial Board</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link></div></nav>
    <details className="mobileNav"><summary>Explore {settings.institution_short_name}</summary><div className="mobileNavPanel"><div className="mobileNavLinks"><Link href="/">Home</Link><Link href="/about">About {settings.institution_short_name}</Link><Link href="/journal-information">Journal Information</Link><Link href="/green">GREEN</Link><Link href="/red">RED</Link><Link href="/editorial-board">Editorial Board</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link></div><form className="mobileSearch" action="/search" method="get"><input name="q" aria-label="Search publications" placeholder="Search publications..."/><button type="submit" aria-label="Search">⌕</button></form><div className="mobileEditorial"><span>Staff access</span><Link href="/admin">Editorial Login</Link></div></div></details>
  </>
}

export async function Footer(){
  const [contact,settings]=await Promise.all([getContactSettings(),getSiteSettings()]);
  const phones=[contact.phone_primary,contact.phone_secondary].filter(Boolean).join(' | ');
  return <footer className="footer"><div className="container"><div className="footerGrid">
    <div className="footerBrand"><img src="/api/brand/ired_footer" alt={`${settings.institution_short_name} — ${settings.institution_name}`}/><p><strong>{settings.institution_name} ({settings.institution_short_name})</strong></p><p>Publishing Body & Publisher</p><p><strong>Institute Address:</strong><br/>{settings.official_address}</p><p><strong>Journal / Editorial Office:</strong><br/>{settings.journal_office_address}</p></div>
    <div><h3>Journals</h3><Link href="/journal-information">Journal Information</Link><Link href="/green"><JournalTitle kind="green" title={settings.green_title} size={11}/></Link><Link href="/red"><JournalTitle kind="red" title={settings.red_title} size={11}/></Link><Link href="/editorial-board">Editorial Board</Link></div>
    <div><h3>Academic Links</h3><Link href="/about">About {settings.institution_short_name}</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link></div>
    <div><h3>Contact Us</h3><p>Phone: {phones}</p><p>Primary Email: {contact.email}</p><p>Secondary Email: {contact.secondary_email}</p><p>Registration No.<br/>{contact.registration_no}</p></div>
  </div><div className="copy"><span>© {new Date().getFullYear()} {settings.institution_name} ({settings.institution_short_name}). All rights reserved.</span><span style={{whiteSpace:'nowrap'}}><Link href="/privacy" style={{display:'inline',margin:0,fontSize:'inherit'}}>Privacy Policy</Link>&nbsp;&nbsp;|&nbsp;&nbsp;<Link href="/terms" style={{display:'inline',margin:0,fontSize:'inherit'}}>Terms of Use</Link>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="/sitemap.xml" style={{display:'inline',margin:0,fontSize:'inherit'}}>Sitemap</a></span></div></div></footer>
}
