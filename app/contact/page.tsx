import {Header,Footer} from '../components';

const email='ired.foundation@gmail.com';

function mailto(subject:string,body:string){
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact(){
  const greenBody=`Dear IRED Editorial Office,\n\nPlease consider the attached manuscript for GREEN: The Research Journal.\n\nAuthor Name:\nPaper Title:\nMobile Number:\nAffiliation / Institution:\nEmail:\n\nThe manuscript is attached in DOCX/PDF format.\n\nRegards,`;
  const redBody=`Dear IRED Editorial Office,\n\nPlease consider the attached manuscript for RED: The Research Journal compiled print volume.\n\nAuthor Name:\nPaper Title:\nMobile Number:\nEmail:\nAffiliation / Institution:\n\nPostal Address for Printed Copy\nFull Postal Address:\nCity / District:\nState:\nPIN Code:\n\nThe manuscript is attached in DOCX/PDF format.\n\nRegards,`;

  const th={padding:'10px 12px',borderBottom:'1px solid #cfd8df',fontSize:11,fontWeight:700,color:'#3d5062',textAlign:'left'} as const;
  const td={padding:'12px',borderBottom:'1px solid #e1e6ea',fontSize:11.5,lineHeight:1.55,color:'#425466',verticalAlign:'top'} as const;

  return <><Header/>
    <section className="pageHero" style={{padding:'30px 0'}}><div className="container">
      <h1 style={{fontSize:34}}>Contact & Manuscript Submission</h1>
      <p style={{fontFamily:'Georgia,serif',fontSize:13,color:'#607080',margin:'7px 0 0'}}>Institute of Research Education and Development (IRED)</p>
    </div></section>

    <main className="container" style={{padding:'24px 0 32px'}}>
      <div style={{maxWidth:1040,margin:'0 auto'}}>
        <section style={{paddingBottom:22,borderBottom:'1px solid #cfd8df'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:'0 0 12px'}}>Editorial Office</h2>
          <div style={{display:'grid',gridTemplateColumns:'160px 1fr',rowGap:9,columnGap:20,fontSize:12,lineHeight:1.6}}>
            <strong style={{color:'#516272'}}>Institution</strong><span>Institute of Research Education and Development (IRED)</span>
            <strong style={{color:'#516272'}}>Address</strong><span>A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India</span>
            <strong style={{color:'#516272'}}>Telephone</strong><span>7383000930 &nbsp;|&nbsp; 7203998343</span>
            <strong style={{color:'#516272'}}>Editorial Email</strong><a href={`mailto:${email}`} style={{color:'#0c6298',fontWeight:700}}>ired.foundation@gmail.com</a>
          </div>
        </section>

        <section style={{padding:'22px 0 18px'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:'0 0 9px'}}>Manuscript Submission by Email</h2>
          <p style={{fontSize:12.5,lineHeight:1.7,color:'#445565',margin:'0 0 8px',maxWidth:900}}>Authors should send manuscripts directly to the IRED Editorial Office by email. Please attach the research paper in <strong>DOCX or PDF format</strong> and include the information listed below for the appropriate publication.</p>
          <p style={{fontSize:11,color:'#6a7885',margin:'0'}}>The website opens a prepared email draft; the manuscript attachment must be added by the author in the email application before sending.</p>
        </section>

        <section style={{borderTop:'2px solid #0b2d4e',borderBottom:'1px solid #cfd8df'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f5f7f8'}}>
              <th style={{...th,width:'19%'}}>Publication</th>
              <th style={{...th,width:'35%'}}>Submission Type</th>
              <th style={{...th,width:'31%'}}>Information Required</th>
              <th style={{...th,width:'15%',textAlign:'right'}}>Submission</th>
            </tr></thead>
            <tbody>
              <tr>
                <td style={td}><strong style={{fontFamily:'Georgia,serif',fontSize:16,color:'#148444'}}>GREEN</strong><div style={{fontSize:10,color:'#718078',marginTop:2}}>The Research Journal</div></td>
                <td style={td}>Individual research papers, research articles, review articles, case studies and scholarly contributions.</td>
                <td style={td}>Author name, paper title, mobile number, affiliation / institution and email address.</td>
                <td style={{...td,textAlign:'right'}}><a href={mailto('GREEN Research Paper Submission',greenBody)} style={{fontWeight:700,color:'#126f3a',whiteSpace:'nowrap'}}>Email Paper →</a></td>
              </tr>
              <tr>
                <td style={td}><strong style={{fontFamily:'Georgia,serif',fontSize:16,color:'#bd2025'}}>RED</strong><div style={{fontSize:10,color:'#806e6f',marginTop:2}}>The Research Journal</div></td>
                <td style={td}>Research papers considered for inclusion in a compiled RED research book / printed volume.</td>
                <td style={td}>Author details, mobile number, email, affiliation, full postal address, city / district, state and PIN code.</td>
                <td style={{...td,textAlign:'right'}}><a href={mailto('RED Research Journal Submission',redBody)} style={{fontWeight:700,color:'#a61d22',whiteSpace:'nowrap'}}>Email Paper →</a></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{paddingTop:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:36}}>
          <div>
            <h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 7px'}}>Before Sending</h3>
            <p style={{fontSize:11.5,lineHeight:1.65,color:'#526273',margin:0}}>Please verify the manuscript file, paper title, author name and contact details. For RED submissions, complete postal information is required when a printed copy is to be dispatched.</p>
          </div>
          <div>
            <h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 7px'}}>Editorial Correspondence</h3>
            <p style={{fontSize:11.5,lineHeight:1.65,color:'#526273',margin:0}}>After submission, please continue correspondence through the same email thread so that review comments, revisions and publication communication remain together.</p>
          </div>
        </section>
      </div>
    </main>
    <Footer/>
  </>;
}
