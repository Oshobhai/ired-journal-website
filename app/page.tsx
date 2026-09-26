import Link from 'next/link';
import {Header,Footer} from './components';
import {getPublishedGreenPapers,getPublishedRedBooks} from '@/lib/publications';
import {getSiteSettings} from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function Home(){
  const [greenPapers, redBooks, settings] = await Promise.all([
    getPublishedGreenPapers(3),
    getPublishedRedBooks(3),
    getSiteSettings(),
  ]);

  return <><Header/><main>
    <section className="hero heroVisual"><div className="container heroGrid">
      <div className="heroCopy"><div className="heroKicker">{settings.homepage_kicker}</div><h1>{settings.homepage_title}<br/><span>{settings.homepage_highlight}</span></h1><p>{settings.homepage_description}</p><div className="heroActions"><Link className="btn btnGold" href="/contact">Contact to Submit →</Link><Link className="btn btnGhost" href="#publications">Explore Our Journals</Link></div></div>
      <div className="heroArt heroGraphic" aria-hidden="true"><div className="heroGlobe">◎</div><div className="heroBooks"><div className="bookSpine research">Research</div><div className="bookSpine education">Education</div><div className="bookSpine development">Development</div></div><div className="heroQuote">“Ideas<br/>Research<br/>People<br/>A Better Tomorrow.”</div></div>
    </div></section>

    {settings.homepage_notice?<section style={{background:'#fff8df',borderBottom:'1px solid #e5d8a8'}}><div className="container" style={{padding:'10px 0',fontSize:11.5,color:'#5d512a'}}><strong>Notice:</strong> {settings.homepage_notice}</div></section>:null}

    <section style={{background:'#f7f9fb',borderBottom:'1px solid #d9e1e8'}}><div className="container" style={{padding:'12px 0',display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap'}}><div style={{fontSize:11.5,lineHeight:1.6,color:'#526577'}}><strong style={{color:'#0b2d4e'}}>Publishing Body & Publisher:</strong> {settings.publisher_name} · {settings.official_address}</div><Link href="/journal-information" style={{fontSize:11,fontWeight:800,color:'#0b5f91',whiteSpace:'nowrap'}}>Official Journal Information →</Link></div></section>

    <section className="publicationStrip" id="publications"><div className="container journalGrid">
      <article className="journalCard green"><img className="journalLogo" src="/api/brand/green_logo" alt={settings.green_title}/><div className="journalCopy"><h2>{settings.green_title}</h2><p>{settings.green_description}</p><Link className="btn btnGreen" href="/green">View GREEN Journal →</Link><div className="featureRow"><span>⚖ Peer-reviewed</span><span>▣ Open access</span><span>◉ Multidisciplinary</span></div></div><div className="journalWatermark">▤</div></article>
      <article className="journalCard red"><img className="journalLogo redJournalLogo" src="/api/brand/red_logo" alt={settings.red_title}/><div className="journalCopy"><h2>{settings.red_title}</h2><p>{settings.red_description}</p><Link className="btn btnRed" href="/red">View RED e-Journal →</Link><div className="featureRow"><span>▣ Electronic journal</span><span>▤ Scholarly publication</span><span>▰ Multidisciplinary</span></div></div><div className="journalWatermark">▥</div></article>
    </div></section>

    <section className="section compactSection"><div className="container latestGrid">
      <div><div className="sectionTitle greenTitle"><h2>🍃 Latest Research Papers <span>(GREEN)</span></h2><Link href="/green">View GREEN Journal →</Link></div><div className="listPanel">{greenPapers.length ? greenPapers.map((p)=><div className="paperRow" key={p.id}><div className="paperThumb">📘</div><div className="itemMain"><div className="itemTitle">{p.title}</div><div className="meta">{p.authors}</div><div className="meta">{p.publication_year || ''}{p.volume ? ` · Vol. ${p.volume}` : ''}{p.issue ? ` · Issue ${p.issue}` : ''}</div></div><div className="actions"><Link className="smallBtn" href={`/green/view/${p.id}`}>View Details</Link>{p.download_url ? <a className="smallBtn filledGreen" href={p.download_url}>↓ Download PDF</a> : null}</div></div>) : <div style={{padding:'18px',color:'#687586'}}>Published GREEN papers will appear here.</div>}</div></div>
      <div><div className="sectionTitle redTitle"><h2>📕 Latest Publications <span>(RED)</span></h2><Link href="/red">View RED e-Journal →</Link></div><div className="listPanel">{redBooks.length ? redBooks.map((b)=><div className="bookRow" key={b.id}>{b.cover_url ? <img src={b.cover_url} alt={`${b.title} cover`} style={{width:72,height:96,objectFit:'cover',border:'1px solid #ddd',borderRadius:3,flex:'0 0 auto'}}/> : <div className="bookCover">RED<br/>Research<br/>Journal</div>}<div className="itemMain"><div className="itemTitle">{b.title}</div><div className="meta">{b.editors ? `Edited by ${b.editors}` : 'IRED Research Publication'}</div><div className="meta">{[b.publication_month,b.publication_year].filter(Boolean).join(' ') || b.publication_label || ''}{b.volume ? ` · Vol. ${b.volume}` : ''}{b.issue ? ` · Issue ${b.issue}` : ''}</div></div><div className="actions"><Link className="smallBtn" href={`/red/view/${b.id}`} style={{background:'#cb2528',borderColor:'#cb2528',color:'#fff'}}>View Publication</Link></div></div>) : <div style={{padding:'18px',color:'#687586'}}>Published RED e-Journal content will appear here.</div>}</div></div>
    </div></section>

    <section className="audience"><div className="container audienceGrid">{[['👥','For Researchers','Share your research with the world'],['🎓','For Academicians','Access quality research and publications'],['♟','For Students','Learn and explore new knowledge'],['🏛','For Institutions','A trusted platform for academic growth'],['🌐','For a Better Tomorrow','Research · Education · Development']].map(([i,t,d])=><div className="audienceItem" key={t}><div className="audienceIcon">{i}</div><div><strong>{t}</strong><span>{d}</span></div></div>)}</div></section>

    <section className="section about compactSection"><div className="container aboutGrid"><div><h2>About {settings.institution_short_name}</h2><p>The {settings.institution_name} ({settings.institution_short_name}) is an academic and research-oriented organization located in Ahmedabad, Gujarat, India. {settings.institution_short_name} is committed to promoting research, education, academic development, and the exchange of knowledge.</p><Link className="btn btnGold compact" href="/about">Learn More About {settings.institution_short_name} →</Link></div><div className="quotePanel"><div className="quote">“Research is the key<br/>to a brighter,<br/>more informed<br/>tomorrow.”</div><div className="openBook">⌒⌒</div></div></div></section>
  </main><Footer/></>
}
