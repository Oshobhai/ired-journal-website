import {Header,Footer} from '../components';
import {getPublishedRedBooks} from '@/lib/publications';

export const dynamic = 'force-dynamic';

export default async function Red(){
  const books = await getPublishedRedBooks();
  return <><Header/><section className="pageHero"><div className="container"><h1>RED: The Research Journal — Research Books</h1></div></section><main className="container"><div className="contentCard"><p>Complete research books and compiled scholarly volumes are managed and published here.</p><div className="listPanel">{books.length ? books.map((b)=><div className="bookRow" key={b.id}><div><div className="itemTitle">{b.title}</div>{b.subtitle ? <div className="meta">{b.subtitle}</div> : null}<div className="meta">{b.editors ? `Edited by ${b.editors}` : 'IRED Research Publication'}{b.publication_year ? ` · ${b.publication_year}` : ''}{b.volume ? ` · Vol. ${b.volume}` : ''}</div>{b.isbn ? <div className="meta">ISBN: {b.isbn}</div> : null}</div><div className="actions">{b.view_url ? <a className="smallBtn" href={b.view_url} target="_blank" rel="noreferrer">View Book</a> : null}{b.download_url ? <a className="smallBtn" href={b.download_url}>Download PDF</a> : null}</div></div>) : <div style={{padding:'18px 0',color:'#687586'}}>No published RED research books yet.</div>}</div></div></main><Footer/></>}
