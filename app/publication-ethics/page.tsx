import {Header,Footer} from '../components';

const principles=[
  ['Originality & Plagiarism','Manuscripts should be original work. Authors must appropriately acknowledge sources, quotations, data, images and ideas taken from other work. Plagiarism, fabricated citations and substantial unattributed copying are not acceptable.'],
  ['Duplicate or Simultaneous Submission','A manuscript should not be submitted to multiple publications at the same time. Authors should disclose closely related manuscripts, previous versions, conference papers or other overlapping publications when relevant.'],
  ['Authorship & Contributions','Authorship should reflect meaningful scholarly contribution to the work. All listed authors should approve the submitted version, and individuals who did not make an appropriate contribution should not be listed as authors.'],
  ['Research Integrity & Data','Authors are responsible for the accuracy and integrity of the research, data, analysis and conclusions presented. Fabrication, falsification or selective manipulation of research findings is unacceptable.'],
  ['Conflicts of Interest','Authors, reviewers and editors should disclose financial, professional, institutional or personal interests that could reasonably influence the evaluation or interpretation of a manuscript.'],
  ['Peer Review & Confidentiality','Manuscripts under review, reviewer reports and editorial communications should be treated as confidential. Reviewers should provide objective, respectful and academically relevant comments.'],
  ['Corrections & Retractions','When a material error is identified after publication, IRED may publish a correction, clarification or retraction as appropriate. Serious concerns regarding reliability, misconduct or duplicate publication may lead to withdrawal or retraction.'],
  ['Ethical Research Practice','Research involving people, sensitive personal information, animals or regulated procedures should comply with applicable institutional and legal requirements. Authors are responsible for obtaining any approvals, permissions or consent required for their research.'],
  ['Copyright & Permissions','Authors are responsible for ensuring that they have the right to submit all text, tables, figures, photographs and other material included in a manuscript, and for obtaining permission where third-party material is used.'],
  ['Complaints & Editorial Decisions','Questions, complaints or concerns about a manuscript or publication may be sent to the IRED Editorial Office. Editorial decisions are based on academic suitability, integrity, review feedback and publication requirements.']
];

function Shield(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg>}

export default function PublicationEthics(){return <><Header/>
  <section className="pageHero" style={{padding:'32px 0 30px'}}><div className="container">
    <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:42,height:42,borderRadius:'50%',background:'#fff',border:'1px solid #cad6df',display:'grid',placeItems:'center',color:'#0b2d4e'}}><Shield/></span><div><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:3}}>Editorial Policy</div><h1 style={{fontSize:36,margin:0}}>Publication Ethics</h1></div></div>
    <p style={{maxWidth:850,fontSize:12.5,lineHeight:1.7,color:'#5d6c79',margin:'12px 0 0'}}>IRED expects authors, reviewers and editors to uphold responsible scholarly conduct throughout submission, review, publication and post-publication communication.</p>
  </div></section>

  <main className="container" style={{padding:'24px 0 34px'}}>
    <div style={{maxWidth:1080,margin:'0 auto'}}>
      <section style={{display:'grid',gridTemplateColumns:'250px 1fr',gap:34,alignItems:'start'}}>
        <aside style={{borderTop:'3px solid #173d60',background:'#f7f9fb',padding:'16px 17px'}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#6f7d89',marginBottom:8}}>Scope of this policy</div>
          <p style={{fontSize:11.5,lineHeight:1.65,color:'#536473',margin:'0 0 12px'}}>These principles apply to research papers, review articles and compiled scholarly volumes published through GREEN and RED.</p>
          <div style={{borderTop:'1px solid #dde4e9',paddingTop:12,fontSize:11,lineHeight:1.6,color:'#687784'}}>For ethics-related correspondence:<br/><a href="mailto:ired.foundation@gmail.com" style={{color:'#0c6298',fontWeight:700}}>ired.foundation@gmail.com</a></div>
        </aside>

        <div>
          <div style={{borderBottom:'2px solid #173d60',paddingBottom:9,marginBottom:4}}><h2 style={{fontFamily:'Georgia,serif',fontSize:23,color:'#0b2d4e',margin:0}}>Core Publication Principles</h2></div>
          {principles.map(([title,text],i)=><section key={title} style={{display:'grid',gridTemplateColumns:'42px 1fr',gap:13,padding:'16px 0',borderBottom:'1px solid #e1e6ea'}}>
            <div style={{width:34,height:34,borderRadius:'50%',display:'grid',placeItems:'center',background:'#eef3f6',border:'1px solid #d4dde4',fontFamily:'Georgia,serif',fontSize:12,fontWeight:700,color:'#173d60'}}>{String(i+1).padStart(2,'0')}</div>
            <div><h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#12395c',margin:'0 0 5px'}}>{title}</h3><p style={{fontSize:12,lineHeight:1.7,color:'#4c5f70',margin:0}}>{text}</p></div>
          </section>)}
        </div>
      </section>

      <section style={{marginTop:26,padding:'15px 18px',border:'1px solid #dbe3e9',background:'#fbfcfd'}}>
        <h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 6px'}}>Reporting a Publication Concern</h3>
        <p style={{fontSize:11.5,lineHeight:1.65,color:'#5a6a78',margin:0}}>A concern about plagiarism, authorship, data integrity, duplicate publication, reviewer conduct or another publication matter may be reported to the IRED Editorial Office. Please identify the publication clearly and provide sufficient information for the concern to be reviewed.</p>
      </section>
    </div>
  </main><Footer/></>}
