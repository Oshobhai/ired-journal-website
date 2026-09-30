import {Header,Footer} from '../components';
import {getPublishedGreenPapers,getPublishedRedBooks} from '@/lib/publications';

export const dynamic='force-dynamic';

function ArchiveIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h18v4H3z"/><path d="M5 9v11h14V9"/><path d="M9 13h6"/></svg>}

export default async function Archives(){
  const [papers,books]=await Promise.all([getPublishedGreenPapers(),getPublishedRedBooks()]);

  const greenIssues=Array.from(new Map(papers.map(p=>{
    const year=p.publication_year||0;
    const volume=Number.parseInt(String(p.volume||'0'),10)||0;
    const issue=Number.parseInt(String(p.issue||'0'),10)||0;
    const key=`${year}-${volume}-${issue}`;
    return [key,{
      key,
      year,
      volume,
      issue,
      month:p.publication_month||'',
      papers:papers.filter(x=>{
        const xv=Number.parseInt(String(x.volume||'0'),10)||0;
        const xi=Number.parseInt(String(x.issue||'0'),10)||0;
        return (x.publication_year||0)===year&&xv===volume&&xi===issue;
      }),
    }] as const;
  })).values()).sort((a,b)=>(b.year-a.year)||(b.volume-a.volume)||(b.issue-a.issue));

  const redYears=Array.from(new Set(books.map(b=>b.publication_year).filter((y):y is number=>Boolean(y)))).sort((a,b)=>b-a);

  return <><Header/>
    <section className="pageHero" style={{padding:'32px 0 30px'}}><div className="container">
      <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:42,height:42,borderRadius:'50%',background:'#fff',border:'1px solid #cad6df',display:'grid',placeItems:'center',color:'#0b2d4e'}}><ArchiveIcon/></span><div><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:3}}>Published Record</div><h1 style={{fontSize:36,margin:0}}>Archives</h1></div></div>
      <p style={{maxWidth:850,fontSize:12.5,lineHeight:1.7,color:'#5d6c79',margin:'12px 0 0'}}>Browse GREEN issues by volume and issue number. Open any issue to view its published articles, individual article pages, PDF files and publication certificates. RED publications are archived separately below.</p>
    </div></section>

    <main className="container" style={{padding:'24px 0 34px'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <section id="all-volumes" style={{marginBottom:30}}>
          <div style={{borderBottom:'2px solid #173d60',paddingBottom:10,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}><strong style={{fontFamily:'Georgia,serif',fontSize:20,color:'#0b8ea8'}}>ARCHIVE</strong><span style={{fontWeight:800,color:'#0b8ea8'}}>Link:</span><a href="https://iredjournal.org/archives" style={{fontSize:12,color:'#087f9d'}}>iredjournal.org/archives</a></div>
          </div>

          <h2 style={{fontFamily:'Georgia,serif',fontSize:18,color:'#0b2d4e',margin:'0 0 12px'}}>GREEN — All Volumes &amp; Issues</h2>
          {!greenIssues.length?<div className="contentCard" style={{textAlign:'center',padding:'30px',color:'#687586'}}>Published GREEN issues will appear here automatically after publication.</div>:<div style={{overflowX:'auto',border:'1px solid #d6e0e7',background:'#fff'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:650,fontSize:12}}>
              <thead><tr style={{background:'#f6f8fa',color:'#34495e'}}>
                <th style={{width:74,padding:'11px 10px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>S.No</th>
                <th style={{padding:'11px 12px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'left'}}>Volume / Issue</th>
                <th style={{width:180,padding:'11px 12px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'left'}}>Publication Period</th>
                <th style={{width:90,padding:'11px 10px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>Articles</th>
                <th style={{width:100,padding:'11px 10px',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>Action</th>
              </tr></thead>
              <tbody>{greenIssues.map((group,index)=><tr key={group.key}>
                <td style={{padding:'11px 10px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',textAlign:'center'}}>{index+1}.</td>
                <td style={{padding:'11px 12px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',fontWeight:700,color:'#263f58'}}>Volume {group.volume||'—'} / Issue {group.issue||'—'}</td>
                <td style={{padding:'11px 12px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',color:'#5e6e7d'}}>{group.month?`${group.month} ${group.year}`:group.year||'—'}</td>
                <td style={{padding:'11px 10px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',textAlign:'center'}}>{group.papers.length}</td>
                <td style={{padding:'8px 10px',borderBottom:'1px solid #e0e6eb',textAlign:'center'}}><a href={`#issue-${group.key}`} style={{display:'inline-block',padding:'6px 12px',border:'1px solid #0aa7c2',borderRadius:3,color:'#058ca5',fontWeight:700,background:'#fff'}}>View</a></td>
              </tr>)}</tbody>
            </table>
          </div>}
        </section>

        {greenIssues.map(group=><section id={`issue-${group.key}`} key={`detail-${group.key}`} style={{marginBottom:24,scrollMarginTop:18,border:'1px solid #dbe3e9',background:'#fff'}}>
          <div style={{padding:'12px 14px',borderBottom:'1px solid #dbe3e9',background:'#f2faf5',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <div><div style={{fontFamily:'Georgia,serif',fontWeight:700,color:'#167843',fontSize:16}}>Volume {group.volume||'—'} / Issue {group.issue||'—'}</div><div style={{fontSize:10.5,color:'#63766b',marginTop:2}}>{group.month?`${group.month} ${group.year}`:group.year} · {group.papers.length} article{group.papers.length===1?'':'s'}</div></div>
            <a href="#all-volumes" style={{fontSize:10.5,fontWeight:700,color:'#466276'}}>↑ All Volumes</a>
          </div>
          <div>{group.papers.map((p,index)=><article key={p.id} style={{display:'grid',gridTemplateColumns:'38px minmax(0,1fr) auto',gap:10,alignItems:'start',padding:'12px 13px',borderTop:index?'1px solid #edf2ee':'0'}}>
            <div style={{width:30,height:30,borderRadius:'50%',display:'grid',placeItems:'center',background:'#edf7f0',color:'#167843',fontWeight:800,fontSize:10}}>{index+1}</div>
            <div><div style={{fontSize:12,fontWeight:800,color:'#173d60'}}>{p.title}</div><div style={{fontSize:10.5,color:'#667787',marginTop:3}}>{p.authors}{p.article_id?` · ${p.article_id}`:''}{p.doi?` · DOI: ${p.doi}`:''}</div></div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>{p.view_url?<a href={p.view_url} style={{fontSize:10.5,fontWeight:700,color:'#126f3a',whiteSpace:'nowrap'}}>View Article →</a>:null}{p.download_url?<a href={p.download_url} style={{fontSize:10.5,fontWeight:700,color:'#506577',whiteSpace:'nowrap'}}>PDF</a>:null}{p.certificate_view_url?<a href={p.certificate_view_url} target="_blank" rel="noreferrer" style={{fontSize:10.5,fontWeight:700,color:'#126f3a',whiteSpace:'nowrap'}}>Certificate</a>:null}{p.certificate_download_url?<a href={p.certificate_download_url} style={{fontSize:10.5,fontWeight:700,color:'#506577',whiteSpace:'nowrap'}}>Certificate PDF</a>:null}</div>
          </article>)}</div>
        </section>)}

        <section style={{marginTop:34}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:14,borderBottom:'2px solid #8e2026',paddingBottom:8,marginBottom:14}}><h2 style={{fontFamily:'Georgia,serif',fontSize:22,color:'#8e2026',margin:0}}>RED — Books &amp; Publications</h2><span style={{fontSize:10.5,color:'#71808d'}}>{books.length} publication{books.length===1?'':'s'}</span></div>
          {!redYears.length?<div style={{padding:14,border:'1px solid #dbe3e9',fontSize:11,color:'#7a8792'}}>No RED publications are currently archived.</div>:redYears.map(year=>{
            const rb=books.filter(b=>b.publication_year===year);
            return <div key={year} style={{border:'1px solid #dbe3e9',background:'#fff',marginBottom:16}}>
              <div style={{padding:'10px 13px',borderBottom:'1px solid #dbe3e9',background:'#fff8f8',fontFamily:'Georgia,serif',fontWeight:700,color:'#bd2025'}}>Year {year}</div>
              {rb.map(b=><div key={b.id} style={{padding:'12px 13px',borderBottom:'1px solid #edf1f4',display:'grid',gridTemplateColumns:'50px 1fr auto',gap:10,alignItems:'start'}}>{b.cover_url?<img src={b.cover_url} alt="" style={{width:48,height:64,objectFit:'cover',border:'1px solid #ddd'}}/>:<div style={{width:48,height:64,display:'grid',placeItems:'center',background:'#f3eded',fontSize:9,color:'#9a4a4d'}}>RED</div>}<div><div style={{fontSize:12,fontWeight:800,color:'#173d60'}}>{b.title}</div><div style={{fontSize:10.5,color:'#667787',marginTop:3}}>{[b.publication_month,b.publication_year].filter(Boolean).join(' ')}{b.volume?` · Vol. ${b.volume}`:''}{b.issue?` · Issue ${b.issue}`:''}</div></div><a href={b.view_url} style={{fontSize:10.5,fontWeight:700,color:'#a61d22',whiteSpace:'nowrap'}}>View Publication →</a></div>)}
            </div>;
          })}
        </section>
      </div>
    </main><Footer/></>;
}
