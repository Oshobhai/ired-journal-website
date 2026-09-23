import Link from 'next/link';

export function Header(){
  return <>
    <div className="utilityBar"><div className="container utilityInner"><div className="utilityLeft"><span>● Ahmedabad, Gujarat, India</span><span>✉ ired.foundation@gmail.com</span><span>☎ 7383000930 · 7203998343</span></div><div className="utilityRight"><span>A A A</span><span>◉ English⌄</span><span>f</span><span>in</span><span>▶</span></div></div></div>
    <header className="siteHeader"><div className="container brandRow">
      <Link href="/" className="brandLogoLink" aria-label="IRED home"><img className="iredLogo" src="/ired-header-logo.webp?v=5" alt="IRED — Institute of Research Education and Development"/></Link>
      <div className="headerActions"><form className="search" action="/search" method="get"><input name="q" aria-label="Search publications" placeholder="Search papers, books, authors, keywords..."/><button type="submit" aria-label="Search">⌕</button></form><Link className="btn btnGold compact" href="/contact">↥ Contact to Submit</Link><Link className="btn btnOutline compact" href="/admin">♟ Admin Login</Link></div>
    </div></header>
    <nav className="mainNav"><div className="container navInner"><Link href="/">Home</Link><Link href="/about">About IRED</Link><Link href="/green">GREEN Papers</Link><Link href="/red">RED Books</Link><Link href="/editorial-board">Editorial Board</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link><span className="navTagline">“Knowledge for a Better Tomorrow”</span></div></nav>
  </>
}

export function Footer(){
  return <footer className="footer"><div className="container"><div className="footerGrid">
    <div className="footerBrand"><img src="/ired-header-logo.webp?v=5" alt="IRED"/><p>Institute of Research Education and Development</p><p>Ahmedabad, Gujarat, India</p></div>
    <div><h3>Quick Links</h3><Link href="/">Home</Link><Link href="/about">About IRED</Link><Link href="/green">GREEN Papers</Link><Link href="/red">RED Books</Link></div>
    <div><h3>Other Links</h3><Link href="/editorial-board">Editorial Board</Link><Link href="/author-guidelines">Author Guidelines</Link><Link href="/publication-ethics">Publication Ethics</Link><Link href="/archives">Archives</Link><Link href="/contact">Contact Us</Link></div>
    <div><h3>Contact Us</h3><p>A-3, 3rd Floor, Gita Apartment,<br/>Nr. Hirabaug Crossing, Ambawadi,<br/>Ahmedabad-380015</p><p>☎ 7383000930 · 7203998343</p><p>✉ ired.foundation@gmail.com</p><div className="socials"><span>f</span><span>in</span><span>▶</span></div></div>
    <div className="footerMotto">Knowledge<br/>for a Better Tomorrow</div>
  </div><div className="copy"><span>© 2026 Institute of Research Education and Development (IRED). All rights reserved.</span><span>Privacy Policy&nbsp;&nbsp;|&nbsp;&nbsp;Terms of Use&nbsp;&nbsp;|&nbsp;&nbsp;Sitemap</span></div></div></footer>
}
