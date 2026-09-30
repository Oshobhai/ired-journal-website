import Link from 'next/link'
import {Header,Footer,JournalTitle} from '../components'
import {getContactSettings,IRED_EMAILS} from '@/lib/contact-settings'
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
        <p style={{fontSize:12.5,color:'#607080',margin:'7px 0 0',maxWidth:850}}>Official journal titles, publishing body, publisher details, journal particulars, editorial information and institutional contact details of the {settings.institution_name} ({settings.institution_short_name}).</p>
      </div>
    </section>

    <main className="container" style={{padding:'22px 0 36px'}}>
      <section className="contentCard" style={{borderTop:'4px solid #0b2d4e'}}>
        <h2 style={{marginTop:0}}>Publishing Body & Publisher Details</h2>
        <p><strong>Publishing Body:</strong> {settings.publisher_name}</p>
        <p><strong>Publisher:</strong> {settings.publisher_name}</p>
        <p><strong>Organization:</strong> Academic and research-oriented organization located in Ahmedabad, Gujarat, India.</p>
        <p><strong>Registration:</strong> Approved by the Charity Commissioner, Ahmedabad, Government of Gujarat, under the Mumbai Public Trusts Act, 1950, Registration No. {contact.registration_no}.</p>
        <p><strong>Institute Address:</strong> {settings.official_address}</p>
        <p><strong>Journal / Editorial Office:</strong> {settings.journal_office_address}</p>
        <p><strong>Phone:</strong> {phones}</p>
        <p><strong>Primary Contact Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
        <p><strong>Secondary Contact Email:</strong> <a href={`mailto:${contact.secondary_email}`}>{contact.secondary_email}</a></p>
      </section>

      <section className="contentCard" style={{borderTop:'4px solid #148444'}}>
        <img src="/api/brand/green_logo" alt={settings.green_title} style={journalLogoStyle}/>
        <div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#148444',marginTop:8}}>Official Journal Title</div>
        <h2><JournalTitle kind="green" title={settings.green_title} size={22}/></h2>
        <p>{settings.green_description}</p>

        <div style={{marginTop:18,border:'1px solid #dbe7df',background:'#f8fcf9'}}>
          <div style={{padding:'9px 12px',background:'#edf7f0',borderBottom:'1px solid #dbe7df',fontSize:11,fontWeight:800,color:'#126f3a',letterSpacing:'.06em',textTransform:'uppercase'}}>GREEN Journal Particulars</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))'}}>
            {[
              ['Title',settings.green_title],
              ['ISSN / e-ISSN',contact.green_issn],
              ['Publication Format',settings.green_format],
              ['Starting Year',String(settings.first_volume_year)],
              ['Subject',settings.green_subject],
              ['Language',settings.green_language],
              ['Frequency',settings.green_frequency],
              ['Submission Status',settings.submission_status],
              ['Publisher',settings.publisher_name],
              ['Editor in Chief',settings.green_editor_in_chief],
            ].filter(([,value])=>Boolean(value)).map(([label,value])=><div key={label} style={{padding:'10px 12px',borderBottom:'1px solid #edf1ee',fontSize:11.5,lineHeight:1.55}}><strong style={{display:'block',fontSize:9.5,textTransform:'uppercase',letterSpacing:'.05em',color:'#65766b',marginBottom:2}}>{label}</strong>{label==='Title'?<JournalTitle kind="green" title={String(value)} size={12}/>:value}</div>)}
          </div>
        </div>

        <h3 style={{fontFamily:'Georgia,serif',color:'#0b2d4e',margin:'18px 0 6px'}}>Aims & Scope</h3>
        <p style={{marginTop:0}}>{settings.green_scope}</p>
        <p><strong>Institute Address:</strong> {settings.official_address}</p>
        <p><strong>Journal / Editorial Office:</strong> {settings.journal_office_address}</p>
        <p><strong>Primary Contact Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
        <p><strong>Secondary Contact Email:</strong> <a href={`mailto:${contact.secondary_email}`}>{contact.secondary_email}</a></p>
        <p><strong>Manuscript Submission Email:</strong> <a href={`mailto:${IRED_EMAILS.greenSubmission}`}>{IRED_EMAILS.greenSubmission}</a></p>

        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
          <Link className="btn btnGreen compact" href="/green">View GREEN Research Papers</Link>
          <Link className="btn btnOutline compact" href="/archives">Archives</Link>
          <Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link>
          <Link className="btn btnOutline compact" href="/author-guidelines">Author Guidelines & Submission</Link>
          <Link className="btn btnOutline compact" href="/publication-ethics">Review, Ethics & Plagiarism Policy</Link>
        </div>
      </section>

      <section className="contentCard" style={{borderTop:'4px solid #cb2528'}}>
        <img src="/api/brand/red_logo" alt={settings.red_title} style={journalLogoStyle}/>
        <div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#b32328',marginTop:8}}>Official Publication Title</div>
        <h2><JournalTitle kind="red" title={settings.red_title} size={22}/></h2>
        <p>{settings.red_description}</p>
        <p><strong>ISSN:</strong> {contact.red_eissn}</p>
        <p><strong>Publication Mode:</strong> Print Publication</p>
        <p><strong>Scope:</strong> {settings.red_scope}</p>
        <p><strong>Published By:</strong> {settings.publisher_name}</p>
        <p><strong>Institute Address:</strong> {settings.official_address}</p>
        <p><strong>Journal / Editorial Office:</strong> {settings.journal_office_address}</p>
        <p><strong>Primary Contact Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
        <p><strong>Secondary Contact Email:</strong> <a href={`mailto:${contact.secondary_email}`}>{contact.secondary_email}</a></p>
        <p><strong>Manuscript Submission Email:</strong> <a href={`mailto:${IRED_EMAILS.redSubmission}`}>{IRED_EMAILS.redSubmission}</a></p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
          <Link className="btn btnRed compact" href="/red">View RED Publications</Link>
        </div>
      </section>
    </main>
    <Footer/>
  </>
}
