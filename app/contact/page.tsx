import {Header,Footer} from '../components';
import {getContactSettings} from '@/lib/contact-settings';

function mailto(email:string,subject:string,body:string){
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function gmailCompose(email:string,subject:string,body:string){
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Icon({name,color='#496071'}:{name:'institution'|'location'|'phone'|'email'|'paper'|'book'|'check'|'thread',color?:string}){
  const common={width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:color,strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true};
  if(name==='institution') return <svg {...common}><path d="M3 10h18"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M2 20h20"/><path d="M12 3 3 8h18l-9-5Z"/></svg>;
  if(name==='location') return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
  if(name==='phone') return <svg {...common}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9Z"/></svg>;
  if(name==='email') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
  if(name==='paper') return <svg {...common}><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>;
  if(name==='book') return <svg {...common}><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H11v18H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M20 4.5A2.5 2.5 0 0 0 17.5 2H13v18h4.5A2.5 2.5 0 0 1 20 22Z"/></svg>;
  if(name==='check') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
  return <svg {...common}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 8h8M8 12h5"/></svg>;
}

function InfoRow({icon,label,children}:{icon:'institution'|'location'|'phone'|'email',label:string,children:React.ReactNode}){
  return <div style={{display:'grid',gridTemplateColumns:'28px 150px 1fr',alignItems:'start',gap:10,padding:'8px 0'}}><span style={{paddingTop:1}}><Icon name={icon}/></span><strong style={{fontSize:11.5,color:'#516272'}}>{label}</strong><div style={{fontSize:12,lineHeight:1.6,color:'#31475a'}}>{children}</div></div>;
}

export default async function Contact(){
  const contact=await getContactSettings();
  const phones=[contact.phone_primary,contact.phone_secondary].filter(Boolean).join(' | ');
  const greenBody=`Dear IRED Editorial Office,\n\nPlease consider the attached manuscript for GREEN: The Research Journal.\n\nAuthor Name:\nPaper Title:\nMobile Number:\nAffiliation / Institution:\nEmail:\n\nThe manuscript is attached in DOCX/PDF format.\n\nRegards,`;
  const redBody=`Dear IRED Editorial Office,\n\nPlease consider the attached manuscript for RED: The Research Journal compiled print volume.\n\nAuthor Name:\nPaper Title:\nMobile Number:\nEmail:\nAffiliation / Institution:\n\nPostal Address for Printed Copy\nFull Postal Address:\nCity / District:\nState:\nPIN Code:\n\nThe manuscript is attached in DOCX/PDF format.\n\nRegards,`;

  const th={padding:'10px 12px',borderBottom:'1px solid #cfd8df',fontSize:11,fontWeight:700,color:'#3d5062',textAlign:'left'} as const;
  const td={padding:'12px',borderBottom:'1px solid #e1e6ea',fontSize:11.5,lineHeight:1.55,color:'#425466',verticalAlign:'top'} as const;

  return <><Header/>
    <section className="pageHero" style={{padding:'30px 0'}}><div className="container">
      <div style={{display:'flex',alignItems:'center',gap:11}}><span style={{width:36,height:36,border:'1px solid #c9d5de',background:'#fff',display:'grid',placeItems:'center',borderRadius:'50%'}}><Icon name="institution" color="#0b2d4e"/></span><div><h1 style={{fontSize:34,margin:0}}>Contact & Manuscript Submission</h1><p style={{fontFamily:'Georgia,serif',fontSize:13,color:'#607080',margin:'5px 0 0'}}>Institute of Research Education and Development (IRED)</p></div></div>
    </div></section>

    <main className="container" style={{padding:'24px 0 32px'}}>
      <div style={{maxWidth:1040,margin:'0 auto'}}>
        <section style={{paddingBottom:20,borderBottom:'1px solid #cfd8df'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:'0 0 8px'}}>Editorial Office</h2>
          <InfoRow icon="institution" label="Institution">Institute of Research Education and Development (IRED)</InfoRow>
          <InfoRow icon="location" label="Address">A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India</InfoRow>
          <InfoRow icon="phone" label="Telephone">{phones}</InfoRow>
          <InfoRow icon="email" label="Editorial Email"><a href={mailto(contact.email,'','')} style={{color:'#0c6298',fontWeight:700}}>{contact.email}</a></InfoRow>
        </section>

        <section style={{padding:'22px 0 18px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><Icon name="paper" color="#0b2d4e"/><h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:0}}>Manuscript Submission by Email</h2></div>
          <p style={{fontSize:12.5,lineHeight:1.7,color:'#445565',margin:'0 0 8px',maxWidth:900}}>Authors should send manuscripts directly to the IRED Editorial Office by email. Please attach the research paper in <strong>DOCX or PDF format</strong> and include the information listed below for the appropriate publication.</p>
          <p style={{fontSize:11,color:'#6a7885',margin:'0'}}>The GREEN and RED submission links open Gmail in a new browser tab with the current IRED editorial email, subject and submission details already prepared. Add the manuscript attachment before sending.</p>
        </section>

        <section style={{borderTop:'2px solid #0b2d4e',borderBottom:'1px solid #cfd8df'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f5f7f8'}}>
              <th style={{...th,width:'19%'}}>Publication</th><th style={{...th,width:'35%'}}>Submission Type</th><th style={{...th,width:'31%'}}>Information Required</th><th style={{...th,width:'15%',textAlign:'right'}}>Submission</th>
            </tr></thead>
            <tbody>
              <tr><td style={td}><div style={{display:'flex',alignItems:'center',gap:7}}><Icon name="paper" color="#148444"/><div><strong style={{fontFamily:'Georgia,serif',fontSize:16,color:'#148444'}}>GREEN</strong><div style={{fontSize:10,color:'#718078',marginTop:2}}>The Research Journal</div></div></div></td><td style={td}>Individual research papers, research articles, review articles, case studies and scholarly contributions.</td><td style={td}>Author name, paper title, mobile number, affiliation / institution and email address.</td><td style={{...td,textAlign:'right'}}><a href={gmailCompose(contact.email,'GREEN Research Paper Submission',greenBody)} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,fontWeight:700,color:'#126f3a',whiteSpace:'nowrap'}}><Icon name="email" color="#126f3a"/> Email Paper →</a></td></tr>
              <tr><td style={td}><div style={{display:'flex',alignItems:'center',gap:7}}><Icon name="book" color="#bd2025"/><div><strong style={{fontFamily:'Georgia,serif',fontSize:16,color:'#bd2025'}}>RED</strong><div style={{fontSize:10,color:'#806e6f',marginTop:2}}>The Research Journal</div></div></div></td><td style={td}>Research papers considered for inclusion in a compiled RED research book / printed volume.</td><td style={td}>Author details, mobile number, email, affiliation, full postal address, city / district, state and PIN code.</td><td style={{...td,textAlign:'right'}}><a href={gmailCompose(contact.email,'RED Research Journal Submission',redBody)} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,fontWeight:700,color:'#a61d22',whiteSpace:'nowrap'}}><Icon name="email" color="#a61d22"/> Email Paper →</a></td></tr>
            </tbody>
          </table>
        </section>

        <section style={{paddingTop:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:36}}>
          <div style={{display:'grid',gridTemplateColumns:'28px 1fr',gap:9}}><Icon name="check" color="#8b6d2f"/><div><h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 7px'}}>Before Sending</h3><p style={{fontSize:11.5,lineHeight:1.65,color:'#526273',margin:0}}>Please verify the manuscript file, paper title, author name and contact details. For RED submissions, complete postal information is required when a printed copy is to be dispatched.</p></div></div>
          <div style={{display:'grid',gridTemplateColumns:'28px 1fr',gap:9}}><Icon name="thread" color="#8b6d2f"/><div><h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 7px'}}>Editorial Correspondence</h3><p style={{fontSize:11.5,lineHeight:1.65,color:'#526273',margin:0}}>After submission, please continue correspondence through the same email thread so that review comments, revisions and publication communication remain together.</p></div></div>
        </section>
      </div>
    </main>
    <Footer/>
  </>;
}
