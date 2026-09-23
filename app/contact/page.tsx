import {Header,Footer} from '../components';

const email='ired.foundation@gmail.com';

function mailto(subject:string,body:string){
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact(){
  const greenBody=`Dear IRED Editorial Office,\n\nPlease consider the attached manuscript for GREEN: The Research Journal.\n\nAuthor Name:\nPaper Title:\nMobile Number:\nAffiliation / Institution:\nEmail:\n\nThe manuscript is attached in DOCX/PDF format.\n\nRegards,`;
  const redBody=`Dear IRED Editorial Office,\n\nPlease consider the attached manuscript for RED: The Research Journal compiled print volume.\n\nAuthor Name:\nPaper Title:\nMobile Number:\nEmail:\nAffiliation / Institution:\n\nPostal Address for Printed Copy\nFull Postal Address:\nCity / District:\nState:\nPIN Code:\n\nThe manuscript is attached in DOCX/PDF format.\n\nRegards,`;

  const rule={borderTop:'1px solid #d8e0e6'} as const;
  const label={fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#6c7a87'} as const;
  const body={fontSize:12.5,lineHeight:1.7,color:'#3e5061'} as const;

  return <><Header/>
    <main style={{background:'#fff'}}>
      <section style={{borderBottom:'1px solid #d8e0e6'}}>
        <div className="container" style={{padding:'28px 0 24px'}}>
          <div style={{fontSize:10,color:'#768492',marginBottom:8}}>Home / Contact / Manuscript Submission</div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:32,lineHeight:1.12,color:'#0b2d4e',margin:'0 0 8px'}}>Editorial Office & Manuscript Submission</h1>
          <p style={{...body,maxWidth:820,margin:0}}>Authors may submit manuscripts to the Institute of Research Education and Development (IRED) by email. Please select the appropriate publication, complete the requested information, attach the manuscript, and send it to the editorial office.</p>
        </div>
      </section>

      <section className="container" style={{padding:'24px 0 30px'}}>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 300px',gap:34,alignItems:'start'}}>
          <div>
            <section style={{paddingBottom:22}}>
              <div style={label}>Manuscript submission</div>
              <h2 style={{fontFamily:'Georgia,serif',fontSize:22,color:'#163b5b',margin:'5px 0 9px'}}>Submit your research by email</h2>
              <p style={{...body,margin:'0 0 14px'}}>The website does not store author submissions. Manuscripts are sent directly to the IRED editorial email so that communication, review, and any required corrections can be handled through the official correspondence record.</p>
              <div style={{padding:'10px 12px',background:'#f7f9fa',borderLeft:'3px solid #b69744',fontSize:11.5,lineHeight:1.6,color:'#536474'}}>Before sending, attach the manuscript in <strong>DOCX or PDF</strong> format. Email attachments cannot be added automatically by the website.</div>
            </section>

            <section style={{...rule,padding:'20px 0'}}>
              <div style={{display:'grid',gridTemplateColumns:'78px minmax(0,1fr) auto',gap:18,alignItems:'start'}}>
                <div style={{border:'1px solid #cfd9d4',padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontFamily:'Georgia,serif',fontSize:21,fontWeight:700,color:'#148444'}}>GREEN</div>
                  <div style={{fontSize:8.5,lineHeight:1.25,color:'#5c6c64'}}>The Research Journal</div>
                </div>
                <div>
                  <h3 style={{fontFamily:'Georgia,serif',fontSize:18,color:'#12395c',margin:'0 0 5px'}}>Individual Research Paper Submission</h3>
                  <p style={{...body,margin:'0 0 8px'}}>For individual research articles, review articles, case studies, and other scholarly papers intended for GREEN: The Research Journal.</p>
                  <div style={{fontSize:11,color:'#63727f'}}><strong>Include:</strong> Author name · Paper title · Mobile number · Affiliation · Email</div>
                </div>
                <a href={mailto('GREEN Research Paper Submission',greenBody)} style={{display:'inline-block',border:'1px solid #148444',color:'#126d39',padding:'8px 12px',fontSize:11,fontWeight:800,whiteSpace:'nowrap'}}>Email GREEN Paper →</a>
              </div>
            </section>

            <section style={{...rule,padding:'20px 0'}}>
              <div style={{display:'grid',gridTemplateColumns:'78px minmax(0,1fr) auto',gap:18,alignItems:'start'}}>
                <div style={{border:'1px solid #e0cece',padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontFamily:'Georgia,serif',fontSize:21,fontWeight:700,color:'#bd2025'}}>RED</div>
                  <div style={{fontSize:8.5,lineHeight:1.25,color:'#755c5d'}}>The Research Journal</div>
                </div>
                <div>
                  <h3 style={{fontFamily:'Georgia,serif',fontSize:18,color:'#12395c',margin:'0 0 5px'}}>Compiled Print Volume Submission</h3>
                  <p style={{...body,margin:'0 0 8px'}}>For papers considered for inclusion in a compiled RED research book/volume. Postal information is required because printed copies may be dispatched to contributors.</p>
                  <div style={{fontSize:11,color:'#63727f'}}><strong>Include:</strong> Author details · Email · Mobile number · Full postal address · State · PIN code</div>
                </div>
                <a href={mailto('RED Research Journal Submission',redBody)} style={{display:'inline-block',border:'1px solid #bd2025',color:'#a51c22',padding:'8px 12px',fontSize:11,fontWeight:800,whiteSpace:'nowrap'}}>Email RED Paper →</a>
              </div>
            </section>

            <section style={{...rule,paddingTop:20}}>
              <div style={label}>Submission checklist</div>
              <table style={{width:'100%',borderCollapse:'collapse',marginTop:9,fontSize:11.5,color:'#405263'}}>
                <thead><tr style={{background:'#f3f6f8',textAlign:'left'}}><th style={{padding:'8px 10px',border:'1px solid #dce3e8'}}>Requirement</th><th style={{padding:'8px 10px',border:'1px solid #dce3e8'}}>GREEN</th><th style={{padding:'8px 10px',border:'1px solid #dce3e8'}}>RED</th></tr></thead>
                <tbody>
                  <tr><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Manuscript file (DOCX/PDF)</td><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Required</td><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Required</td></tr>
                  <tr><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Author & affiliation details</td><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Required</td><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Required</td></tr>
                  <tr><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Postal address for printed copy</td><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Not required</td><td style={{padding:'8px 10px',border:'1px solid #e1e6ea'}}>Required</td></tr>
                </tbody>
              </table>
            </section>
          </div>

          <aside style={{borderLeft:'1px solid #d8e0e6',paddingLeft:22}}>
            <div style={label}>Editorial office</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:19,color:'#163b5b',margin:'5px 0 13px'}}>Institute of Research Education and Development</h2>

            <div style={{padding:'0 0 14px'}}>
              <div style={label}>Submission email</div>
              <a href={`mailto:${email}`} style={{display:'block',marginTop:5,fontSize:12,fontWeight:800,color:'#0d649c',wordBreak:'break-word'}}>ired.foundation@gmail.com</a>
            </div>

            <div style={{...rule,padding:'14px 0'}}>
              <div style={label}>Telephone</div>
              <div style={{marginTop:5,fontSize:12,lineHeight:1.6,color:'#334a5c'}}>7383000930<br/>7203998343</div>
            </div>

            <div style={{...rule,padding:'14px 0'}}>
              <div style={label}>Postal address</div>
              <address style={{marginTop:5,fontStyle:'normal',fontSize:12,lineHeight:1.65,color:'#334a5c'}}>A-3, 3rd Floor, Gita Apartment<br/>Nr. Hirabaug Crossing, Ambawadi<br/>Ahmedabad-380015<br/>Gujarat, India</address>
            </div>

            <div style={{...rule,paddingTop:14,fontSize:10.5,lineHeight:1.6,color:'#768492'}}>For manuscript-related correspondence, please use the same email thread until the editorial process is complete.</div>
          </aside>
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}
