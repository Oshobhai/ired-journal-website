import type { Metadata } from 'next'
import Link from 'next/link'
import {Header,Footer} from '../components'

export const metadata:Metadata={
  title:'Journal Information',
  description:'Official journal, publisher, publishing body, editorial and contact information for IRED research journals.',
  alternates:{canonical:'/journal-information'},
}

const detailStyle={display:'grid',gridTemplateColumns:'180px minmax(0,1fr)',gap:12,padding:'10px 0',borderTop:'1px solid #e3e8ec',fontSize:12,lineHeight:1.6} as const

export default function JournalInformation(){
  return <><Header/>
    <section className="pageHero"><div className="container"><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:4}}>Official Publication Record</div><h1>Journal Information</h1><p style={{fontSize:12.5,color:'#607080',margin:'7px 0 0',maxWidth:850}}>Official journal titles, publishing body, publisher details, editorial information and institutional contact details of the Institute of Research Education and Development (IRED).</p></div></section>
    <main className="container" style={{padding:'22px 0 36px'}}>
      <section className="contentCard" style={{borderTop:'4px solid #0b2d4e'}}>
        <h2 style={{marginTop:0}}>Publishing Body & Publisher Details</h2>
        <div style={detailStyle}><strong>Publishing Body</strong><span>Institute of Research Education and Development (IRED)</span></div>
        <div style={detailStyle}><strong>Publisher</strong><span>Institute of Research Education and Development (IRED)</span></div>
        <div style={detailStyle}><strong>Organization</strong><span>Academic and research-oriented organization located in Ahmedabad, Gujarat, India.</span></div>
        <div style={detailStyle}><strong>Registration</strong><span>Approved by the Charity Commissioner, Ahmedabad, Government of Gujarat, under the Mumbai Public Trusts Act, 1950, Registration No. GUJ/15856/AHMEDABAD.</span></div>
        <div style={detailStyle}><strong>Official Address</strong><span>A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.</span></div>
        <div style={detailStyle}><strong>Phone</strong><span>7383000930 | 7203998343</span></div>
        <div style={detailStyle}><strong>Email</strong><a href="mailto:ired.foundation@gmail.com" style={{color:'#0b5f91',fontWeight:700}}>ired.foundation@gmail.com</a></div>
      </section>

      <section className="contentCard" style={{borderTop:'4px solid #148444'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:18,flexWrap:'wrap'}}><div><div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#148444'}}>Official Journal Title</div><h2 style={{margin:'4px 0 6px'}}>GREEN: The Research Journal</h2></div><img src="/green-logo.png?v=2" alt="GREEN: The Research Journal" style={{width:240,maxWidth:'100%',height:75,objectFit:'contain'}}/></div>
        <p style={{fontSize:12.5,lineHeight:1.7,color:'#485b6b'}}>GREEN: The Research Journal is an international, peer-reviewed, open-access research journal that provides a platform for researchers, faculty members, academicians, and students to publish original and unpublished research papers and scholarly articles.</p>
        <div style={detailStyle}><strong>Journal Type</strong><span>International · Peer-reviewed · Open-access · Multidisciplinary</span></div>
        <div style={detailStyle}><strong>Scope</strong><span>Accounting, Archaeology, Biology, Business, Chemistry, Commerce, Economics, Education, Law, Linguistics, Management, Physics, Political Science, Social Work, Arts, Humanities, Sciences, Social Sciences and related academic disciplines.</span></div>
        <div style={detailStyle}><strong>Published By</strong><span>Institute of Research Education and Development (IRED)</span></div>
        <div style={detailStyle}><strong>Editor in Chief</strong><span>Dr. Bhavika Kadikar — Librarian and Assistant Professor, Surendranagar University, Wadhwan</span></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}><Link className="btn btnGreen compact" href="/green">View GREEN Publications</Link><Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link><Link className="btn btnOutline compact" href="/author-guidelines">Author Guidelines</Link></div>
      </section>

      <section className="contentCard" style={{borderTop:'4px solid #cb2528'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:18,flexWrap:'wrap'}}><div><div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#b32328'}}>Official Journal Title</div><h2 style={{margin:'4px 0 6px'}}>RED: The Research Journal e-Journal</h2></div><img src="/red-logo.png?v=4" alt="RED: The Research Journal e-Journal" style={{width:240,maxWidth:'100%',height:75,objectFit:'contain'}}/></div>
        <p style={{fontSize:12.5,lineHeight:1.7,color:'#485b6b'}}>RED: The Research Journal e-Journal is an electronic research journal published by IRED with the objective of promoting the online dissemination of scholarly and research-based knowledge.</p>
        <div style={detailStyle}><strong>Publication Mode</strong><span>Electronic research journal</span></div>
        <div style={detailStyle}><strong>Scope</strong><span>Multidisciplinary research across Arts, Humanities, Sciences, Social Sciences, Commerce, Education, Management, Law and other academic disciplines.</span></div>
        <div style={detailStyle}><strong>Published By</strong><span>Institute of Research Education and Development (IRED)</span></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}><Link className="btn btnRed compact" href="/red">View RED Publications</Link><Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link></div>
      </section>

      <section style={{padding:'15px 18px',background:'#f7f9fb',border:'1px solid #dbe3e9',borderLeft:'4px solid #8b6d2f',fontSize:11.5,lineHeight:1.7,color:'#5b6b79'}}><strong style={{color:'#0b2d4e'}}>Institutional statement:</strong> IRED is committed to promoting research, education, academic development and the exchange of knowledge, and supports dissemination of research through print and digital publications.</section>
    </main><Footer/></>
  </>
}
