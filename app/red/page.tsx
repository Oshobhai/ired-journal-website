import Link from 'next/link';
import {Header,Footer} from '../components';
import {getRedArchive} from '@/lib/publications';

export const dynamic = 'force-dynamic';

function pageHref(q:string,year:string,page:number){
  const params=new URLSearchParams();
  if(q)params.set('q',q);
  if(year)params.set('year',year);
  if(page>1)params.set('page',String(page));
  const qs=params.toString();
  return qs?`/red?${qs}`:'/red';
}

export default async function Red({searchParams}:{searchParams:Promise<{q?:string;year?:string;page?:string}>}){
  const params=await searchParams;
  const q=(params.q||'').trim();
  const yearText=(params.year||'').trim();
  const year=yearText?Number(yearText):null;
  const requestedPage=Math.max(Number(params.page)||1,1);
  const archive=await getRedArchive({q,year:Number.isFinite(year as number)?year:null,page:requestedPage,pageSize:10});
  const currentPage=Math.min(Math.max(archive.page,1),Math.max(archive.totalPages,1));

  return <><Header/><section className="pageHero"><div className="container"><div style={{fontSize:10,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#b32328',marginBottom:4}}>Official Journal</div><h1>RED: The Research Journal e-Journal</h1><p style={{fontSize:12.5,color:'#607080',margin:'7px 0 0'}}>Electronic · Scholarly · Multidisciplinary Research Publication</p></div></section><main className="container" style={{padding:'22px 0 34px'}}>
    <section className="contentCard" style={{borderTop:'4px solid #cb2528'}}><div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(220px,320px)',gap:20,alignItems:'start'}}><div><h2 style={{marginTop:0}}>Journal Information</h2><p>RED: The Research Journal e-Journal is an electronic research journal published by the Institute of Research Education and Development (IRED) with the objective of promoting online dissemination of scholarly and research-based knowledge.</p><p>The journal welcomes multidisciplinary academic contributions across Arts, Humanities, Sciences, Social Sciences, Commerce, Education, Management, Law and other related disciplines.</p><div style={{fontSize:11.5,lineHeight:1.7,color:'#526577'}}><strong>Publishing Body & Publisher:</strong> Institute of Research Education and Development (IRED)<br/><strong>Official Address:</strong> A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.<br/><strong>Email:</strong> ired.foundation@gmail.com</div><div style={{marginTop:14,display:'flex',gap:8,flexWrap:'wrap'}}><Link className="btn btnOutline compact" href="/journal-information">Full Journal Information</Link><Link className="btn btnOutline compact" href="/editorial-board">Editorial Board</Link></div></div><img src="/red-logo-family.svg?v=1" alt="RED: The Research Journal" style={{width:'100%',maxHeight:150,objectFit:'contain'}}/></div></section>

    <section className="contentCard"><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:16,flexWrap:'wrap',marginBottom:14}}><div><div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#b32328',marginBottom:4}}>RED Journal Archive</div><h2 style={{margin:'0 0 5px'}}>Published RED e-Journal Publications</h2><p style={{margin:0,color:'#617181',fontSize:12.5}}>Search by title, subtitle, editor, theme, ISSN, ISBN or description. Use year filtering as the archive grows.</p></div><div style={{fontSize:10.5,color:'#6d7b87'}}>{archive.total} published item{archive.total===1?'':'s'}</div></div>

      <form action="/red" method="get" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 150px auto auto',gap:8,alignItems:'end',padding:'12px',border:'1px solid #ead7d8',background:'#fff9f9',borderRadius:5,marginBottom:12}}>
        <label style={{fontSize:10,fontWeight:800,color:'#5f4244'}}>Search publications<input name="q" defaultValue={q} placeholder="Title, editor, theme, ISSN, ISBN..." style={{display:'block',width:'100%',marginTop:4,padding:'9px 10px',border:'1px solid #d8c7c8',borderRadius:3,fontSize:11}}/></label>
        <label style={{fontSize:10,fontWeight:800,color:'#5f4244'}}>Year<input name="year" defaultValue={yearText} inputMode="numeric" placeholder="2026" style={{display:'block',width:'100%',marginTop:4,padding:'9px 10px',border:'1px solid #d8c7c8',borderRadius:3,fontSize:11}}/></label>
        <button className="btn btnRed compact" type="submit">Search</button>
        {(q||yearText)?<Link className="btn btnOutline compact" href="/red">Clear</Link>:<span/>}
      </form>

      {(q||yearText)?<div style={{fontSize:10.5,color:'#6c5b5c',margin:'0 0 9px'}}>Showing {archive.total} result{archive.total===1?'':'s'}{q?<> for <strong>“{q}”</strong></>:null}{yearText?<> · Year <strong>{yearText}</strong></>:null}</div>:null}

      <div className="listPanel">{archive.publications.length ? archive.publications.map((b)=>{
        const dateLabel=[b.publication_month,b.publication_year].filter(Boolean).join(' ')||b.publication_label||'';
        return <article className="bookRow" key={b.id} style={{alignItems:'flex-start'}}>
          {b.cover_url?<img src={b.cover_url} alt={`${b.title} cover`} style={{width:92,height:124,objectFit:'cover',border:'1px solid #e0d5d5',borderRadius:4,flex:'0 0 auto'}}/>:<div className="bookCover">RED<br/>Research<br/>Journal</div>}
          <div className="itemMain" style={{minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}><span style={{fontSize:9.5,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'#b32328'}}>RED Publication</span><span style={{fontSize:9,color:'#7a8791'}}>{dateLabel}</span></div>
            <div className="itemTitle" style={{fontSize:14,lineHeight:1.35,overflowWrap:'anywhere'}}>{b.title}</div>
            {b.subtitle?<div className="meta" style={{fontSize:10.5,marginTop:4}}>{b.subtitle}</div>:null}
            <div className="meta" style={{fontSize:10.5,marginTop:5}}><strong style={{color:'#5d4547'}}>Editor(s):</strong> {b.editors||'Institute of Research Education and Development'}</div>
            <div className="meta" style={{fontSize:10,marginTop:3}}>{b.volume?`Volume ${b.volume}`:''}{b.issue?`${b.volume?' · ':''}Issue ${b.issue}`:''}{b.issn?`${b.volume||b.issue?' · ':''}ISSN: ${b.issn}`:''}{b.isbn?`${b.volume||b.issue||b.issn?' · ':''}ISBN: ${b.isbn}`:''}</div>
            {b.description?<p style={{fontSize:11.5,lineHeight:1.5,margin:'7px 0 0',color:'#5e6d79'}}>{b.description}</p>:null}
          </div>
          <div className="actions" style={{justifyContent:'flex-end',flexWrap:'wrap'}}><Link className="smallBtn" href={b.view_url} style={{background:'#cb2528',borderColor:'#cb2528',color:'#fff'}}>View Publication</Link></div>
        </article>
      }) : <div style={{padding:'24px',textAlign:'center',color:'#687586'}}>No published RED publications match your search.</div>}</div>

      {archive.totalPages>1?<nav aria-label="RED archive pages" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginTop:12}}><div style={{fontSize:10.5,color:'#6a7884'}}>Page {currentPage} of {archive.totalPages}</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{currentPage>1?<Link className="smallBtn" href={pageHref(q,yearText,currentPage-1)}>← Previous</Link>:null}{Array.from({length:Math.min(5,archive.totalPages)},(_,i)=>{const start=Math.max(1,Math.min(currentPage-2,archive.totalPages-4));const p=start+i;return p<=archive.totalPages?<Link key={p} className="smallBtn" href={pageHref(q,yearText,p)} style={p===currentPage?{background:'#cb2528',borderColor:'#cb2528',color:'#fff'}:undefined}>{p}</Link>:null})}{currentPage<archive.totalPages?<Link className="smallBtn" href={pageHref(q,yearText,currentPage+1)}>Next →</Link>:null}</div></nav>:null}
    </section>
  </main><Footer/></>}
