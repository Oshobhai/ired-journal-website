import Link from 'next/link'
import {Header,Footer} from '../components'

export default function JournalInformation(){
  return <>
    <Header/>
    <section className="pageHero">
      <div className="container">
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:4}}>Official Publication Record</div>
        <h1>Journal Information</h1>
        <p style={{fontSize:12.5,color:'#607080',margin:'7px 0 0',maxWidth:850}}>Official journal titles, publishing body, publisher details, editorial information and institutional contact details of the Institute of Research Education and Development (IRED).</p>
      </div>
    </section>

    <main className="container" style={{padding:'22px 0 36px'}}>
      <section className="contentCard" style={{borderTop:'4px solid #0b2d4e'}}>
        <h2 style={{marginTop:0}}>Publishing Body & Publisher Details</h2>
        <p><strong>Publishing Body:</strong> Institute of Research Education and Development (IRED)</p>
        <p><strong>Publisher:</strong> Institute of Research Education and Development (IRED)</p>
        <p><strong>Organization:</strong> Academic and research-oriented organization located in Ahmedabad, Gujarat, India.</p>
        <p><strong>Registration:</strong> Approved by the Charity Commissioner, Ahmedabad, Government of Gujarat, under the Mumbai Public Trusts Act, 1950, Registration No. GUJ/15856/AHMEDABAD.</p>
        <p><strong>Official Address:</strong> A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.</p>
        <p><strong>Phone:</strong> 7383000930 | 7203998343</p>
        <p><strong>Email:</strong> <a href="mailto:ired.foundation@gmail.com">ired.foundation@gmail.com</a></p>
      </section>

      <section className="contentCard" style={{borderTop:'4px solid #148444'}}>
        <img src="/green-logo.png?v=2" alt="GREEN: The Research Journal" style={{width:240,maxWidth:'100%',height:75,objectFit:'contain'}}/>
        <div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#148444',marginTop:8}}>Official Journal Title</div>
        <h2>GREEN: The Research Journal</h2>
        <p>GREEN: The Research Journal is an international, peer-reviewed, open-access research journal that provides a platform for researchers, faculty members, academicians, and students to publish original and unpublished research papers and scholarly articles.</p>
        <p><strong>Journal Type:</strong> International · Peer-reviewed · Open-access · Multidisciplinary</p>
        <p><strong>Scope:</strong> Accounting, Archaeology, Biology, Business, Chemistry, Commerce, Economics, Education, Law, Linguistics, Management, Physics, Political Science, Social Work, Arts, Humanities, Sciences, Social Sciences and related academic disciplines.</p>
        <p><strong>Published By:</strong> Institute of Research Education and Development (IRED)</p>
        <p><strong>Editor in Chief:</strong> Dr. Bhavika Kadikar — Librarian and Assistant Professor, Surendranagar University, Wadhwan</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
          <Link className="btn btnGreen compact" href="/green">View GREEN Publications</Link>
          <Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link>
          <Link className="btn btnOutline compact" href="/author-guidelines">Author Guidelines</Link>
        </div>
      </section>

      <section className="contentCard" style={{borderTop:'4px solid #cb2528'}}>
        <img className="redJournalLogo" src="/red-logo-official.svg?v=1" alt="RED: The Research Journal e-Journal — Online Scholarly Publication" style={{width:300,maxWidth:'100%',height:'auto',objectFit:'contain'}}/>
        <div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#b32328',marginTop:8}}>Official Journal Title</div>
        <h2>RED: The Research Journal e-Journal</h2>
        <p>RED: The Research Journal e-Journal is an electronic research journal published by IRED with the objective of promoting the online dissemination of scholarly and research-based knowledge.</p>
        <p><strong>Publication Mode:</strong> Electronic research journal</p>
        <p><strong>Scope:</strong> Multidisciplinary research across Arts, Humanities, Sciences, Social Sciences, Commerce, Education, Management, Law and other academic disciplines.</p>
        <p><strong>Published By:</strong> Institute of Research Education and Development (IRED)</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
          <Link className="btn btnRed compact" href="/red">View RED Publications</Link>
          <Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link>
        </div>
      </section>
    </main>
    <Footer/>
  </>
}
