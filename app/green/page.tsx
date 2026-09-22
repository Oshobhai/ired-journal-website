import {Header,Footer} from '../components';
import {getPublishedGreenPapers} from '@/lib/publications';

export const dynamic = 'force-dynamic';

export default async function Green(){
  const papers = await getPublishedGreenPapers();
  return <><Header/><section className="pageHero"><div className="container"><h1>GREEN: The Research Journal — Research Papers</h1></div></section><main className="container"><div className="contentCard"><p>Individual research papers and scholarly articles appear here after editorial approval and publication.</p><div className="listPanel">{papers.length ? papers.map((p)=><div className="paperRow" key={p.id}><div><div className="itemTitle">{p.title}</div><div className="meta">{p.authors}{p.publication_year ? ` · ${p.publication_year}` : ''}{p.volume ? ` · Vol. ${p.volume}` : ''}{p.issue ? ` · Issue ${p.issue}` : ''}</div>{p.doi ? <div className="meta">DOI: {p.doi}</div> : null}</div><div className="actions">{p.view_url ? <a className="smallBtn" href={p.view_url} target="_blank" rel="noreferrer">View</a> : null}{p.download_url ? <a className="smallBtn filledGreen" href={p.download_url}>Download PDF</a> : null}</div></div>) : <div style={{padding:'18px 0',color:'#687586'}}>No published GREEN papers yet.</div>}</div></div></main><Footer/></>}
