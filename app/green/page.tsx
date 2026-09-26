import Link from 'next/link';
import {Header,Footer} from '../components';
import {getPublishedGreenPapers} from '@/lib/publications';

export const dynamic = 'force-dynamic';

export default async function Green(){
  const papers = await getPublishedGreenPapers();
  return <><Header/><section className="pageHero"><div className="container"><div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#14733d',marginBottom:4}}>Official Journal</div><h1>GREEN: The Research Journal</h1><p style={{fontSize:12.5,color:'#607080',margin:'7px 0 0'}}>International · Peer-reviewed · Open-access · Multidisciplinary</p></div></section><main className="container" style={{padding:'22px 0 34px'}}>
    <section className="contentCard" style={{borderTop:'4px solid #148444'}}><div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(220px,320px)',gap:20,alignItems:'start'}}><div><h2 style={{marginTop:0}}>Journal Information</h2><p>GREEN: The Research Journal is an international, peer-reviewed, open-access research journal published by the Institute of Research Education and Development (IRED).</p><p>The journal publishes original and unpublished research papers and scholarly articles across Arts, Humanities, Sciences, Social Sciences, Commerce, Management and related disciplines.</p><div style={{fontSize:11.5,lineHeight:1.7,color:'#526577'}}><strong>Publishing Body & Publisher:</strong> Institute of Research Education and Development (IRED)<br/><strong>Editor in Chief:</strong> Dr. Bhavika Kadikar, Librarian and Assistant Professor, Surendranagar University, Wadhwan<br/><strong>Official Address:</strong> A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.<br/><strong>Email:</strong> ired.foundation@gmail.com</div><div style={{marginTop:14,display:'flex',gap:8,flexWrap:'wrap'}}><Link className="btn btnOutline compact" href="/journal-information">Full Journal Information</Link><Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link></div></div><img src="/green-logo-family.svg?v=1" alt="GREEN: The Research Journal" style={{width:'100%',maxHeight:150,objectFit:'contain'}}/></div></section>

    <section className="contentCard"><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:16,flexWrap:'wrap',marginBottom:14}}><div><div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#148444',marginBottom:4}}>GREEN Journal Archive</div><h2 style={{margin:'0 0 5px'}}>Published Research Papers</h2><p style={{margin:0,color:'#617181',fontSize:12.5}}>Individual research papers and scholarly articles appear here after editorial approval and publication.</p></div><div style={{fontSize:10.5,color:'#6d7b87'}}>{papers.length} published paper{papers.length===1?'':'s'}</div></div>

      <div className="listPanel">{papers.length ? papers.map((p)=><article className="paperRow" key={p.id}>
        <div className="paperThumb" aria-hidden="true" style={{fontFamily:'Georgia,serif',fontSize:19,fontWeight:700,color:'#148444'}}>G</div>
        <div className="itemMain" style={{minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}><span style={{fontSize:9.5,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'#14733d'}}>{p.article_id||'GREEN Research Paper'}</span><span style={{fontSize:9,color:'#7a8791'}}>{[p.publication_month,p.publication_year].filter(Boolean).join(' ')}</span></div>
          <div className="itemTitle" style={{fontSize:14,lineHeight:1.35,overflowWrap:'anywhere'}}>{p.title}</div>
          <div className="meta" style={{fontSize:10.5,marginTop:5}}><strong style={{color:'#40566a'}}>Author(s):</strong> {p.authors}</div>
          <div className="meta" style={{fontSize:10,marginTop:3}}>{p.volume ? `Volume ${p.volume}` : ''}{p.issue ? `${p.volume?' · ':''}Issue ${p.issue}` : ''}{p.doi ? `${p.volume||p.issue?' · ':''}DOI: ${p.doi}` : ''}</div>
        </div>
        <div className="actions" style={{justifyContent:'flex-end',flexWrap:'wrap'}}><Link className="smallBtn" href={`/green/view/${p.id}`}>View Details</Link>{p.download_url ? <a className="smallBtn filledGreen" href={p.download_url}>Download PDF</a> : null}</div>
      </article>) : <div style={{padding:'22px',color:'#687586'}}>No published GREEN papers yet.</div>}</div>
    </section>
  </main><Footer/></>}
