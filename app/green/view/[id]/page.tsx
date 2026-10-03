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
    paper.certificate_path?'Certificate: Available':null,
  ].filter((item):item is string=>Boolean(item));

  return <><Header/>
    <section className="pageHero"><div className="container">
      <div style={{marginBottom:7}}><JournalTitle kind="green" title={settings.green_title} size={15}/></div>
      <div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#14733d',marginBottom:5}}>{paper.article_type||'Research Article'}</div>
      <h1 style={{fontSize:31,maxWidth:980}}>{paper.title}</h1>
      {english?.english_title&&english.english_title!==paper.title?<p style={{fontFamily:'Georgia,serif',fontSize:15,color:'#41586b',margin:'8px 0 0',maxWidth:980}}><strong>English Title:</strong> {english.english_title}</p>:null}

      <div style={{display:'flex',alignItems:'flex-start',gap:12,maxWidth:980,marginTop:14,padding:'13px 15px',border:'1px solid #d5e1e7',borderRadius:8,background:'rgba(255,255,255,.62)',boxShadow:'0 1px 2px rgba(12,45,71,.04)'}}>
        <div aria-hidden="true" style={{width:38,height:38,borderRadius:'50%',display:'grid',placeItems:'center',flex:'0 0 auto',background:'#eef7f2',border:'1px solid #cfe4d7',color:'#14733d'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div style={{minWidth:0,flex:1}}>
          <div style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.09em',fontWeight:800,color:'#71808c',marginBottom:3}}>Author{paper.authors.includes(',')||paper.authors.includes(';')?'s':''}</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:14.5,fontWeight:700,lineHeight:1.45,color:'#102f4d'}}>{paper.authors}</div>
          {paper.affiliation?<div style={{display:'flex',alignItems:'flex-start',gap:7,marginTop:7,color:'#536473'}}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{flex:'0 0 auto',marginTop:1}}><path d="M3 21h18"/><path d="M6 21V9l6-4 6 4v12"/><path d="M9 12h1"/><path d="M14 12h1"/><path d="M9 16h1"/><path d="M14 16h1"/></svg>
            <div style={{fontSize:11.5,lineHeight:1.55}}><span style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.07em',fontWeight:800,color:'#7a8792',marginRight:6}}>Affiliation</span>{paper.affiliation}</div>
          </div>:null}
        </div>
      </div>

      {publicationMeta.length?<div aria-label="Publication details" style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'5px 8px',maxWidth:980,marginTop:9,padding:'8px 12px',border:'1px solid #d5e1e7',borderRadius:6,background:'rgba(255,255,255,.48)',fontSize:10.5,lineHeight:1.5,color:'#496071'}}>
        {publicationMeta.map((item,index)=><span key={item} style={{display:'inline-flex',alignItems:'center',fontWeight:index===0?700:500,color:index===0?'#27465e':'#496071'}}>{index>0?<span aria-hidden="true" style={{marginRight:8,color:'#9aa8b2'}}>·</span>:null}{item}</span>)}
      </div>:null}

      <div style={{maxWidth:980,marginTop:7,fontSize:11,lineHeight:1.5,color:'#40596d'}}><strong style={{color:'#27465e'}}>DOI:</strong> {doiHref?<a href={doiHref} target="_blank" rel="noreferrer" style={{color:'#1473a8',textDecoration:'underline',textUnderlineOffset:2,overflowWrap:'anywhere'}}>{doiHref}</a>:<span style={{color:'#6f7f8c'}}>Not Assigned</span>}</div>
    </div></section>

    <main className="container" style={{padding:'22px 0 34px'}}>
      <article className="contentCard">
        {paper.abstract?<section style={{marginBottom:20}}><h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:'0 0 8px'}}>Abstract</h2><p style={{fontSize:12.5,lineHeight:1.75,color:'#465a6a',textAlign:'justify',margin:0}}>{paper.abstract}</p></section>:null}

        {paper.keywords?.length?<section style={{paddingTop:15,borderTop:'1px solid #e0e6ea',marginBottom:20}}><h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 7px'}}>Keywords</h3><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{paper.keywords.map(k=><span key={k} style={{padding:'4px 8px',border:'1px solid #d8e1e7',borderRadius:999,fontSize:10.5,color:'#536473',background:'#f8fafb'}}>{k}</span>)}</div></section>:null}

        {hasEnglish?<section style={{marginBottom:20,padding:'14px 16px',border:'1px solid #d7e4ec',borderLeft:'4px solid #173d60',background:'#f8fafc'}}><div style={{fontSize:9.5,letterSpacing:'.09em',textTransform:'uppercase',fontWeight:800,color:'#526b7e',marginBottom:7}}>English Bibliographic Record</div>{english?.english_title?<div style={{fontSize:12,lineHeight:1.6,color:'#263f58',marginBottom:english.english_abstract?8:0}}><strong>English Title:</strong> {english.english_title}</div>:null}{english?.english_abstract?<div><h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 6px'}}>English Abstract / Summary</h3><p style={{fontSize:12,lineHeight:1.72,color:'#465a6a',textAlign:'justify',margin:0}}>{english.english_abstract}</p></div>:null}</section>:null}

        {(paper.view_url||paper.download_url)?<section style={{marginTop:18,padding:'14px 16px',border:'1px solid #d8e2e8',background:'#f8fafb'}}>
          <div style={{fontSize:10,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:800,color:'#173d60'}}>Article PDF</div>
          <p style={{fontSize:11.5,color:'#526577',margin:'5px 0 10px'}}>Read the complete published paper below. Scroll inside the viewer to move through the PDF.</p>
          {paper.view_url?<div style={{overflow:'hidden',border:'1px solid #cfd9e0',borderRadius:4,background:'#fff'}}><iframe src={`${paper.view_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`} title={`${paper.title} PDF`} style={{display:'block',width:'100%',height:'72vh',minHeight:560,maxHeight:760,border:0,background:'#fff'}}/></div>:<div style={{padding:'14px',border:'1px dashed #cfd9e0',background:'#fff',fontSize:11.5,color:'#526577'}}>Embedded PDF preview is unavailable for this paper.</div>}
          {paper.download_url?<div style={{marginTop:12}}><a className="btn btnGreen compact" href={paper.download_url}>Download PDF</a></div>:null}
        </section>:null}

        {paper.certificate_path?<section style={{marginTop:18,padding:'14px 16px',border:'1px solid #cee5d6',background:'#f5fbf7'}}><div style={{fontSize:10,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:800,color:'#14733d'}}>Publication Certificate</div><p style={{fontSize:11.5,color:'#526577',margin:'5px 0 10px'}}>A certificate is available for this published GREEN research paper.</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{paper.certificate_view_url?<a className="btn btnGreen compact" href={paper.certificate_view_url} target="_blank" rel="noreferrer">View Certificate</a>:null}{paper.certificate_download_url?<a className="btn btnOutline compact" href={paper.certificate_download_url}>Download Certificate</a>:null}</div></section>:null}

        <ShareButtons title={paper.title} authors={paper.authors}/>
        <div style={{marginTop:16}}><Link className="smallBtn" href="/green">← Back to GREEN Papers</Link></div>
      </article>
    </main><Footer/></>;
}
