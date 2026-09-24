import Link from 'next/link';
import {Header,Footer} from '../components';
import {searchPublications} from '@/lib/publications';

export const dynamic='force-dynamic';

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const {q=''}=await searchParams;
  const term=q.trim();
  const results=term?await searchPublications(term):[];
  return <><Header/>
    <section className="pageHero"><div className="container"><h1>Search Publications</h1><p style={{fontSize:12.5,color:'#607080',margin:'7px 0 0'}}>Search GREEN papers and RED research books by title, author/editor, keywords, year, volume or issue.</p></div></section>
    <main className="container" style={{padding:'22px 0 34px'}}>
      <form className="searchPageForm" action="/search" method="get" style={{display:'flex',gap:8,maxWidth:760,marginBottom:18}}>
        <input name="q" defaultValue={term} autoFocus placeholder="Search title, author, editor, keywords, year..." style={{flex:1,padding:'11px 12px',border:'1px solid #cbd5df',borderRadius:5,fontSize:13}}/>
        <button className="btn btnNavy" type="submit">Search</button>
      </form>
      {!term?<div className="contentCard"><p style={{margin:0,color:'#687586'}}>Enter a search term above.</p></div>:<div className="contentCard">
        <div className="searchResultsHeader" style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:12}}><h2 style={{margin:0}}>Results for “{term}”</h2><span style={{fontSize:11,color:'#71808d'}}>{results.length} result(s)</span></div>
        {results.length?results.map(r=><div className="searchResultRow" key={`${r.kind}-${r.id}`} style={{display:'grid',gridTemplateColumns:'84px 1fr auto',gap:14,alignItems:'center',padding:'13px 0',borderTop:'1px solid #e3e8ec'}}>
          <div>{r.kind==='red'&&r.cover_url?<img src={r.cover_url} alt="" style={{width:58,height:78,objectFit:'cover',border:'1px solid #ddd'}}/>:<div style={{width:58,height:58,borderRadius:6,display:'grid',placeItems:'center',background:r.kind==='green'?'#eaf6ef':'#faeeee',color:r.kind==='green'?'#14733d':'#b32328',fontWeight:800,fontFamily:'Georgia,serif'}}>{r.kind==='green'?'GREEN':'RED'}</div>}</div>
          <div><div style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:r.kind==='green'?'#14733d':'#b32328'}}>{r.kind==='green'?'GREEN Research Paper':'RED Research Book'}</div><h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#12395c',margin:'3px 0 4px'}}>{r.title}</h3>{r.subtitle?<div style={{fontSize:11.5,color:'#647381'}}>{r.subtitle}</div>:null}<div className="meta">{r.people||''}{r.publication_month?` · ${r.publication_month}`:''}{r.publication_year?` ${r.publication_year}`:''}{r.volume?` · Vol. ${r.volume}`:''}{r.issue?` · Issue ${r.issue}`:''}{r.article_id?` · ${r.article_id}`:''}</div></div>
          <Link className="smallBtn" href={r.kind==='green'?`/green/view/${r.id}`:`/red/view/${r.id}`}>View Details →</Link>
        </div>):<div style={{padding:'20px 0',color:'#687586'}}>No published GREEN papers or RED books matched this search.</div>}
      </div>}
    </main><Footer/></>;
}
