import Link from 'next/link';
import {Header,Footer} from './components';
import {getPublishedGreenPapers,getPublishedRedBooks} from '@/lib/publications';

export const dynamic = 'force-dynamic';

export default async function Home(){
  const [greenPapers, redBooks] = await Promise.all([
    getPublishedGreenPapers(3),
    getPublishedRedBooks(3),
  ]);

  return <><Header/><main>
    <section className="hero heroVisual"><div className="container heroGrid">
      <div className="heroCopy"><div className="heroKicker">Research · Education · Development</div><h1>Research Knowledge<br/><span>for a Better Tomorrow</span></h1><p>A platform for researchers, academicians, and students to share knowledge and create a positive impact.</p><div className="heroActions"><Link className="btn btnGold" href="/green">Submit a Paper →</Link><Link className="btn btnGhost" href="#publications">Explore Our Publications</Link></div></div>
      <div className="heroArt heroGraphic" aria-hidden="true"><div className="heroGlobe">◎</div><div className="heroBooks"><div className="bookSpine research">Research</div><div className="bookSpine education">Education</div><div className="bookSpine development">Development</div></div><div className="heroQuote">“Ideas<br/>Research<br/>People<br/>A Better Tomorrow.”</div></div>
    </div></section>

    <section className="publicationStrip" id="publications"><div className="container journalGrid">
      <article className="journalCard green"><img className="journalLogo" src="/green-logo.png?v=2" alt="GREEN: The Research Journal"/><div className="journalCopy"><h2>Research Papers</h2><p>Publish and access individual research papers, articles and scholarly contributions across a wide range of disciplines.</p><Link className="btn btnGreen" href="/green">View All Papers →</Link><div className="featureRow"><span>⚖ Peer-reviewed</span><span>▣ Open access</span><span>◉ Multidisciplinary</span></div></div><div className="journalWatermark">▤</div></article>
      <article className="journalCard red"><img className="journalLogo" src="/red-logo.png?v=3" alt="RED: The Research Journal"/><div className="journalCopy"><h2>Research Books</h2><p>Access complete research books, compiled volumes and published editions featuring selected research themes.</p><Link className="btn btnRed" href="/red">View All Books →</Link><div className="featureRow"><span>▣ Compiled volumes</span><span>▤ Scholarly publication</span><span>▰ Easy access</span></div></div><div className="journalWatermark">▥</div></article>
    </div></section>

    <section className="section compactSection"><div className="container latestGrid">
      <div><div className="sectionTitle greenTitle"><h2>🍃 Latest Research Papers <span>(GREEN)</span></h2><Link href="/green">View All Papers →</Link></div><div className="listPanel">{greenPapers.length ? greenPapers.map((p)=><div className="paperRow" key={p.id}><div className="paperThumb">📘</div><div className="itemMain"><div className="itemTitle">{p.title}</div><div className="meta">{p.authors}</div><div className="meta">{p.publication_year || ''}{p.volume ? ` · Vol. ${p.volume}` : ''}{p.issue ? ` · Issue ${p.issue}` : ''}</div></div><div className="actions">{p.view_url ? <a className="smallBtn" href={p.view_url} target="_blank" rel="noreferrer">View Article</a> : null}{p.download_url ? <a className="smallBtn filledGreen" href={p.download_url}>↓ Download PDF</a> : null}</div></div>) : <div style={{padding:'18px',color:'#687586'}}>Published GREEN papers will appear here.</div>}</div></div>
      <div><div className="sectionTitle redTitle"><h2>📕 Latest Research Books <span>(RED)</span></h2><Link href="/red">View All Books →</Link></div><div className="listPanel">{redBooks.length ? redBooks.map((b)=><div className="bookRow" key={b.id}><div className="bookCover">Research\nBook</div><div className="itemMain"><div className="itemTitle">{b.title}</div><div className="meta">{b.editors ? `Edited by ${b.editors}` : 'IRED Research Publication'}</div><div className="meta">{b.publication_year || ''}{b.volume ? ` · Vol. ${b.volume}` : ''}</div></div><div className="actions">{b.view_url ? <a className="smallBtn" href={b.view_url} target="_blank" rel="noreferrer">▧ View Book</a> : null}</div></div>) : <div style={{padding:'18px',color:'#687586'}}>Published RED research books will appear here.</div>}</div></div>
    </div></section>

    <section className="audience"><div className="container audienceGrid">{[['👥','For Researchers','Share your research with the world'],['🎓','For Academicians','Access quality research and publications'],['♟','For Students','Learn and explore new knowledge'],['🏛','For Institutions','A trusted platform for academic growth'],['🌐','For a Better Tomorrow','Research · Education · Development']].map(([i,t,d])=><div className="audienceItem" key={t}><div className="audienceIcon">{i}</div><div><strong>{t}</strong><span>{d}</span></div></div>)}</div></section>

    <section className="section about compactSection"><div className="container aboutGrid"><div><h2>About IRED</h2><p>The Institute of Research Education and Development (IRED) is an academic and research-oriented organization located in Ahmedabad, Gujarat, India. IRED is committed to promoting research, education, academic development, and the exchange of knowledge.</p><Link className="btn btnGold compact" href="/about">Learn More About IRED →</Link></div><div className="quotePanel"><div className="quote">“Research is the key<br/>to a brighter,<br/>more informed<br/>tomorrow.”</div><div className="openBook">⌒⌒</div></div></div></section>
  </main><Footer/></>
}
