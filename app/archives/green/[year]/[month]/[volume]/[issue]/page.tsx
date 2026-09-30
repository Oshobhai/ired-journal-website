import Link from 'next/link';
import {Header,Footer} from '../../../../../components';
import {getPublishedGreenPapers} from '@/lib/publications';

export const dynamic='force-dynamic';

export default async function GreenIssueArchive({params}:{params:Promise<{year:string;month:string;volume:string;issue:string}>}){
  const route=await params;
  const year=Number(route.year)||0;
  const month=decodeURIComponent(route.month||'');
  const volume=Number.parseInt(route.volume,10)||0;
  const issue=Number.parseInt(route.issue,10)||0;
  const all=await getPublishedGreenPapers();
  const papers=all.filter(p=>(p.publication_year||0)===year&&(p.publication_month||'')===month&&(Number.parseInt(String(p.volume||'0'),10)||0)===volume&&(Number.parseInt(String(p.issue||'0'),10)||0)===issue);
  const backHref=`/archives?type=green&year=${year}&month=${encodeURIComponent(month)}`;

  return <><Header/>
    <section className="pageHero" style={{padding:'30px 0 28px'}}><div className="container"><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#148444',marginBottom:4}}>GREEN Archive Issue</div><h1 style={{fontSize:34,margin:0}}>Volume {volume} / Issue {issue}</h1><p style={{fontSize:12.5,color:'#607080',margin:'8px 0 0'}}>{month} {year} · {papers.length} published article{papers.length===1?'':'s'}</p></div></section>

    <main className="container" style={{padding:'24px 0 34px'}}><div style={{maxWidth:1120,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:14}}><Link className="btn btnOutline compact" href={backHref}>← Back to Archives</Link><Link className="btn btnGreen compact" href="/green">All GREEN Papers</Link></div>
      {!papers.length?<div className="contentCard" style={{textAlign:'center',padding:'30px',color:'#687586'}}>No published papers were found for this issue.</div>:<div className="listPanel">{papers.map((p,index)=><article className="paperRow" key={p.id}>
        <div className="paperThumb" aria-label={`Paper ${index+1}`} style={{fontFamily:'Georgia,serif',fontSize:16,fontWeight:700,color:'#148444'}}>{String(index+1).padStart(2,'0')}</div>
        <div className="itemMain" style={{minWidth:0}}><div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}><span style={{fontSize:9.5,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'#14733d'}}>{p.article_id||'GREEN Research Paper'}</span><span style={{fontSize:9,color:'#7a8791'}}>{month} {year}</span></div><div className="itemTitle" style={{fontSize:14,lineHeight:1.35,overflowWrap:'anywhere'}}>{p.title}</div><div className="meta" style={{fontSize:10.5,marginTop:5}}><strong style={{color:'#40566a'}}>Author(s):</strong> {p.authors}</div>{p.doi?<div className="meta" style={{fontSize:10,marginTop:3}}>DOI: {p.doi}</div>:null}</div>
        <div className="actions" style={{justifyContent:'flex-end',flexWrap:'wrap'}}><Link className="smallBtn" href={`/green/view/${p.id}`}>View Details</Link>{p.download_url?<a className="smallBtn filledGreen" href={p.download_url}>Download PDF</a>:null}{p.certificate_view_url?<a className="smallBtn" href={p.certificate_view_url} target="_blank" rel="noreferrer" style={{borderColor:'#148444',color:'#14733d'}}>View Certificate</a>:null}{p.certificate_download_url?<a className="smallBtn" href={p.certificate_download_url} style={{borderColor:'#148444',color:'#14733d'}}>Download Certificate</a>:null}</div>
      </article>)}</div>}
    </div></main><Footer/></>;
}
