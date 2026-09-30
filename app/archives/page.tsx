import Link from 'next/link';
import {Header,Footer} from '../components';
import {getPublishedGreenPapers,getPublishedRedBooks} from '@/lib/publications';

export const dynamic='force-dynamic';

function ArchiveIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h18v4H3z"/><path d="M5 9v11h14V9"/><path d="M9 13h6"/></svg>}
function TypeIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>}
function CalendarIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 3v3M19 3v3M4 8h16M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>}
function MonthIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>}
function SearchIcon(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>}
function GreenIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h10l4 4v12H5z"/><path d="M15 4v5h4M8 13h8M8 17h6"/></svg>}
function RedIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8"/></svg>}

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

  const filterCard={display:'grid',gridTemplateColumns:'36px minmax(0,1fr)',gap:10,alignItems:'center',padding:'10px 11px',background:'#fff',border:'1px solid #dbe4ea',borderRadius:6} as const;
  const fieldIcon={width:36,height:36,borderRadius:5,display:'grid',placeItems:'center',background:'#eef4f8',color:'#173d60',border:'1px solid #d9e3e9'} as const;
  const selectStyle={display:'block',width:'100%',marginTop:4,padding:'8px 10px',border:'1px solid #cbd6de',borderRadius:3,background:'#fff',fontSize:11.5,color:'#263f58'} as const;

  return <><Header/>
    <section className="pageHero" style={{padding:'32px 0 30px'}}><div className="container">
      <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:42,height:42,borderRadius:'50%',background:'#fff',border:'1px solid #cad6df',display:'grid',placeItems:'center',color:'#0b2d4e'}}><ArchiveIcon/></span><div><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:3}}>Published Record</div><h1 style={{fontSize:36,margin:0}}>Archives</h1></div></div>
      <p style={{maxWidth:850,fontSize:12.5,lineHeight:1.7,color:'#5d6c79',margin:'12px 0 0'}}>Locate published work by journal type, publication year and month. GREEN issues and RED publications are maintained as structured academic records.</p>
    </div></section>

    <main className="container" style={{padding:'24px 0 34px'}}><div style={{maxWidth:1120,margin:'0 auto'}}>
      <section style={{border:'1px solid #d6e0e7',background:'#f7f9fb',borderRadius:7,padding:14,marginBottom:28,boxShadow:'0 2px 8px rgba(18,48,72,.04)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:14,flexWrap:'wrap',paddingBottom:11,marginBottom:12,borderBottom:'1px solid #dfe6eb'}}>
          <div><div style={{fontSize:10,letterSpacing:'.1em',fontWeight:800,textTransform:'uppercase',color:'#6d7c89'}}>Archive Navigator</div><div style={{fontFamily:'Georgia,serif',fontWeight:700,fontSize:17,color:'#0b2d4e',marginTop:2}}>Find a Publication</div></div>
          <div style={{fontSize:10.5,color:'#6b7b88'}}>Select type, year and month</div>
        </div>
        <form action="/archives" method="get" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(190px,1fr)) auto auto',gap:10,alignItems:'stretch'}}>
          <div style={filterCard}><span style={fieldIcon}><TypeIcon/></span><label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Publication Type<select name="type" defaultValue={publicationType} style={selectStyle}><option value="all">GREEN &amp; RED</option><option value="green">GREEN</option><option value="red">RED</option></select></label></div>
          <div style={filterCard}><span style={fieldIcon}><CalendarIcon/></span><label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Year<select name="year" defaultValue={yearText} style={selectStyle}><option value="">All Years</option>{allYears.map(year=><option key={year} value={year}>{year}</option>)}</select></label></div>
          <div style={filterCard}><span style={fieldIcon}><MonthIcon/></span><label style={{fontSize:10,fontWeight:800,color:'#41586b'}}>Month<select name="month" defaultValue={monthText} style={selectStyle}><option value="">All Months</option>{allMonths.map(month=><option key={month} value={month}>{month}</option>)}</select></label></div>
          <button className="btn btnGreen compact" type="submit" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7,minHeight:58,padding:'0 18px'}}><SearchIcon/>Find</button>
          {hasFilter?<Link className="btn btnOutline compact" href="/archives" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:58,padding:'0 16px'}}>Clear</Link>:<span/>}
        </form>
      </section>

      {(publicationType==='all'||publicationType==='green')?<section style={{marginBottom:32}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,marginBottom:12,paddingBottom:9,borderBottom:'2px solid #148444'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}><span style={{width:38,height:38,borderRadius:6,display:'grid',placeItems:'center',background:'#edf8f1',border:'1px solid #cee7d6',color:'#148444'}}><GreenIcon/></span><div><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:'#5e7567'}}>Online Research Journal</div><h2 style={{fontFamily:'Georgia,serif',fontSize:20,color:'#0b2d4e',margin:'2px 0 0'}}>GREEN — Volumes &amp; Issues</h2></div></div>
          <span style={{fontSize:10.5,color:'#6f7f8b'}}>{filteredGreen.length} issue{filteredGreen.length===1?'':'s'}</span>
        </div>
        {!filteredGreen.length?<div className="contentCard" style={{textAlign:'center',padding:'24px',color:'#687586'}}>No GREEN issue matches the selected year and month.</div>:<div style={{overflowX:'auto',border:'1px solid #d6e0e7',borderRadius:5,background:'#fff',boxShadow:'0 2px 8px rgba(18,48,72,.035)'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:650,fontSize:12}}>
          <thead><tr style={{background:'#f4f7f9',color:'#34495e'}}><th style={{width:74,padding:'11px 10px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>S.No</th><th style={{padding:'11px 12px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'left'}}>Volume / Issue</th><th style={{width:180,padding:'11px 12px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'left'}}>Publication Period</th><th style={{width:90,padding:'11px 10px',borderRight:'1px solid #d6e0e7',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>Articles</th><th style={{width:110,padding:'11px 10px',borderBottom:'1px solid #d6e0e7',textAlign:'center'}}>Action</th></tr></thead>
          <tbody>{filteredGreen.map((group,index)=><tr key={group.key} style={{background:index%2?'#fbfcfd':'#fff'}}><td style={{padding:'12px 10px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',textAlign:'center',color:'#60717f'}}>{String(index+1).padStart(2,'0')}</td><td style={{padding:'12px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb'}}><div style={{fontWeight:800,color:'#173d60'}}>Volume {group.volume||'—'} / Issue {group.issue||'—'}</div><div style={{fontSize:9.5,color:'#7a8791',marginTop:2}}>GREEN academic issue</div></td><td style={{padding:'12px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',color:'#5e6e7d'}}>{group.month?`${group.month} ${group.year}`:group.year||'—'}</td><td style={{padding:'12px 10px',borderRight:'1px solid #e0e6eb',borderBottom:'1px solid #e0e6eb',textAlign:'center'}}><span style={{display:'inline-grid',placeItems:'center',minWidth:30,height:24,padding:'0 7px',borderRadius:999,background:'#edf8f1',color:'#14733d',fontWeight:800}}>{group.papers.length}</span></td><td style={{padding:'9px 10px',borderBottom:'1px solid #e0e6eb',textAlign:'center'}}><Link href={`/archives/green/${group.year}/${encodeURIComponent(group.month||'unknown')}/${group.volume}/${group.issue}`} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 12px',border:'1px solid #148444',borderRadius:4,color:'#14733d',fontWeight:800,background:'#fff'}}>View <span aria-hidden="true">→</span></Link></td></tr>)}</tbody>
        </table></div>}
      </section>:null}

      {(publicationType==='all'||publicationType==='red')?<section style={{marginTop:34}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,borderBottom:'2px solid #a61d22',paddingBottom:9,marginBottom:14}}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{width:38,height:38,borderRadius:6,display:'grid',placeItems:'center',background:'#fff1f1',border:'1px solid #efd2d3',color:'#a61d22'}}><RedIcon/></span><div><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:'#8a6264'}}>Print Publication Record</div><h2 style={{fontFamily:'Georgia,serif',fontSize:20,color:'#8e2026',margin:'2px 0 0'}}>RED — Publications</h2></div></div><span style={{fontSize:10.5,color:'#71808d'}}>{filteredRed.length} publication{filteredRed.length===1?'':'s'}</span></div>
        {!filteredRed.length?<div style={{padding:18,border:'1px solid #dbe3e9',fontSize:11,color:'#7a8792',borderRadius:5}}>No RED publication matches the selected year and month.</div>:redYears.map(year=>{const rb=filteredRed.filter(b=>b.publication_year===year);return <div key={year} style={{border:'1px solid #dbe3e9',borderRadius:5,background:'#fff',marginBottom:16,overflow:'hidden',boxShadow:'0 2px 8px rgba(18,48,72,.035)'}}><div style={{padding:'10px 13px',borderBottom:'1px solid #e3d6d7',background:'#fff7f7',display:'flex',alignItems:'center',gap:8,fontFamily:'Georgia,serif',fontWeight:700,color:'#9f2025'}}><CalendarIcon/>Year {year}</div>{rb.map(b=><div key={b.id} style={{padding:'13px',borderBottom:'1px solid #edf1f4',display:'grid',gridTemplateColumns:'56px 1fr auto',gap:12,alignItems:'center'}}>{b.cover_url?<img src={b.cover_url} alt="" style={{width:50,height:68,objectFit:'cover',border:'1px solid #d9d9d9',borderRadius:2,boxShadow:'0 2px 5px rgba(0,0,0,.08)'}}/>:<div style={{width:50,height:68,display:'grid',placeItems:'center',background:'#fff0f0',border:'1px solid #edd4d4',fontSize:9,color:'#9a4a4d',fontWeight:800}}>RED</div>}<div><div style={{fontSize:12.5,fontWeight:800,color:'#173d60'}}>{b.title}</div><div style={{fontSize:10.5,color:'#667787',marginTop:4}}>{[b.publication_month,b.publication_year].filter(Boolean).join(' ')}{b.volume?` · Vol. ${b.volume}`:''}{b.issue?` · Issue ${b.issue}`:''}</div></div><a href={b.view_url} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 10px',border:'1px solid #c73337',borderRadius:4,fontSize:10.5,fontWeight:800,color:'#a61d22',whiteSpace:'nowrap'}}>View Publication <span aria-hidden="true">→</span></a></div>)}</div>})}
      </section>:null}
    </div></main><Footer/></>;
}
