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
      <p style={{maxWidth:850,fontSize:12.5,lineHeight:1.7,color:'#5d6c79',margin:'12px 0 0'}}>Browse previously published GREEN research papers and RED research books by publication year, volume and issue.</p>
    </div></section>

    <main className="container" style={{padding:'24px 0 34px'}}>
      <div style={{maxWidth:1080,margin:'0 auto'}}>
        {!years.length?<div className="contentCard" style={{textAlign:'center',padding:'30px',color:'#687586'}}>Published items will appear in the archive automatically after publication.</div>:years.map(year=>{
          const gp=papers.filter(p=>p.publication_year===year);
          const rb=books.filter(b=>b.publication_year===year);
          return <section key={year} style={{marginBottom:28}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:14,borderBottom:'2px solid #173d60',paddingBottom:8,marginBottom:14}}><h2 style={{fontFamily:'Georgia,serif',fontSize:24,color:'#0b2d4e',margin:0}}>{year}</h2><div style={{fontSize:11,color:'#71808d'}}>{gp.length+rb.length} publication{gp.length+rb.length===1?'':'s'}</div></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
              <div style={{border:'1px solid #dbe3e9',background:'#fff'}}>
                <div style={{padding:'10px 13px',borderBottom:'1px solid #dbe3e9',background:'#f7fbf8',fontFamily:'Georgia,serif',fontWeight:700,color:'#167843'}}>GREEN Research Papers</div>
                {gp.length?gp.map(p=><div key={p.id} style={{padding:'12px 13px',borderBottom:'1px solid #edf1f4'}}><div style={{fontSize:12,fontWeight:800,color:'#173d60'}}>{p.title}</div><div style={{fontSize:10.5,color:'#667787',marginTop:3}}>{p.authors}{p.volume?` · Vol. ${p.volume}`:''}{p.issue?` · Issue ${p.issue}`:''}</div><div style={{marginTop:7,display:'flex',gap:8}}>{p.view_url?<a href={p.view_url} target="_blank" rel="noreferrer" style={{fontSize:10.5,fontWeight:700,color:'#126f3a'}}>View Article →</a>:null}{p.download_url?<a href={p.download_url} style={{fontSize:10.5,fontWeight:700,color:'#506577'}}>Download PDF</a>:null}</div></div>):<div style={{padding:14,fontSize:11,color:'#7a8792'}}>No GREEN papers for this year.</div>}
              </div>
              <div style={{border:'1px solid #dbe3e9',background:'#fff'}}>
                <div style={{padding:'10px 13px',borderBottom:'1px solid #dbe3e9',background:'#fff8f8',fontFamily:'Georgia,serif',fontWeight:700,color:'#bd2025'}}>RED Research Books</div>
                {rb.length?rb.map(b=><div key={b.id} style={{padding:'12px 13px',borderBottom:'1px solid #edf1f4',display:'grid',gridTemplateColumns:'50px 1fr auto',gap:10,alignItems:'start'}}>{b.cover_url?<img src={b.cover_url} alt="" style={{width:48,height:64,objectFit:'cover',border:'1px solid #ddd'}}/>:<div style={{width:48,height:64,display:'grid',placeItems:'center',background:'#f3eded',fontSize:9,color:'#9a4a4d'}}>RED</div>}<div><div style={{fontSize:12,fontWeight:800,color:'#173d60'}}>{b.title}</div><div style={{fontSize:10.5,color:'#667787',marginTop:3}}>{[b.publication_month,b.publication_year].filter(Boolean).join(' ')}{b.volume?` · Vol. ${b.volume}`:''}{b.issue?` · Issue ${b.issue}`:''}</div></div><a href={b.view_url} style={{fontSize:10.5,fontWeight:700,color:'#a61d22',whiteSpace:'nowrap'}}>View Book →</a></div>):<div style={{padding:14,fontSize:11,color:'#7a8792'}}>No RED books for this year.</div>}
              </div>
            </div>
          </section>
        })}
      </div>
    </main><Footer/></>;
}
