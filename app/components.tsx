import Link from 'next/link';
import {getContactSettings} from '@/lib/contact-settings';
import {getSiteSettings} from '@/lib/site-settings';

export async function Header(){
  const [contact,settings]=await Promise.all([getContactSettings(),getSiteSettings()]);
  const phones=[contact.phone_primary,contact.phone_secondary].filter(Boolean).join(' · ');
  return <>
    <div className="utilityBar"><div className="container utilityInner"><div className="utilityLeft"><span>● Ahmedabad, Gujarat, India</span><span>✉ {contact.email}</span><span>☎ {phones}</span></div><div className="utilityRight"><Link href="/admin" style={{color:'inherit',textDecoration:'none',fontWeight:700}}>♟ Editorial Login</Link><span>A A A</span><span>◉ English⌄</span></div></div></div>
    <header className="siteHeader"><div className="container brandRow">
      <Link href="/" className="brandLogoLink" aria-label={`${settings.institution_short_name} home`}><img className="iredLogo" src="/api/brand/ired_header" alt={`${settings.institution_short_name} — ${settings.institution_name}`}/></Link>
      <div className="headerActions"><form className="search" action="/search" method="get"><input name="q" aria-label="Search publications" placeholder="Search papers, journals, authors, keywords..."/><button type="submit" aria-label="Search">⌕</button></form><Link className="btn btnGold compact" href="/contact">Contact to Submit</Link></div>
    </div></header>
    <nav className="mainNav"><div className="container navInner"><Link href="/">Home</Link><Link href="/about">About {settings.institution_short_name}</Link><Link href="/journal-information">Journal Information</Link><Link href="/green">GREEN Journal</Link><Link href="/red">RED e-Journal</Link><Link href="/editorial-board">Editorial Board</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link><span className="navTagline">“{settings.motto}”</span></div></nav>
    <details className="mobileNav"><summary>Explore {settings.institution_short_name}</summary><div className="mobileNavPanel"><div className="mobileNavLinks"><Link href="/">Home</Link><Link href="/about">About {settings.institution_short_name}</Link><Link href="/journal-information">Journal Information</Link><Link href="/green">GREEN Journal</Link><Link href="/red">RED e-Journal</Link><Link href="/editorial-board">Editorial Board</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link></div><form className="mobileSearch" action="/search" method="get"><input name="q" aria-label="Search publications" placeholder="Search publications..."/><button type="submit" aria-label="Search">⌕</button></form><div className="mobileEditorial"><span>Staff access</span><Link href="/admin">Editorial Login</Link></div></div></details>
  </>
}

export async function Footer(){
  const [contact,settings]=await Promise.all([getContactSettings(),getSiteSettings()]);
  const phones=[contact.phone_primary,contact.phone_secondary].filter(Boolean).join(' | ');
  return <footer className="footer"><div className="container"><div className="footerGrid">
    <div className="footerBrand"><img src="/api/brand/ired_footer" alt={`${settings.institution_short_name} — ${settings.institution_name}`}/><p><strong>{settings.institution_name} ({settings.institution_short_name})</strong></p><p>Publishing Body & Publisher</p><p>{settings.official_address}</p></div>
    <div><h3>Journals</h3><Link href="/journal-information">Journal Information</Link><Link href="/green">{settings.green_title}</Link><Link href="/red">{settings.red_title}</Link><Link href="/editorial-board">Editorial Board</Link></div>
    <div><h3>Academic Links</h3><Link href="/about">About {settings.institution_short_name}</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link></div>
    <div><h3>Contact Us</h3><p>Phone: {phones}</p><p>Email: {contact.email}</p><p>Registration No.<br/>{contact.registration_no}</p></div>
    <div className="footerMotto">{settings.motto}</div>
  </div><div className="copy"><span>© {new Date().getFullYear()} {settings.institution_name} ({settings.institution_short_name}). All rights reserved.</span><span><Link href="/privacy">Privacy Policy</Link>&nbsp;&nbsp;|&nbsp;&nbsp;<Link href="/terms">Terms of Use</Link>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="/sitemap.xml">Sitemap</a></span></div></div></footer>
}
