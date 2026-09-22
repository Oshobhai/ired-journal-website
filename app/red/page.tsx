import {Header,Footer} from '../components';
import {getPublishedRedBooks} from '@/lib/publications';

export const dynamic = 'force-dynamic';

export default async function Red(){
  const books = await getPublishedRedBooks();
  return <><Header/><section className="pageHero"><div className="container"><h1>RED: The Research Journal — Research Books</h1></div></section><main className="container"><div className="contentCard"><p>Complete research books and compiled scholarly volumes are managed and published here.</p><div className="listPanel">{books.length ? books.map((b)=>{
    const dateLabel = [b.publication_month,b.publication_year].filter(Boolean).join(' ') || b.publication_label || '';
    return <div className="bookRow" key={b.id} style={{alignItems:'flex-start'}}>{b.cover_url ? <img src={b.cover_url} alt={`${b.title} cover`} style={{width:92,height:124,objectFit:'cover',border:'1px solid #e0e0e0',borderRadius:4,flex:'0 0 auto'}}/> : <div className="bookCover">RED<br/>Research<br/>Journal</div>}<div className="itemMain"><div className="itemTitle">{b.title}</div>{b.subtitle ? <div className="meta">{b.subtitle}</div> : null}<div className="meta">{b.editors ? `Edited by ${b.editors}` : 'IRED Research Publication'}</div><div className="meta">{dateLabel}{b.volume ? ` · Volume ${b.volume}` : ''}{b.issue ? ` · Issue ${b.issue}` : ''}</div>{b.issn ? <div className="meta">ISSN: {b.issn}</div> : null}{b.description ? <p style={{fontSize:12,lineHeight:1.55,margin:'7px 0 0',color:'#526577'}}>{b.description}</p> : null}</div><div className="actions"><a className="smallBtn" href={b.view_url}>View Book</a></div></div>
  }) : <div style={{padding:'18px 0',color:'#687586'}}>No published RED research books yet.</div>}</div></div></main><Footer/></>}
