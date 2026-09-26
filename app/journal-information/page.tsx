import Link from 'next/link'
import {Header,Footer} from '../components'
import {getContactSettings} from '@/lib/contact-settings'
import {getSiteSettings} from '@/lib/site-settings'

const journalLogoStyle={
  display:'block',
  width:260,
  maxWidth:'100%',
  height:120,
  objectFit:'contain',
  objectPosition:'left center',
  margin:0,
} as const

export default async function JournalInformation(){
  const [contact,settings]=await Promise.all([getContactSettings(),getSiteSettings()])
  const phones=[contact.phone_primary,contact.phone_secondary].filter(Boolean).join(' | ')
  return <>
    <Header/>
    <section className="pageHero">
      <div className="container">
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:4}}>Official Publication Record</div>
        <h1>Journal Information</h1>
        <p style={{fontSize:12.5,color:'#607080',margin:'7px 0 0',maxWidth:850}}>Official journal titles, publishing body, publisher details, editorial information and institutional contact details of the {settings.institution_name} ({settings.institution_short_name}).</p>
      </div>
    </section>

    <main className="container" style={{padding:'22px 0 36px'}}>
      <section className="contentCard" style={{borderTop:'4px solid #0b2d4e'}}>
        <h2 style={{marginTop:0}}>Publishing Body & Publisher Details</h2>
        <p><strong>Publishing Body:</strong> {settings.publisher_name}</p>
        <p><strong>Publisher:</strong> {settings.publisher_name}</p>
        <p><strong>Organization:</strong> Academic and research-oriented organization located in Ahmedabad, Gujarat, India.</p>
        <p><strong>Registration:</strong> Approved by the Charity Commissioner, Ahmedabad, Government of Gujarat, under the Mumbai Public Trusts Act, 1950, Registration No. {contact.registration_no}.</p>
        <p><strong>Official Address:</strong> {settings.official_address}</p>
        <p><strong>Phone:</strong> {phones}</p>
        <p><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
      </section>

      <section className="contentCard" style={{borderTop:'4px solid #148444'}}>
        <img src="/api/brand/green_logo" alt={settings.green_title} style={journalLogoStyle}/>
        <div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#148444',marginTop:8}}>Official Journal Title</div>
        <h2>{settings.green_title}</h2>
        <p>{settings.green_description}</p>
        <p><strong>ISSN:</strong> {contact.green_issn}</p>
        <p><strong>Journal Type:</strong> International · Peer-reviewed · Open-access · Multidisciplinary</p>
        <p><strong>Scope:</strong> {settings.green_scope}</p>
        <p><strong>Published By:</strong> {settings.publisher_name}</p>
        <p><strong>Editor in Chief:</strong> {settings.green_editor_in_chief}</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
          <Link className="btn btnGreen compact" href="/green">View GREEN Publications</Link>
          <Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link>
          <Link className="btn btnOutline compact" href="/author-guidelines">Author Guidelines</Link>
        </div>
      </section>

      <section className="contentCard" style={{borderTop:'4px solid #cb2528'}}>
        <img src="/api/brand/red_logo" alt={settings.red_title} style={journalLogoStyle}/>
        <div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#b32328',marginTop:8}}>Official Journal Title</div>
        <h2>{settings.red_title}</h2>
        <p>{settings.red_description}</p>
        <p><strong>e-ISSN:</strong> {contact.red_eissn}</p>
        <p><strong>Publication Mode:</strong> Electronic research journal</p>
        <p><strong>Scope:</strong> {settings.red_scope}</p>
        <p><strong>Published By:</strong> {settings.publisher_name}</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
          <Link className="btn btnRed compact" href="/red">View RED Publications</Link>
          <Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link>
        </div>
      </section>
    </main>
    <Footer/>
  </>
}
