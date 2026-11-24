import Link from 'next/link';
import {Header,Footer,JournalTitle} from '../components';
import {getSiteSettings} from '@/lib/site-settings';
import {getContactSettings} from '@/lib/contact-settings';

function SectionIcon({type}:{type:'institution'|'purpose'|'journal'|'commitment'|'location'}){
  const common={width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true};
  if(type==='institution')return <svg {...common}><path d="M3 10h18"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M2 20h20"/><path d="M12 3 3 8h18l-9-5Z"/></svg>;
  if(type==='purpose')return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m15 9 5-5"/></svg>;
  if(type==='journal')return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 5.5v16M8 7h8M8 11h8"/></svg>;
  if(type==='location')return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
  return <svg {...common}><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
}

function SectionHeading({icon,title,kicker}:{icon:'institution'|'purpose'|'journal'|'commitment'|'location';title:string;kicker:string}){
  return <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
    <span style={{width:36,height:36,borderRadius:7,display:'grid',placeItems:'center',background:'#eef4f8',border:'1px solid #d6e0e7',color:'#173d60',flex:'0 0 auto'}}><SectionIcon type={icon}/></span>
    <div><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#75828d',marginBottom:2}}>{kicker}</div><h2 style={{fontFamily:'Georgia,serif',fontSize:22,color:'#0b2d4e',margin:0}}>{title}</h2></div>
  </div>;
}

export default async function About(){
  const [settings,contact]=await Promise.all([getSiteSettings(),getContactSettings()]);

  return <>
    <Header/>

    <section className="pageHero" style={{padding:'32px 0 30px'}}>
      <div className="container">
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:4}}>Institutional Profile</div>
        <h1 style={{margin:0}}>About {settings.institution_short_name}</h1>
        <p style={{maxWidth:900,fontSize:12.5,lineHeight:1.7,color:'#5d6c79',margin:'9px 0 0'}}>
          The {settings.institution_name} ({settings.institution_short_name}) is an academic and research-oriented organization based in Ahmedabad, Gujarat, India, engaged in research dissemination, academic development and scholarly publication.
        </p>
      </div>
    </section>

    <main className="container" style={{padding:'24px 0 38px'}}>

      <section style={{display:'grid',gridTemplateColumns:'minmax(0,1.35fr) minmax(280px,.65fr)',gap:18,alignItems:'stretch',marginBottom:20}}>
        <article style={{border:'1px solid #d8e1e7',borderTop:'4px solid #173d60',background:'#fff',padding:'22px 24px',borderRadius:6}}>
          <SectionHeading icon="institution" kicker="Who We Are" title={settings.publisher_name}/>
          <p style={{fontSize:13,lineHeight:1.75,color:'#455969',margin:'0 0 12px'}}>
            {settings.publisher_name} provides an institutional platform for researchers, academicians, teachers, students and professionals to communicate original research, scholarly analysis and academic ideas across disciplines.
          </p>
          <p style={{fontSize:13,lineHeight:1.75,color:'#455969',margin:0}}>
            The Institute supports research, education, academic exchange and the responsible dissemination of knowledge through its publication activities and related scholarly initiatives.
          </p>
        </article>

        <aside style={{border:'1px solid #d8e1e7',background:'#f7f9fb',padding:'20px',borderRadius:6}}>
          <div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#6f7d89',marginBottom:12}}>Institutional Record</div>
          <div style={{display:'grid',gap:12}}>
            <div><div style={{fontSize:9.5,fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em',color:'#788691',marginBottom:3}}>Registration No.</div><div style={{fontSize:12.5,fontWeight:800,color:'#173d60'}}>{contact.registration_no}</div></div>
            <div><div style={{fontSize:9.5,fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em',color:'#788691',marginBottom:3}}>Location</div><div style={{fontSize:12,lineHeight:1.6,color:'#4b5d6d'}}>Ahmedabad, Gujarat, India</div></div>
            <div><div style={{fontSize:9.5,fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em',color:'#788691',marginBottom:3}}>Publishing Body & Publisher</div><div style={{fontSize:12,lineHeight:1.6,color:'#4b5d6d'}}>{settings.publisher_name}</div></div>
          </div>
        </aside>
      </section>

      <section style={{border:'1px solid #d8e1e7',background:'#fff',padding:'22px 24px',borderRadius:6,marginBottom:20}}>
        <SectionHeading icon="journal" kicker="Publication Programme" title="IRED Research Journals"/>
        <p style={{fontSize:12.5,lineHeight:1.7,color:'#526273',margin:'0 0 16px',maxWidth:980}}>
          IRED publishes two distinct research journals. Each publication maintains its own format, archive and journal particulars while operating under the same institutional publishing body.
        </p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:14}}>
          <article style={{border:'1px solid #d6e7dc',borderTop:'3px solid #148444',background:'#fbfdfb',padding:'17px 18px',borderRadius:5}}>
            <div style={{marginBottom:8}}><JournalTitle kind="green" title={settings.green_title} size={19}/></div>
            <p style={{fontSize:11.8,lineHeight:1.65,color:'#536473',margin:'0 0 12px'}}>{settings.green_description}</p>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              <Link className="btn btnGreen compact" href="/green">Research Papers</Link>
              <Link className="btn btnOutline compact" href="/archives?type=green">GREEN Archives</Link>
            </div>
          </article>

          <article style={{border:'1px solid #ecd8d9',borderTop:'3px solid #bd2025',background:'#fffafa',padding:'17px 18px',borderRadius:5}}>
            <div style={{marginBottom:8}}><JournalTitle kind="red" title={settings.red_title} size={19}/></div>
            <p style={{fontSize:11.8,lineHeight:1.65,color:'#536473',margin:'0 0 12px'}}>{settings.red_description}</p>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              <Link className="btn btnRed compact" href="/red">Published Publications</Link>
              <Link className="btn btnOutline compact" href="/archives?type=red">RED Archives</Link>
            </div>
          </article>
        </div>

        <div style={{marginTop:15}}>
          <Link href="/journal-information" style={{fontSize:11.5,fontWeight:800,color:'#0b5f91'}}>View official Journal Information, Publisher and Journal Particulars →</Link>
        </div>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16,marginBottom:20}}>
        <article style={{border:'1px solid #dce4e9',background:'#fff',padding:'20px',borderRadius:6}}>
          <SectionHeading icon="purpose" kicker="Purpose" title="Vision"/>
          <p style={{fontSize:12.3,lineHeight:1.72,color:'#4e6070',margin:0}}>
            To strengthen a credible platform for research, academic exchange, education and knowledge development, and to encourage scholarly work that contributes meaningfully to academic disciplines and society.
          </p>
        </article>

        <article style={{border:'1px solid #dce4e9',background:'#fff',padding:'20px',borderRadius:6}}>
          <SectionHeading icon="commitment" kicker="Academic Direction" title="Mission"/>
          <ul style={{margin:'0 0 0 18px',padding:0}}>
            {[
              'Promote original and responsible research.',
              'Encourage multidisciplinary scholarly inquiry.',
              'Support researchers and students in communicating academic work.',
              'Disseminate research through online and print publications.',
              'Strengthen academic interaction across disciplines.',
              'Improve access to useful scholarly knowledge.'
            ].map(item=><li key={item} style={{fontSize:11.8,lineHeight:1.65,color:'#4e6070',marginBottom:5}}>{item}</li>)}
          </ul>
        </article>
      </section>

      <section style={{border:'1px solid #d8e1e7',background:'#f9fbfc',padding:'22px 24px',borderRadius:6,marginBottom:20}}>
        <SectionHeading icon="commitment" kicker="Institutional Standards" title="Our Commitment"/>
        <p style={{fontSize:12.5,lineHeight:1.72,color:'#4c5f70',margin:'0 0 12px'}}>
          IRED is committed to academic integrity, responsible editorial practice, originality, research ethics and transparent scholarly communication. Its journals are intended to provide a structured publication record for research and scholarly contributions.
        </p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Link className="btn btnOutline compact" href="/publication-ethics">Publication Ethics</Link>
          <Link className="btn btnOutline compact" href="/author-guidelines">Author Guidelines</Link>
          <Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link>
          <Link className="btn btnOutline compact" href="/contact">Contact & Submission</Link>
        </div>
      </section>

      <section style={{border:'1px solid #d8e1e7',borderLeft:'4px solid #173d60',background:'#fff',padding:'20px 22px',borderRadius:6}}>
        <SectionHeading icon="location" kicker="Official Contact Points" title="Institutional Addresses"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:18}}>
          <div>
            <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.06em',color:'#637485',marginBottom:5}}>Institute Address</div>
            <div style={{fontSize:12,lineHeight:1.65,color:'#455969'}}>{settings.official_address}</div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.06em',color:'#637485',marginBottom:5}}>Journal / Editorial Office</div>
            <div style={{fontSize:12,lineHeight:1.65,color:'#455969'}}>{settings.journal_office_address}</div>
          </div>
        </div>
        <div style={{borderTop:'1px solid #e1e6ea',marginTop:16,paddingTop:13,display:'flex',gap:'8px 18px',flexWrap:'wrap',fontSize:11.5}}>
          <span><strong>Primary Email:</strong> <a href={"mailto:"+contact.email}>{contact.email}</a></span>
          <span><strong>Secondary Email:</strong> <a href={"mailto:"+contact.secondary_email}>{contact.secondary_email}</a></span>
        </div>
      </section>

    </main>
    <Footer/>
  </>;
}
