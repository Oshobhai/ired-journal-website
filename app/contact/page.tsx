import {Header,Footer} from '../components';

const email='ired.foundation@gmail.com';

function mailto(subject:string,body:string){
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact(){
  const greenBody=`Dear IRED Editorial Team,\n\nI would like to submit a research paper for GREEN: The Research Journal.\n\nAUTHOR DETAILS\nAuthor Name:\nPaper Title:\nMobile Number:\nAffiliation / Institution:\nEmail:\n\nMANUSCRIPT\nPlease find my research paper attached in DOCX/PDF format.\n\nRegards,`;
  const redBody=`Dear IRED Editorial Team,\n\nI would like to submit a paper for consideration in RED: The Research Journal compiled print volume.\n\nAUTHOR DETAILS\nAuthor Name:\nPaper Title:\nMobile Number:\nEmail:\nAffiliation / Institution:\n\nPOSTAL DETAILS FOR PRINTED COPY\nFull Postal Address:\nCity / District:\nState:\nPIN Code:\n\nMANUSCRIPT\nPlease find my research paper attached in DOCX/PDF format.\n\nRegards,`;

  const shell={border:'1px solid #d9e1e8',borderRadius:8,background:'#fff'} as const;
  const muted={fontSize:12,color:'#687586',lineHeight:1.6} as const;
  const chip={display:'inline-flex',alignItems:'center',padding:'4px 8px',border:'1px solid #d8e0e6',borderRadius:999,fontSize:10,fontWeight:700,color:'#526273',background:'#f8fafb'} as const;

  return <><Header/>
    <section style={{background:'linear-gradient(100deg,#eef4f7 0%,#f8fafb 58%,#f4f1e7 100%)',borderBottom:'1px solid #d9e1e8'}}>
      <div className="container" style={{padding:'30px 0 28px'}}>
        <div style={{fontSize:10,letterSpacing:'.16em',textTransform:'uppercase',fontWeight:800,color:'#7a6330',marginBottom:6}}>Author & Editorial Enquiries</div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:34,lineHeight:1.08,color:'#0b2d4e',margin:'0 0 8px'}}>Contact & Manuscript Submission</h1>
        <p style={{maxWidth:760,fontSize:13,lineHeight:1.65,color:'#566575',margin:0}}>Send your manuscript directly to the IRED editorial office by email. Choose the appropriate publication below and attach your DOCX or PDF file before sending.</p>
      </div>
    </section>

    <main className="container" style={{padding:'22px 0 28px'}}>
      <div style={{display:'grid',gridTemplateColumns:'minmax(260px,.72fr) minmax(520px,1.65fr)',gap:18,alignItems:'start'}}>
        <aside style={{...shell,overflow:'hidden'}}>
          <div style={{padding:'17px 19px',background:'#0f304f',color:'#fff'}}>
            <div style={{fontFamily:'Georgia,serif',fontSize:19,fontWeight:700}}>Contact IRED</div>
            <div style={{fontSize:10,opacity:.8,marginTop:3}}>Institute of Research Education and Development</div>
          </div>
          <div style={{padding:'17px 19px'}}>
            <div style={{paddingBottom:13,marginBottom:13,borderBottom:'1px solid #e5eaee'}}>
              <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#7b8792',marginBottom:5}}>Editorial Office</div>
              <div style={{fontSize:12,lineHeight:1.55,color:'#24394c'}}>A-3, 3rd Floor, Gita Apartment,<br/>Nr. Hirabaug Crossing, Ambawadi,<br/>Ahmedabad-380015, Gujarat, India</div>
            </div>
            <div style={{paddingBottom:13,marginBottom:13,borderBottom:'1px solid #e5eaee'}}>
              <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#7b8792',marginBottom:5}}>Phone</div>
              <div style={{fontSize:12,fontWeight:700,color:'#0b2d4e'}}>7383000930 · 7203998343</div>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#7b8792',marginBottom:5}}>Email</div>
              <a href={`mailto:${email}`} style={{fontSize:12,fontWeight:800,color:'#0d649c',wordBreak:'break-word'}}>ired.foundation@gmail.com</a>
            </div>
          </div>
        </aside>

        <section style={{display:'grid',gap:14}}>
          <div style={{...shell,padding:'17px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#148444',marginBottom:5}}>GREEN · Individual Research Papers</div>
                <h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#12395c',margin:'0 0 5px'}}>Submit to GREEN: The Research Journal</h2>
                <p style={{...muted,maxWidth:650,margin:'0 0 11px'}}>For individual research articles and scholarly papers. Your email will open with the required author information already prepared.</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={chip}>DOCX or PDF</span><span style={chip}>Author details</span><span style={chip}>Affiliation</span></div>
              </div>
              <a className="btn btnGreen" href={mailto('GREEN Research Paper Submission',greenBody)} style={{minWidth:170}}>✉ Email GREEN Paper</a>
            </div>
          </div>

          <div style={{...shell,padding:'17px 18px',borderLeft:'4px solid #cb2528'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#cb2528',marginBottom:5}}>RED · Compiled Print Volume</div>
                <h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#12395c',margin:'0 0 5px'}}>Submit for RED: The Research Journal</h2>
                <p style={{...muted,maxWidth:650,margin:'0 0 11px'}}>For papers considered for the compiled RED research book/volume. Postal details are requested in the email because printed copies may be dispatched to contributors.</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={chip}>DOCX or PDF</span><span style={chip}>Author details</span><span style={chip}>Full postal address</span><span style={chip}>PIN code</span></div>
              </div>
              <a className="btn btnRed" href={mailto('RED Research Journal Submission',redBody)} style={{minWidth:170}}>✉ Email RED Paper</a>
            </div>
          </div>

          <div style={{...shell,padding:'15px 18px',background:'#f8fafb'}}>
            <div style={{fontSize:11,fontWeight:800,color:'#0b2d4e',marginBottom:9}}>Submission process</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(150px,1fr))',gap:12}}>
              {[['01','Choose GREEN or RED'],['02','Complete the email details'],['03','Attach DOCX/PDF and send']].map(([n,t])=><div key={n} style={{display:'flex',gap:9,alignItems:'center'}}><span style={{width:28,height:28,borderRadius:'50%',display:'grid',placeItems:'center',background:'#e9eef2',color:'#12395c',fontSize:10,fontWeight:800,flex:'0 0 auto'}}>{n}</span><span style={{fontSize:11,color:'#526273',fontWeight:700}}>{t}</span></div>)}
            </div>
            <p style={{fontSize:10.5,color:'#7a8792',margin:'12px 0 0'}}>Attachments cannot be added automatically by a website. Please attach your manuscript in your email application before sending.</p>
          </div>
        </section>
      </div>
    </main>
    <Footer/>
  </>;
}
