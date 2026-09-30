import Link from 'next/link';
import {Header,Footer} from '../components';
import {getPublishedGreenPapers,getPublishedRedBooks} from '@/lib/publications';

export const dynamic='force-dynamic';

function ArchiveIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h18v4H3z"/><path d="M5 9v11h14V9"/><path d="M9 13h6"/></svg>}

const monthOrder=['January','February','March','April','May','June','July','August','September','October','November','December'];

export default async function Archives({searchParams}:{searchParams:Promise<{type?:string;year?:string;month?:string}>}){
  const params=await searchParams;
  const publicationType=params.type==='red'?'red':params.type==='green'?'green':'all';
  const yearText=(params.year||'').trim();
  const monthText=(params.month||'').trim();
  const selectedYear=yearText?Number(yearText):null;
  const [papers,books]=await Promise.all([getPublishedGreenPapers(),getPublishedRedBooks()]);

  const greenIssues=Array.from(new Map(papers.map(p=>{
    const year=p.publication_year||0;
    const volume=Number.parseInt(String(p.volume||'0'),10)||0;
    const issue=Number.parseInt(String(p.issue||'0'),10)||0;
    const month=p.publication_month||'';
    const key=`${year}-${volume}-${issue}-${month}`;
    return [key,{key,year,volume,issue,month,papers:papers.filter(x=>{
      const xv=Number.parseInt(String(x.volume||'0'),10)||0;
      const xi=Number.parseInt(String(x.issue||'0'),10)||0;
      return (x.publication_year||0)===year&&xv===volume&&xi===issue&&(x.publication_month||'')===month;
    })}] as const;
  })).values()).sort((a,b)=>(b.year-a.year)||(b.volume-a.volume)||(b.issue-a.issue));

  const allYears=Array.from(new Set([...papers.map(p=>p.publication_year),...books.map(b=>b.publication_year)].filter((y):y is number=>Boolean(y)))).sort((a,b)=>b-a);
  const allMonths=Array.from(new Set([...papers.map(p=>p.publication_month),...books.map(b=>b.publication_month)].filter((m):m is string=>Boolean(m)))).sort((a,b)=>monthOrder.indexOf(a)-monthOrder.indexOf(b));

  const filteredGreen=greenIssues.filter(group=>(publicationType==='all'||publicationType==='green')&&(!selectedYear||group.year===selectedYear)&&(!monthText||group.month===monthText));
  const filteredRed=books.filter(book=>(publicationType==='all'||publicationType==='red')&&(!selectedYear||book.publication_year===selectedYear)&&(!monthText||(book.publication_month||'')===monthText));
  const redYears=Array.from(new Set(filteredRed.map(b=>b.publication_year).filter((y):y is number=>Boolean(y)))).sort((a,b)=>b-a);
  const hasFilter=publicationType!=='all'||Boolean(yearText)||Boolean(monthText);

  return <><Header/>
    <section className="pageHero" style={{padding:'32px 0 30px'}}><div className="container">
      <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:42,height:42,borderRadius:'50%',background:'#fff',border:'1px solid #cad6df',display:'grid',placeItems:'center',color:'#0b2d4e'}}><ArchiveIcon/></span><div><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:3}}>Published Record</div><h1 style={{fontSize:36,margin:0}}>Archives</h1></div></div>
      <p style={{maxWidth:850,fontSize:12.5,lineHeight:1.7,color:'#5d6c79',margin:'12px 0 0'}}>Choose GREEN or RED, then select the publication year and month to quickly locate the required issue or publication.</p>
    </div></section>

    <main className="container" style={{padding:'24px 0 34px'}}><div style={{maxWidth:1120,margin:'0 auto'}}>
      <form action="/archives" method="get" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(160px,1fr)) auto auto',gap:10,alignItems:'end',padding:14,border:'1px solid #d6e0e7',background:'#f8fafb',borderRadius:5,marginBottom:26}}>
        <label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Publication Type<select name="type" defaultValue={publicationType} style={{display:'block',width:'100%',marginTop:5,padding:'9px 10px',border:'1px solid #cbd6de',borderRadius:3,background:'#fff'}}><option value="all">GREEN & RED</option><option value="green">GREEN</option><option value="red">RED</option></select></label>
        <label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Year<select name="year" defaultValue={yearText} style={{display:'block',width:'100%',marginTop:5,padding:'9px 10px',border:'1px solid #cbd6de',borderRadius:3,background:'#fff'}}><option value="">All Years</option>{allYears.map(year=><option key={year} value={year}>{year}</option>)}</select></label>
        <label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Month<select name="month" defaultValue={monthText} style={{display:'block',width:'100%',marginTop:5,padding:'9px 10px',border:'1px solid #cbd6de',borderRadius:3,background:'#fff'}}><option value="">All Months</option>{allMonths.map(month=><option key={month} value={month}>{month}</option>)}</select></label>
        <button className="btn btnGreen compact" type="submit">Find</button>
        {hasFilter?<Link className="btn btnOutline compact" href="/archives">Clear</Link>:<span/>}
      </form>

      {(publicationType==='all'||publicationType==='green')?<section style={{marginBottom:30}}>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:18,color:'#0b2d4e',margin:'0 0 12px'}}>GREEN — Volumes &amp; Issues</h2>
        {!filteredGreen.length?<div className="contentCard" style={{textAlign:'center',padding:'24px',color:'#687586'}}>No GREEN issue matches the selected year and month.</div>:<div style={{overflowX:'auto',border:'1px solid #d6e0e7',background:'#fff'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:650,fontSize:12}}>
          <thead><tr style={{background:'#f6f8fa',color:'#34495e'}}><th style={{width:74,padding:'11px 10px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>S.No</th><th style={{padding:'11px 12px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'left'}}>Volume / Issue</th><th style={{width:180,padding:'11px 12px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'left'}}>Publication Period</th><th style={{width:90,padding:'11px 10px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>Articles</th><th style={{width:100,padding:'11px 10px',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>Action</th></tr></thead>
          <tbody>{filteredGreen.map((group,index)=><tr key={group.key}><td style={{padding:'11px 10px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',textAlign:'center'}}>{index+1}.</td><td style={{padding:'11px 12px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',fontWeight:700,color:'#263f58'}}>Volume {group.volume||'—'} / Issue {group.issue||'—'}</td><td style={{padding:'11px 12px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',color:'#5e6e7d'}}>{group.month?`${group.month} ${group.year}`:group.year||'—'}</td><td style={{padding:'11px 10px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',textAlign:'center'}}>{group.papers.length}</td><td style={{padding:'8px 10px',borderBottom:'1px solid #e0e6eb',textAlign:'center'}}><Link href={`/archives/green/${group.year}/${encodeURIComponent(group.month||'unknown')}/${group.volume}/${group.issue}`} style={{display:'inline-block',padding:'6px 12px',border:'1px solid #0aa7c2',borderRadius:3,color:'#058ca5',fontWeight:700,background:'#fff'}}>View</Link></td></tr>)}</tbody>
        </table></div>}
      </section>:null}

      {(publicationType==='all'||publicationType==='red')?<section style={{marginTop:34}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:14,borderBottom:'2px solid #8e2026',paddingBottom:8,marginBottom:14}}><h2 style={{fontFamily:'Georgia,serif',fontSize:22,color:'#8e2026',margin:0}}>RED — Publications</h2><span style={{fontSize:10.5,color:'#71808d'}}>{filteredRed.length} publication{filteredRed.length===1?'':'s'}</span></div>
        {!filteredRed.length?<div style={{padding:18,border:'1px solid #dbe3e9',fontSize:11,color:'#7a8792'}}>No RED publication matches the selected year and month.</div>:redYears.map(year=>{const rb=filteredRed.filter(b=>b.publication_year===year);return <div key={year} style={{border:'1px solid #dbe3e9',background:'#fff',marginBottom:16}}><div style={{padding:'10px 13px',borderBottom:'1px solid #dbe3e9',background:'#fff8f8',fontFamily:'Georgia,serif',fontWeight:700,color:'#bd2025'}}>Year {year}</div>{rb.map(b=><div key={b.id} style={{padding:'12px 13px',borderBottom:'1px solid #edf1f4',display:'grid',gridTemplateColumns:'50px 1fr auto',gap:10,alignItems:'start'}}>{b.cover_url?<img src={b.cover_url} alt="" style={{width:48,height:64,objectFit:'cover',border:'1px solid #ddd'}}/>:<div style={{width:48,height:64,display:'grid',placeItems:'center',background:'#f3eded',fontSize:9,color:'#9a4a4d'}}>RED</div>}<div><div style={{fontSize:12,fontWeight:800,color:'#173d60'}}>{b.title}</div><div style={{fontSize:10.5,color:'#667787',marginTop:3}}>{[b.publication_month,b.publication_year].filter(Boolean).join(' ')}{b.volume?` · Vol. ${b.volume}`:''}{b.issue?` · Issue ${b.issue}`:''}</div></div><a href={b.view_url} style={{fontSize:10.5,fontWeight:700,color:'#a61d22',whiteSpace:'nowrap'}}>View Publication →</a></div>)}</div>})}
      </section>:null}
    </div></main><Footer/></>;
}
