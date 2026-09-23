import Link from 'next/link';
import {Header,Footer} from '../../../components';
import {getPublishedGreenPaperById} from '@/lib/publications';
import ShareButtons from './share-buttons';

export const dynamic='force-dynamic';

export default async function GreenPaperDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const paper=await getPublishedGreenPaperById(id);
  if(!paper){return <><Header/><main className="container" style={{padding:'28px 0'}}><div className="contentCard"><h1>Paper not available</h1><p>This GREEN publication is not currently available.</p><Link className="smallBtn" href="/green">← Back to GREEN Papers</Link></div></main><Footer/></>}
  const meta=[paper.publication_month,paper.publication_year].filter(Boolean).join(' ');
  return <><Header/>
    <section className="pageHero"><div className="container"><div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#14733d',marginBottom:5}}>GREEN · {paper.article_type||'Research Article'}</div><h1 style={{fontSize:31,maxWidth:980}}>{paper.title}</h1><p style={{fontSize:13,color:'#536473',margin:'8px 0 0'}}>{paper.authors}</p></div></section>
    <main className="container" style={{padding:'22px 0 34px'}}>
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 280px',gap:24,alignItems:'start'}}>
        <article className="contentCard">
          {paper.abstract?<section style={{marginBottom:20}}><h2 style={{fontFamily:'Georgia,serif',fontSize:21,color:'#0b2d4e',margin:'0 0 8px'}}>Abstract</h2><p style={{fontSize:12.5,lineHeight:1.75,color:'#465a6a',textAlign:'justify',margin:0}}>{paper.abstract}</p></section>:null}
          {paper.keywords?.length?<section style={{paddingTop:15,borderTop:'1px solid #e0e6ea'}}><h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',margin:'0 0 7px'}}>Keywords</h3><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{paper.keywords.map(k=><span key={k} style={{padding:'4px 8px',border:'1px solid #d8e1e7',borderRadius:999,fontSize:10.5,color:'#536473',background:'#f8fafb'}}>{k}</span>)}</div></section>:null}
          <ShareButtons title={paper.title} authors={paper.authors}/>
        </article>
        <aside className="contentCard" style={{padding:16}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:18,color:'#0b2d4e',margin:'0 0 12px'}}>Publication Details</h2>
          {[['Article ID',paper.article_id],['Article Type',paper.article_type],['Published',meta],['Volume',paper.volume],['Issue',paper.issue],['ISSN',paper.issn&&paper.issn!=='XXXX-XXXX'?paper.issn:null],['DOI',paper.doi],['Affiliation',paper.affiliation]].map(([k,v])=>v?<div key={k} style={{padding:'8px 0',borderTop:'1px solid #edf1f4'}}><div style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.07em',fontWeight:800,color:'#7a8792'}}>{k}</div><div style={{fontSize:11.5,lineHeight:1.5,color:'#344b5d',marginTop:3}}>{v}</div></div>:null)}
          <div style={{display:'grid',gap:7,marginTop:13}}>{paper.view_url?<a className="btn btnGreen compact" href={paper.view_url} target="_blank" rel="noreferrer">View Article PDF</a>:null}{paper.download_url?<a className="btn btnOutline compact" href={paper.download_url}>Download PDF</a>:null}<Link className="smallBtn" href="/green">← Back to GREEN Papers</Link></div>
        </aside>
      </div>
    </main><Footer/></>;
}
