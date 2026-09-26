import Link from 'next/link';

export function Header(){
  return <>
    <div className="utilityBar"><div className="container utilityInner"><div className="utilityLeft"><span>● Ahmedabad, Gujarat, India</span><span>✉ ired.foundation@gmail.com</span><span>☎ 7383000930 · 7203998343</span></div><div className="utilityRight"><Link href="/admin" style={{color:'inherit',textDecoration:'none',fontWeight:700}}>♟ Editorial Login</Link><span>A A A</span><span>◉ English⌄</span></div></div></div>
    <header className="siteHeader"><div className="container brandRow">
      <Link href="/" className="brandLogoLink" aria-label="IRED home"><img className="iredLogo" src="/ired-header-red.svg?v=1" alt="IRed — Institute of Research Education and Development"/></Link>
      <div className="headerActions"><form className="search" action="/search" method="get"><input name="q" aria-label="Search publications" placeholder="Search papers, journals, authors, keywords..."/><button type="submit" aria-label="Search">⌕</button></form><Link className="btn btnGold compact" href="/contact">Contact to Submit</Link></div>
    </div></header>
    <nav className="mainNav"><div className="container navInner"><Link href="/">Home</Link><Link href="/about">About IRED</Link><Link href="/journal-information">Journal Information</Link><Link href="/green">GREEN Journal</Link><Link href="/red">RED e-Journal</Link><Link href="/editorial-board">Editorial Board</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link><span className="navTagline">“Knowledge for a Better Tomorrow”</span></div></nav>
    <details className="mobileNav"><summary>Explore IRED</summary><div className="mobileNavPanel"><div className="mobileNavLinks"><Link href="/">Home</Link><Link href="/about">About IRED</Link><Link href="/journal-information">Journal Information</Link><Link href="/green">GREEN Journal</Link><Link href="/red">RED e-Journal</Link><Link href="/editorial-board">Editorial Board</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link></div><form className="mobileSearch" action="/search" method="get"><input name="q" aria-label="Search publications" placeholder="Search publications..."/><button type="submit" aria-label="Search">⌕</button></form><div className="mobileEditorial"><span>Staff access</span><Link href="/admin">Editorial Login</Link></div></div></details>
  </>
}

export function Footer(){
  return <footer className="footer"><div className="container"><div className="footerGrid">
    <div className="footerBrand"><img src="/ired-header-red.svg?v=1" alt="IRed — Institute of Research Education and Development"/><p><strong>Institute of Research Education and Development (IRED)</strong></p><p>Publishing Body & Publisher</p><p>A-3, 3rd Floor, Gita Apartment,<br/>Nr. Hirabaug Crossing, Ambawadi,<br/>Ahmedabad-380015, Gujarat, India.</p></div>
    <div><h3>Journals</h3><Link href="/journal-information">Journal Information</Link><Link href="/green">GREEN: The Research Journal</Link><Link href="/red">RED: The Research Journal e-Journal</Link><Link href="/editorial-board">Editorial Board</Link></div>
    <div><h3>Academic Links</h3><Link href="/about">About IRED</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link></div>
    <div><h3>Contact Us</h3><p>Phone: 7383000930 | 7203998343</p><p>Email: ired.foundation@gmail.com</p><p>Registration No.<br/>GUJ/15856/AHMEDABAD</p></div>
    <div className="footerMotto">Knowledge<br/>for a Better Tomorrow</div>
  </div><div className="copy"><span>© 2026 Institute of Research Education and Development (IRED). All rights reserved.</span><span><Link href="/privacy">Privacy Policy</Link>&nbsp;&nbsp;|&nbsp;&nbsp;<Link href="/terms">Terms of Use</Link>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="/sitemap.xml">Sitemap</a></span></div></div></footer>
}
