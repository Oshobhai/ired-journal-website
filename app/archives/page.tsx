import {Header,Footer} from '../components';
import {getPublishedGreenPapers,getPublishedRedBooks} from '@/lib/publications';

export const dynamic='force-dynamic';

function ArchiveIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h18v4H3z"/><path d="M5 9v11h14V9"/><path d="M9 13h6"/></svg>}

export default async function Archives(){
  const [papers,books]=await Promise.all([getPublishedGreenPapers(),getPublishedRedBooks()]);
  const years=Array.from(new Set([...papers.map(p=>p.publication_year),...books.map(b=>b.publication_year)].filter((y):y is number=>Boolean(y)))).sort((a,b)=>b-a);
  return <><Header/>
    <section className="pageHero" style={{padding:'32px 0 30px'}}><div className="container">
      <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:42,height:42,borderRadius:'50%',background:'#fff',border:'1px solid #cad6df',display:'grid',placeItems:'center',color:'#0b2d4e'}}><ArchiveIcon/></span><div><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:3}}>Published Record</div><h1 style={{fontSize:36,margin:0}}>Archives</h1></div></div>
      <p style={{maxWidth:850,fontSize:12.5,lineHeight:1.7,color:'#5d6c79',margin:'12px 0 0'}}>GREEN research papers are organised by publication year, volume and issue, with an individual article page, PDF link and publication certificate when available. RED books and publications are archived separately.</p>
    </div></section>

    <main className="container" style={{padding:'24px 0 34px'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        {!years.length?<div className="contentCard" style={{textAlign:'center',padding:'30px',color:'#687586'}}>Published items will appear in the archive automatically after publication.</div>:years.map(year=>{
          const gp=papers.filter(p=>p.publication_year===year);
          const rb=books.filter(b=>b.publication_year===year);
          const issueGroups=Array.from(new Map(gp.map(p=>{
            const volume=Number.parseInt(String(p.volume||'0'),10)||0;
            const issue=Number.parseInt(String(p.issue||'0'),10)||0;
            return [`${volume}-${issue}`,{volume,issue,month:p.publication_month||'',papers:gp.filter(x=>(Number.parseInt(String(x.volume||'0'),10)||0)===volume&&(Number.parseInt(String(x.issue||'0'),10)||0)===issue)}] as const;
          })).values()).sort((a,b)=>(b.volume-a.volume)||(b.issue-a.issue));
          return <section key={year} style={{marginBottom:32}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:14,borderBottom:'2px solid #173d60',paddingBottom:8,marginBottom:14}}><h2 style={{fontFamily:'Georgia,serif',fontSize:24,color:'#0b2d4e',margin:0}}>Year {year}</h2><div style={{fontSize:11,color:'#71808d'}}>{gp.length} GREEN paper{gp.length===1?'':'s'} · {rb.length} RED publication{rb.length===1?'':'s'}</div></div>

            <div style={{border:'1px solid #dbe3e9',background:'#fff',marginBottom:18}}>
              <div style={{padding:'11px 14px',borderBottom:'1px solid #dbe3e9',background:'#f2faf5',fontFamily:'Georgia,serif',fontWeight:700,color:'#167843'}}>GREEN: Research Papers</div>
              {issueGroups.length?issueGroups.map(group=><section key={`${group.volume}-${group.issue}`} style={{borderBottom:'1px solid #e6ece8'}}>
                <div style={{padding:'9px 13px',background:'#fbfdfb',display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><strong style={{fontSize:11.5,color:'#244a35'}}>Volume {group.volume||'—'} · Issue {group.issue||'—'}{group.month?` · ${group.month} ${year}`:` · ${year}`}</strong><span style={{fontSize:10,color:'#758279'}}>{group.papers.length} article{group.papers.length===1?'':'s'}</span></div>
                <div>{group.papers.map((p,index)=><article key={p.id} style={{display:'grid',gridTemplateColumns:'38px minmax(0,1fr) auto',gap:10,alignItems:'start',padding:'11px 13px',borderTop:'1px solid #edf2ee'}}><div style={{width:30,height:30,borderRadius:'50%',display:'grid',placeItems:'center',background:'#edf7f0',color:'#167843',fontWeight:800,fontSize:10}}>{index+1}</div><div><div style={{fontSize:12,fontWeight:800,color:'#173d60'}}>{p.title}</div><div style={{fontSize:10.5,color:'#667787',marginTop:3}}>{p.authors}{p.article_id?` · ${p.article_id}`:''}{p.doi?` · DOI: ${p.doi}`:''}</div></div><div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>{p.view_url?<a href={p.view_url} style={{fontSize:10.5,fontWeight:700,color:'#126f3a',whiteSpace:'nowrap'}}>View Article →</a>:null}{p.download_url?<a href={p.download_url} style={{fontSize:10.5,fontWeight:700,color:'#506577',whiteSpace:'nowrap'}}>PDF</a>:null}{p.certificate_view_url?<a href={p.certificate_view_url} target="_blank" rel="noreferrer" style={{fontSize:10.5,fontWeight:700,color:'#126f3a',whiteSpace:'nowrap'}}>Certificate</a>:null}{p.certificate_download_url?<a href={p.certificate_download_url} style={{fontSize:10.5,fontWeight:700,color:'#506577',whiteSpace:'nowrap'}}>Certificate PDF</a>:null}</div></article>)}</div>
              </section>):<div style={{padding:14,fontSize:11,color:'#7a8792'}}>No GREEN papers for this year.</div>}
            </div>

            <div style={{border:'1px solid #dbe3e9',background:'#fff'}}>
              <div style={{padding:'10px 13px',borderBottom:'1px solid #dbe3e9',background:'#fff8f8',fontFamily:'Georgia,serif',fontWeight:700,color:'#bd2025'}}>RED: Books & Publications</div>
              {rb.length?rb.map(b=><div key={b.id} style={{padding:'12px 13px',borderBottom:'1px solid #edf1f4',display:'grid',gridTemplateColumns:'50px 1fr auto',gap:10,alignItems:'start'}}>{b.cover_url?<img src={b.cover_url} alt="" style={{width:48,height:64,objectFit:'cover',border:'1px solid #ddd'}}/>:<div style={{width:48,height:64,display:'grid',placeItems:'center',background:'#f3eded',fontSize:9,color:'#9a4a4d'}}>RED</div>}<div><div style={{fontSize:12,fontWeight:800,color:'#173d60'}}>{b.title}</div><div style={{fontSize:10.5,color:'#667787',marginTop:3}}>{[b.publication_month,b.publication_year].filter(Boolean).join(' ')}{b.volume?` · Vol. ${b.volume}`:''}{b.issue?` · Issue ${b.issue}`:''}</div></div><a href={b.view_url} style={{fontSize:10.5,fontWeight:700,color:'#a61d22',whiteSpace:'nowrap'}}>View Publication →</a></div>):<div style={{padding:14,fontSize:11,color:'#7a8792'}}>No RED publications for this year.</div>}
            </div>
          </section>
        })}
      </div>
    </main><Footer/></>;
}
