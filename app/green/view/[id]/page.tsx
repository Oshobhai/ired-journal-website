import type { Metadata } from 'next';
import Link from 'next/link';
import {Header,Footer,JournalTitle} from '../../../components';
import {getPublishedGreenPaperById} from '@/lib/publications';
import {getGreenEnglishBibliographicById} from '@/lib/green-bibliographic';
import {getSiteSettings} from '@/lib/site-settings';
import ShareButtons from './share-buttons';

export const dynamic='force-dynamic';

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;
  const [paper,settings,english]=await Promise.all([getPublishedGreenPaperById(id),getSiteSettings(),getGreenEnglishBibliographicById(id)]);
  if(!paper)return {title:'GREEN Paper'};
  const description=(english?.english_abstract||paper.abstract||`${paper.title} by ${paper.authors}`).slice(0,220);
  const authors=paper.authors.split(/,|;|\band\b/i).map(name=>({name:name.trim()})).filter(x=>x.name);
  return {
    title:paper.title,
    description,
    authors,
    keywords:paper.keywords||[],
    alternates:{canonical:`/green/view/${paper.id}`},
    openGraph:{type:'article',title:english?.english_title||paper.title,description,url:`/green/view/${paper.id}`,publishedTime:paper.published_at||undefined,authors:authors.map(x=>x.name)},
    other:{
      citation_title:paper.title,
      citation_author:paper.authors,
      citation_publication_date:String(paper.publication_year||''),
      citation_journal_title:settings.green_title,
      citation_volume:paper.volume||'',
      citation_issue:paper.issue||'',
      citation_doi:paper.doi||'',
      citation_issn:paper.issn&&paper.issn!=='XXXX-XXXX'?paper.issn:'',
      ...(english?.english_title?{'DC.title.alternative':english.english_title}:{}),
      ...(english?.english_abstract?{'DC.description':english.english_abstract}:{}),
    }
  };
}

export default async function GreenPaperDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const [paper,settings,english]=await Promise.all([getPublishedGreenPaperById(id),getSiteSettings(),getGreenEnglishBibliographicById(id)]);
  if(!paper){return <><Header/><main className="container" style={{padding:'28px 0'}}><div className="contentCard"><h1>Paper not available</h1><p>This GREEN publication is not currently available.</p><Link className="smallBtn" href="/green">← Back to GREEN Papers</Link></div></main><Footer/></>}

  const meta=[paper.publication_month,paper.publication_year].filter(Boolean).join(' ');
  const hasEnglish=Boolean(english?.english_title||english?.english_abstract);
  const doiHref=paper.doi?(paper.doi.startsWith('http')?paper.doi:`https://doi.org/${paper.doi.replace(/^doi:\s*/i,'')}`):null;
  const publicationMeta=[
    paper.article_id?`Article ID: ${paper.article_id}`:null,
    paper.article_type||'Research Article',
    meta||null,
    paper.volume?`Volume ${paper.volume}`:null,
    paper.issue?`Issue ${paper.issue}`:null,
    paper.issn&&paper.issn!=='XXXX-XXXX'?`ISSN: ${paper.issn}`:null,
    paper.certificate_path?'Certificate Available':null,
  ].filter((item):item is string=>Boolean(item));

  return <><Header/>
    <section style={{background:'#f4f7f9',borderBottom:'1px solid #dbe3e8',padding:'34px 0 30px'}}>
      <div className="container"><div style={{maxWidth:1040,margin:'0 auto'}}>
        <div style={{marginBottom:9}}><JournalTitle kind="green" title={settings.green_title} size={15}/></div>
        <div style={{display:'inline-flex',alignItems:'center',padding:'4px 8px',borderRadius:999,background:'#eaf5ee',color:'#14733d',fontSize:9.5,letterSpacing:'.09em',textTransform:'uppercase',fontWeight:800}}>{paper.article_type||'Research Article'}</div>
        <h1 style={{fontSize:34,lineHeight:1.13,maxWidth:1000,margin:'12px 0 0',color:'#0b2d4e',fontFamily:'Georgia,serif'}}>{paper.title}</h1>
        {english?.english_title&&english.english_title!==paper.title?<p style={{fontFamily:'Georgia,serif',fontSize:15,color:'#516578',margin:'9px 0 0',maxWidth:980,lineHeight:1.5}}><strong>English Title:</strong> {english.english_title}</p>:null}

        <div style={{marginTop:20,border:'1px solid #d9e2e8',borderRadius:12,background:'#fff',boxShadow:'0 8px 24px rgba(18,46,70,.05)',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:14,padding:'16px 18px'}}>
            <div aria-hidden="true" style={{width:42,height:42,borderRadius:'50%',display:'grid',placeItems:'center',flex:'0 0 auto',background:'#eef7f2',border:'1px solid #cfe4d7',color:'#14733d'}}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.1em',fontWeight:800,color:'#74828d',marginBottom:3}}>Author{paper.authors.includes(',')||paper.authors.includes(';')?'s':''}</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:16,fontWeight:700,lineHeight:1.45,color:'#102f4d'}}>{paper.authors}</div>
              {paper.affiliation?<div style={{display:'flex',alignItems:'flex-start',gap:7,marginTop:7,color:'#536473'}}>
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{flex:'0 0 auto',marginTop:2}}><path d="M3 21h18"/><path d="M6 21V9l6-4 6 4v12"/><path d="M9 12h1"/><path d="M14 12h1"/><path d="M9 16h1"/><path d="M14 16h1"/></svg>
                <div style={{fontSize:11.5,lineHeight:1.6}}><span style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.07em',fontWeight:800,color:'#7a8792',marginRight:7}}>Affiliation</span>{paper.affiliation}</div>
              </div>:null}
            </div>
          </div>

          <div aria-label="Publication details" style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'6px 0',padding:'11px 18px',borderTop:'1px solid #edf1f4',fontSize:10.5,lineHeight:1.5,color:'#536473'}}>
            {publicationMeta.map((item,index)=><span key={item} style={{display:'inline-flex',alignItems:'center',fontWeight:index===0?700:500,color:index===0?'#27465e':'#536473'}}>{index>0?<span aria-hidden="true" style={{margin:'0 9px',color:'#b0bac2'}}>•</span>:null}{item}</span>)}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'92px minmax(0,1fr)',gap:12,padding:'11px 18px',borderTop:'1px solid #edf1f4',fontSize:11,lineHeight:1.55}}>
            <strong style={{color:'#27465e'}}>DOI</strong>
            <div>{doiHref?<a href={doiHref} target="_blank" rel="noreferrer" style={{color:'#1473a8',textDecoration:'underline',textUnderlineOffset:2,overflowWrap:'anywhere'}}>{doiHref}</a>:<span style={{color:'#7c8993'}}>Not Assigned</span>}</div>
          </div>

          {paper.keywords?.length?<div style={{display:'grid',gridTemplateColumns:'92px minmax(0,1fr)',gap:12,padding:'12px 18px',borderTop:'1px solid #edf1f4'}}>
            <strong style={{fontSize:11,color:'#27465e',paddingTop:4}}>Keywords</strong>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{paper.keywords.map(k=><span key={k} style={{padding:'4px 9px',border:'1px solid #d7e0e6',borderRadius:999,fontSize:10.5,color:'#4f6374',background:'#f8fafb'}}>{k}</span>)}</div>
          </div>:null}
        </div>

        {paper.abstract?<section style={{marginTop:18,padding:'20px 22px',border:'1px solid #d9e2e8',borderLeft:'4px solid #148444',borderRadius:10,background:'#fff',boxShadow:'0 6px 20px rgba(18,46,70,.04)'}}>
          <div style={{fontSize:9.5,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#148444',marginBottom:5}}>Article Summary</div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:'0 0 9px'}}>Abstract</h2>
          <p style={{fontSize:13,lineHeight:1.8,color:'#40576a',textAlign:'justify',margin:0}}>{paper.abstract}</p>
        </section>:null}
      </div></div>
    </section>

    <main style={{background:'#fff'}}><div className="container" style={{padding:'28px 0 40px'}}><article style={{maxWidth:1040,margin:'0 auto'}}>
      {hasEnglish?<section style={{padding:'18px 20px',border:'1px solid #d9e2e8',borderRadius:10,background:'#fbfcfd',marginBottom:20}}>
        <div style={{fontSize:9.5,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#526b7e',marginBottom:8}}>English Bibliographic Record</div>
        {english?.english_title?<div style={{fontSize:12.5,lineHeight:1.65,color:'#263f58',marginBottom:english.english_abstract?10:0}}><strong>English Title:</strong> {english.english_title}</div>:null}
        {english?.english_abstract?<div><h3 style={{fontFamily:'Georgia,serif',fontSize:18,color:'#0b2d4e',margin:'0 0 7px'}}>English Abstract / Summary</h3><p style={{fontSize:12.5,lineHeight:1.75,color:'#465a6a',textAlign:'justify',margin:0}}>{english.english_abstract}</p></div>:null}
      </section>:null}

      <section>
        <div style={{fontSize:9.5,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#73818c',marginBottom:4}}>Article Resources</div>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:22,color:'#0b2d4e',margin:'0 0 13px'}}>Access this Publication</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:14}}>
          {paper.download_url?<div style={{padding:'18px',border:'1px solid #d9e2e8',borderRadius:10,background:'#fff',boxShadow:'0 4px 16px rgba(18,46,70,.035)'}}>
            <div style={{display:'flex',gap:11,alignItems:'flex-start'}}>
              <div aria-hidden="true" style={{width:36,height:36,borderRadius:8,display:'grid',placeItems:'center',background:'#eef7f2',color:'#148444',fontWeight:800}}>PDF</div>
              <div><div style={{fontFamily:'Georgia,serif',fontSize:17,fontWeight:700,color:'#0b2d4e'}}>Article PDF</div><p style={{fontSize:11.5,lineHeight:1.55,color:'#637382',margin:'4px 0 12px'}}>Download the official published version of this research paper.</p><a className="btn btnGreen compact" href={paper.download_url}>Download PDF</a></div>
            </div>
          </div>:null}

          {paper.certificate_path?<div style={{padding:'18px',border:'1px solid #d9e2e8',borderRadius:10,background:'#fff',boxShadow:'0 4px 16px rgba(18,46,70,.035)'}}>
            <div style={{display:'flex',gap:11,alignItems:'flex-start'}}>
              <div aria-hidden="true" style={{width:36,height:36,borderRadius:8,display:'grid',placeItems:'center',background:'#eef7f2',color:'#148444',fontWeight:800}}>✓</div>
              <div style={{minWidth:0}}><div style={{fontFamily:'Georgia,serif',fontSize:17,fontWeight:700,color:'#0b2d4e'}}>Publication Certificate</div><p style={{fontSize:11.5,lineHeight:1.55,color:'#637382',margin:'4px 0 12px'}}>Official certificate associated with this published GREEN research paper.</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{paper.certificate_view_url?<a className="btn btnGreen compact" href={paper.certificate_view_url} target="_blank" rel="noreferrer">View Certificate</a>:null}{paper.certificate_download_url?<a className="btn btnOutline compact" href={paper.certificate_download_url}>Download Certificate</a>:null}</div></div>
            </div>
          </div>:null}
        </div>
      </section>

      <div style={{marginTop:18,padding:'18px 20px',border:'1px solid #d9e2e8',borderRadius:10,background:'#fbfcfd'}}><ShareButtons title={paper.title} authors={paper.authors}/></div>

      <div style={{marginTop:18,paddingTop:14,borderTop:'1px solid #e3e8ec'}}><Link href="/green" style={{fontSize:11,fontWeight:700,color:'#36566f'}}>← Back to GREEN Papers</Link></div>
    </article></div></main>
    <Footer/>
  </>;
}
