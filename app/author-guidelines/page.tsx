import Link from 'next/link';
import {Header,Footer} from '../components';

function Icon({type}:{type:'document'|'structure'|'table'|'reference'|'ethics'|'email'|'review'|'check'|'book'}){
  const common={width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true};
  if(type==='document') return <svg {...common}><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>;
  if(type==='structure') return <svg {...common}><path d="M4 5h16M4 12h7M4 19h10"/><circle cx="18" cy="12" r="2"/><circle cx="18" cy="19" r="2"/></svg>;
  if(type==='table') return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M9 9v11M15 9v11"/></svg>;
  if(type==='reference') return <svg {...common}><path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>;
  if(type==='ethics') return <svg {...common}><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if(type==='email') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
  if(type==='review') return <svg {...common}><path d="M5 4h14v16H5z"/><path d="M8 4V2h8v2M8 9h8M8 13h5"/><path d="m14 17 1.5 1.5L19 15"/></svg>;
  if(type==='book') return <svg {...common}><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H11v18H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M20 4.5A2.5 2.5 0 0 0 17.5 2H13v18h4.5A2.5 2.5 0 0 1 20 22Z"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
}

const sections=[
  {icon:'document' as const,title:'1. Manuscript File & Basic Information',items:[
    'Submit the manuscript in DOCX format whenever possible. A PDF reference copy may also be included when useful for checking layout, equations, tables or special characters.',
    'The manuscript should clearly state the paper title, author name(s), institutional affiliation(s), corresponding author email and mobile/contact information.',
    'Manuscripts may be prepared in English, Gujarati or another language that can be reliably displayed using Unicode text.',
    'Before submission, authors should proofread the manuscript for spelling, grammar, names, affiliations, tables, figures and references.'
  ]},
  {icon:'structure' as const,title:'2. Recommended Manuscript Structure',items:[
    'A research manuscript will normally include: Title, Author(s), Affiliation, Abstract, Keywords, Introduction, Objectives or Research Questions, Methodology, Results/Findings, Discussion, Conclusion and References.',
    'Review articles, case studies, short communications and discipline-specific manuscripts may use a structure appropriate to the nature of the work.',
    'Use clear section headings and logical subheadings. Numbering may be used where it improves readability and consistency.',
    'The abstract should briefly explain the purpose, approach, principal findings and significance of the study. Keywords should represent the main concepts of the paper.'
  ]},
  {icon:'table' as const,title:'3. Tables, Figures & Illustrations',items:[
    'Number tables and figures in the order in which they are mentioned in the manuscript, and provide a clear title or caption for each item.',
    'Tables should remain readable and, where possible, should be editable rather than supplied only as screenshots.',
    'Figures, charts and images should be sufficiently clear for online publication and print use where applicable.',
    'Authors are responsible for obtaining permission to reproduce any copyrighted table, figure, photograph or other third-party material.'
  ]},
  {icon:'reference' as const,title:'4. Citations & References',items:[
    'Use one recognized citation and reference style that is appropriate to the discipline, and apply it consistently throughout the manuscript.',
    'Every source cited in the text should appear in the reference list, and entries in the reference list should correspond to material actually cited in the manuscript.',
    'Provide complete bibliographic details as far as available, including author, year, title, source/publication details and DOI or other persistent identifier where applicable.',
    'Authors are responsible for the accuracy of citations and references.'
  ]},
  {icon:'ethics' as const,title:'5. Originality, Authorship & Research Ethics',items:[
    'Submissions should represent original scholarly work and should not contain plagiarism, fabricated data, falsified findings or misleading attribution.',
    'A manuscript should not be under simultaneous consideration by another publication unless this has been disclosed and agreed by the editorial office.',
    'All listed authors should have made an appropriate scholarly contribution and should approve the submitted manuscript.',
    'Where research requires institutional approval, participant consent, permissions or other ethical authorization, authors are responsible for obtaining and retaining the relevant documentation.'
  ]},
  {icon:'review' as const,title:'6. Editorial Review & Revision',items:[
    'Submitted manuscripts may first be checked for relevance, completeness, presentation and compliance with publication requirements.',
    'Where scholarly review is required, the manuscript may be sent for editorial or peer-review assessment appropriate to the subject area.',
    'Authors may be asked to revise the manuscript, answer reviewer/editorial comments, correct references or provide additional information before a final decision.',
    'Acceptance for review does not by itself guarantee publication. Final publication decisions remain with the editorial process.'
  ]}
];

export default function AuthorGuidelines(){return <><Header/>
  <section className="pageHero" style={{padding:'32px 0 30px'}}><div className="container">
    <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:42,height:42,borderRadius:'50%',background:'#fff',border:'1px solid #cad6df',display:'grid',placeItems:'center',color:'#0b2d4e'}}><Icon type="document"/></span><div><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:3}}>For Contributors</div><h1 style={{fontSize:36,margin:0}}>Author Guidelines</h1></div></div>
    <p style={{maxWidth:860,fontSize:12.5,lineHeight:1.7,color:'#5d6c79',margin:'12px 0 0'}}>These guidelines explain how authors should prepare and submit manuscripts for IRED research publications. Final journal formatting is applied during the editorial and publication process.</p>
  </div></section>

  <main className="container" style={{padding:'24px 0 36px'}}>
    <div style={{maxWidth:1100,margin:'0 auto'}}>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:14,marginBottom:28}}>
        <article style={{border:'1px solid #d8e3dc',borderTop:'3px solid #148444',padding:'17px 18px',background:'#fff'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,color:'#148444',marginBottom:6}}><Icon type="document"/><strong style={{fontFamily:'Georgia,serif',fontSize:18}}>GREEN: The Research Journal</strong></div>
          <p style={{fontSize:11.8,lineHeight:1.65,color:'#526273',margin:'0 0 10px'}}>For individual research papers and scholarly articles published as separate journal papers.</p>
          <div style={{fontSize:10.8,color:'#667782'}}><strong>Typical submissions:</strong> Research Article · Review Article · Case Study · Short Communication</div>
        </article>
        <article style={{border:'1px solid #ead7d8',borderTop:'3px solid #bd2025',padding:'17px 18px',background:'#fff'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,color:'#bd2025',marginBottom:6}}><Icon type="book"/><strong style={{fontFamily:'Georgia,serif',fontSize:18}}>RED: The Research Journal</strong></div>
          <p style={{fontSize:11.8,lineHeight:1.65,color:'#526273',margin:'0 0 10px'}}>For research papers considered for inclusion in compiled research books / printed volumes.</p>
          <div style={{fontSize:10.8,color:'#667782'}}><strong>Additional requirement:</strong> Full postal address may be requested for printed-copy dispatch.</div>
        </article>
      </section>

      <div style={{display:'grid',gridTemplateColumns:'250px minmax(0,1fr)',gap:34,alignItems:'start'}}>
        <aside style={{position:'sticky',top:12,borderTop:'3px solid #173d60',background:'#f7f9fb',padding:'16px 17px'}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#6f7d89',marginBottom:9}}>Quick Checklist</div>
          {['Paper title and author details','Affiliation and corresponding email','Abstract and keywords','Main manuscript text','Tables / figures checked','References verified','DOCX/PDF attached','Ethics requirements reviewed'].map(x=><div key={x} style={{display:'grid',gridTemplateColumns:'20px 1fr',gap:6,alignItems:'start',padding:'5px 0',fontSize:11,lineHeight:1.45,color:'#526473'}}><span style={{color:'#167843'}}><Icon type="check"/></span><span>{x}</span></div>)}
          <div style={{borderTop:'1px solid #dce4e9',marginTop:12,paddingTop:12}}><Link href="/publication-ethics" style={{fontSize:11,fontWeight:800,color:'#12395c'}}>Read Publication Ethics →</Link></div>
        </aside>

        <div>
          {sections.map((section)=><section key={section.title} style={{padding:'0 0 21px',marginBottom:20,borderBottom:'1px solid #dfe5ea'}}>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:9,color:'#173d60'}}><Icon type={section.icon}/><h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:0}}>{section.title}</h2></div>
            <ul style={{margin:'0 0 0 20px',padding:0}}>{section.items.map(item=><li key={item} style={{fontSize:12,lineHeight:1.72,color:'#4b5d6d',marginBottom:7,paddingLeft:3}}>{item}</li>)}</ul>
          </section>)}

          <section style={{paddingBottom:21,marginBottom:20,borderBottom:'1px solid #dfe5ea'}}>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:9,color:'#173d60'}}><Icon type="email"/><h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:0}}>7. How to Submit</h2></div>
            <p style={{fontSize:12,lineHeight:1.72,color:'#4b5d6d',margin:'0 0 10px'}}>Manuscripts are submitted directly to the IRED Editorial Office by email. The Contact page provides separate prepared email options for GREEN and RED submissions.</p>
            <div style={{display:'flex',gap:9,flexWrap:'wrap'}}><Link className="btn btnGreen compact" href="/contact">Contact to Submit</Link><a href="mailto:ired.foundation@gmail.com" className="btn btnOutline compact">ired.foundation@gmail.com</a></div>
          </section>

          <section style={{padding:'16px 18px',border:'1px solid #dbe3e9',background:'#f8fafb'}}>
            <h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 7px'}}>Final Publication Formatting</h3>
            <p style={{fontSize:11.5,lineHeight:1.65,color:'#5a6a78',margin:0}}>Authors do not need to recreate the final GREEN journal header, footer, page numbering or publication layout themselves. After editorial acceptance, IRED may standardize the manuscript into the journal publication format. Authors should therefore prioritize a clean, complete and logically structured source manuscript.</p>
          </section>
        </div>
      </div>
    </div>
  </main><Footer/></>}
