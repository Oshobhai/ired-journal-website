import Link from 'next/link';
import {Header,Footer} from '../components';
import {getGreenArchive} from '@/lib/publications';

export const dynamic = 'force-dynamic';

function pageHref(q:string,year:string,page:number){
  const params=new URLSearchParams();
  if(q)params.set('q',q);
  if(year)params.set('year',year);
  if(page>1)params.set('page',String(page));
  const qs=params.toString();
  return qs?`/green?${qs}`:'/green';
}

export default async function Green({searchParams}:{searchParams:Promise<{q?:string;year?:string;page?:string}>}){
  const params=await searchParams;
  const q=(params.q||'').trim();
  const yearText=(params.year||'').trim();
  const year=yearText?Number(yearText):null;
  const requestedPage=Math.max(Number(params.page)||1,1);
  const archive=await getGreenArchive({q,year:Number.isFinite(year as number)?year:null,page:requestedPage,pageSize:10});
  const currentPage=Math.min(Math.max(archive.page,1),Math.max(archive.totalPages,1));

  return <><Header/><section className="pageHero"><div className="container"><div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#14733d',marginBottom:4}}>Official Journal</div><h1>GREEN: The Research Journal</h1><p style={{fontSize:12.5,color:'#607080',margin:'7px 0 0'}}>International · Peer-reviewed · Open-access · Multidisciplinary</p></div></section><main className="container" style={{padding:'22px 0 34px'}}>
    <section className="contentCard" style={{borderTop:'4px solid #148444'}}><div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(220px,320px)',gap:20,alignItems:'start'}}><div><h2 style={{marginTop:0}}>Journal Information</h2><p>GREEN: The Research Journal is an international, peer-reviewed, open-access research journal published by the Institute of Research Education and Development (IRED).</p><p>The journal publishes original and unpublished research papers and scholarly articles across Arts, Humanities, Sciences, Social Sciences, Commerce, Management and related disciplines.</p><div style={{fontSize:11.5,lineHeight:1.7,color:'#526577'}}><strong>Publishing Body & Publisher:</strong> Institute of Research Education and Development (IRED)<br/><strong>Editor in Chief:</strong> Dr. Bhavika Kadikar, Librarian and Assistant Professor, Surendranagar University, Wadhwan<br/><strong>Official Address:</strong> A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.<br/><strong>Email:</strong> ired.foundation@gmail.com</div><div style={{marginTop:14,display:'flex',gap:8,flexWrap:'wrap'}}><Link className="btn btnOutline compact" href="/journal-information">Full Journal Information</Link><Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link></div></div><img src="/api/brand/green_logo" alt="GREEN: The Research Journal" style={{width:'100%',maxHeight:150,objectFit:'contain'}}/></div></section>

    <section className="contentCard"><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:16,flexWrap:'wrap',marginBottom:14}}><div><div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#148444',marginBottom:4}}>GREEN Journal Archive</div><h2 style={{margin:'0 0 5px'}}>Published Research Papers</h2><p style={{margin:0,color:'#617181',fontSize:12.5}}>Search by paper title, author, article ID, DOI or abstract. Use year filtering when the archive grows.</p></div><div style={{fontSize:10.5,color:'#6d7b87'}}>{archive.total} published paper{archive.total===1?'':'s'}</div></div>

      <form action="/green" method="get" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 150px auto auto',gap:8,alignItems:'end',padding:'12px',border:'1px solid #dbe4e9',background:'#f8fafb',borderRadius:5,marginBottom:12}}>
        <label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Search papers<input name="q" defaultValue={q} placeholder="Title, author, article ID, DOI..." style={{display:'block',width:'100%',marginTop:4,padding:'9px 10px',border:'1px solid #cbd6de',borderRadius:3,fontSize:11}}/></label>
        <label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Year<input name="year" defaultValue={yearText} inputMode="numeric" placeholder="2026" style={{display:'block',width:'100%',marginTop:4,padding:'9px 10px',border:'1px solid #cbd6de',borderRadius:3,fontSize:11}}/></label>
        <button className="btn btnGreen compact" type="submit">Search</button>
        {(q||yearText)?<Link className="btn btnOutline compact" href="/green">Clear</Link>:<span/>}
      </form>

      {(q||yearText)?<div style={{fontSize:10.5,color:'#5f6f7c',margin:'0 0 9px'}}>Showing {archive.total} result{archive.total===1?'':'s'}{q?<> for <strong>“{q}”</strong></>:null}{yearText?<> · Year <strong>{yearText}</strong></>:null}</div>:null}

      <div className="listPanel">{archive.papers.length ? archive.papers.map((p)=><article className="paperRow" key={p.id}>
        <div className="paperThumb" aria-hidden="true" style={{fontFamily:'Georgia,serif',fontSize:19,fontWeight:700,color:'#148444'}}>G</div>
        <div className="itemMain" style={{minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}><span style={{fontSize:9.5,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'#14733d'}}>{p.article_id||'GREEN Research Paper'}</span><span style={{fontSize:9,color:'#7a8791'}}>{[p.publication_month,p.publication_year].filter(Boolean).join(' ')}</span></div>
          <div className="itemTitle" style={{fontSize:14,lineHeight:1.35,overflowWrap:'anywhere'}}>{p.title}</div>
          <div className="meta" style={{fontSize:10.5,marginTop:5}}><strong style={{color:'#40566a'}}>Author(s):</strong> {p.authors}</div>
          <div className="meta" style={{fontSize:10,marginTop:3}}>{p.volume ? `Volume ${p.volume}` : ''}{p.issue ? `${p.volume?' · ':''}Issue ${p.issue}` : ''}{p.doi ? `${p.volume||p.issue?' · ':''}DOI: ${p.doi}` : ''}</div>
        </div>
        <div className="actions" style={{justifyContent:'flex-end',flexWrap:'wrap'}}><Link className="smallBtn" href={`/green/view/${p.id}`}>View Details</Link>{p.download_url ? <a className="smallBtn filledGreen" href={p.download_url}>Download PDF</a> : null}</div>
      </article>) : <div style={{padding:'24px',textAlign:'center',color:'#687586'}}>No published papers match your search.</div>}</div>

      {archive.totalPages>1?<nav aria-label="GREEN archive pages" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginTop:12}}><div style={{fontSize:10.5,color:'#6a7884'}}>Page {currentPage} of {archive.totalPages}</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{currentPage>1?<Link className="smallBtn" href={pageHref(q,yearText,currentPage-1)}>← Previous</Link>:null}{Array.from({length:Math.min(5,archive.totalPages)},(_,i)=>{const start=Math.max(1,Math.min(currentPage-2,archive.totalPages-4));const p=start+i;return p<=archive.totalPages?<Link key={p} className="smallBtn" href={pageHref(q,yearText,p)} style={p===currentPage?{background:'#148444',borderColor:'#148444',color:'#fff'}:undefined}>{p}</Link>:null})}{currentPage<archive.totalPages?<Link className="smallBtn" href={pageHref(q,yearText,currentPage+1)}>Next →</Link>:null}</div></nav>:null}
    </section>
  </main><Footer/></>}
