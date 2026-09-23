import {Header,Footer} from '../components';

const email='ired.foundation@gmail.com';

function mailto(subject:string,body:string){
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact(){
  const greenBody=`Dear IRED Team,\n\nI would like to submit my research paper to GREEN: The Research Journal.\n\nAuthor Name:\nPaper Title:\nMobile Number:\nAffiliation:\nEmail:\n\nPlease attach the research paper DOCX/PDF file before sending this email.\n\nRegards,`;
  const redBody=`Dear IRED Team,\n\nI would like to submit my paper for consideration in RED: The Research Journal (compiled research book / volume).\n\nAuthor Name:\nPaper Title:\nMobile Number:\nEmail:\nAffiliation:\nFull Postal Address:\nCity / District:\nState:\nPIN Code:\n\nPlease attach the research paper DOCX/PDF file before sending this email.\n\nRegards,`;

  return <><Header/>
    <section className="pageHero"><div className="container"><h1>Contact Us</h1></div></section>
    <main className="container">
      <div className="contentCard">
        <h2>Institute of Research Education and Development (IRED)</h2>
        <p>A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015</p>
        <p><strong>Phone:</strong> 7383000930 | 7203998343</p>
        <p><strong>Email:</strong> <a href={`mailto:${email}`} style={{color:'#0b5d95',fontWeight:700}}>{email}</a></p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:18,marginBottom:24}}>
        <section className="contentCard" style={{margin:0,borderTop:'4px solid #148444'}}>
          <h2 style={{color:'#148444',marginTop:0}}>GREEN: Research Paper Submission</h2>
          <p style={{fontSize:13,lineHeight:1.6}}>Send your research paper directly to IRED by email. Your email app will open with the submission details already prepared.</p>
          <p style={{fontSize:12,color:'#687586'}}><strong>Before sending:</strong> attach your research paper in DOCX or PDF format.</p>
          <a className="btn btnGreen" href={mailto('GREEN Research Paper Submission',greenBody)}>✉ Email GREEN Paper</a>
        </section>

        <section className="contentCard" style={{margin:0,borderTop:'4px solid #cb2528'}}>
          <h2 style={{color:'#cb2528',marginTop:0}}>RED: Research Journal Submission</h2>
          <p style={{fontSize:13,lineHeight:1.6}}>For RED compiled research books/volumes, email the paper together with the author contact and postal details required for printed-copy dispatch.</p>
          <p style={{fontSize:12,color:'#687586'}}><strong>Before sending:</strong> attach your research paper in DOCX or PDF format and complete the postal address in the email.</p>
          <a className="btn btnRed" href={mailto('RED Research Journal Submission',redBody)}>✉ Email RED Paper</a>
        </section>
      </div>

      <div className="contentCard" style={{background:'#f7f9fb'}}>
        <h3 style={{marginTop:0}}>How email submission works</h3>
        <p style={{fontSize:13,lineHeight:1.65,marginBottom:0}}>Click the appropriate email button. Your device's email application will open with <strong>{email}</strong>, the subject, and a simple information template already filled in. Add the required details, attach your DOCX/PDF research paper, and send the email.</p>
      </div>
    </main>
    <Footer/>
  </>;
}
