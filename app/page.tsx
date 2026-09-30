import Link from 'next/link';
import {Header,Footer,JournalTitle} from './components';
import {getPublishedGreenPapers,getPublishedRedBooks} from '@/lib/publications';
import {getSiteSettings} from '@/lib/site-settings';
import {getContactSettings} from '@/lib/contact-settings';

export const dynamic = 'force-dynamic';

function PaperIcon(){
  return <svg width="25" height="29" viewBox="0 0 25 29" fill="none" aria-hidden="true">
    <path d="M4.5 1.5h11l5 5v20H4.5z" fill="#fff" stroke="#148444" strokeWidth="1.5"/>
    <path d="M15.5 1.5v6h5" stroke="#148444" strokeWidth="1.5"/>
    <path d="M8 12h9M8 16h9M8 20h6" stroke="#148444" strokeWidth="1.35" strokeLinecap="round"/>
  </svg>
}

function issnDisplay(value:string){
  const raw=String(value||'').trim();
  return (!raw || /^pending$/i.test(raw) || /^x{4}-?x{4}$/i.test(raw)) ? 'Pending / Not Assigned' : raw;
}

export default async function Home(){
  const [greenPapers, redBooks, settings, contact] = await Promise.all([
    getPublishedGreenPapers(3),
    getPublishedRedBooks(2),
    getSiteSettings(),
    getContactSettings(),
  ]);
  const greenIssnStatus=issnDisplay(contact.green_issn);
  const redIssnStatus=issnDisplay(contact.red_eissn);

  return <><Header/><main>
    <section className="hero heroVisual" style={{backgroundImage:"linear-gradient(90deg,rgba(6,20,18,.86) 0%,rgba(7,22,18,.67) 38%,rgba(13,21,16,.18) 67%,rgba(12,14,10,.34) 100%),url('/hero-reference-art.jpg')",backgroundSize:'cover',backgroundPosition:'center 47%',backgroundRepeat:'no-repeat'}}><div className="container heroGrid" style={{minHeight:285,gridTemplateColumns:'minmax(0,.9fr) minmax(420px,1.1fr)',gap:24}}>
      <div className="heroCopy" style={{maxWidth:520,padding:'30px 0'}}><div className="heroKicker">{settings.homepage_kicker}</div><h1 style={{fontSize:43,textShadow:'0 2px 10px rgba(0,0,0,.55)',maxWidth:500}}>{settings.homepage_title}<br/><span>{settings.homepage_highlight}</span></h1><p style={{maxWidth:470,textShadow:'0 1px 5px rgba(0,0,0,.82)'}}>{settings.homepage_description}</p><div className="heroActions"><Link className="btn btnGold" href="/contact">Submit a Paper →</Link><Link className="btn btnGhost" href="#publications">Explore Our Publications</Link></div></div>
      <div className="heroArt" aria-hidden="true" style={{justifyContent:'flex-end',alignItems:'center',paddingRight:6}}>
        <div className="heroQuote" style={{maxWidth:220,marginRight:0,background:'linear-gradient(135deg,rgba(9,17,14,.58),rgba(9,17,14,.32))',backdropFilter:'blur(3px)',WebkitBackdropFilter:'blur(3px)',padding:'14px 16px',borderLeft:'3px solid #e2ad32',boxShadow:'0 8px 24px rgba(0,0,0,.18)',textShadow:'0 1px 5px #000'}}>Ideas<br/>Research<br/>People<br/><strong>A Better Tomorrow.</strong></div>
      </div>
    </div></section>

    {settings.homepage_notice?<section style={{background:'#fff8df',borderBottom:'1px solid #e5d8a8'}}><div className="container" style={{padding:'10px 0',fontSize:11.5,color:'#5d512a'}}><strong>Notice:</strong> {settings.homepage_notice}</div></section>:null}

    <section style={{background:'#f7f9fb',borderBottom:'1px solid #d9e1e8'}}><div className="container" style={{padding:'12px 0',display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap'}}><div style={{fontSize:11.5,lineHeight:1.65,color:'#526577'}}><strong style={{color:'#0b2d4e'}}>Publishing Body & Publisher:</strong> {settings.publisher_name}<br/><strong style={{color:'#0b2d4e'}}>Institute Address:</strong> {settings.official_address}<br/><strong style={{color:'#0b2d4e'}}>Journal / Editorial Office:</strong> {settings.journal_office_address}</div><Link href="/journal-information" style={{fontSize:11,fontWeight:800,color:'#0b5f91',whiteSpace:'nowrap'}}>Official Journal Information →</Link></div></section>

    <section className="publicationStrip" id="publications"><div className="container journalGrid">
      <div style={{display:'grid',gap:16,alignContent:'start'}}>
        <article className="journalCard green"><img className="journalLogo" src="/api/brand/green_logo" alt={settings.green_title}/><div className="journalCopy"><h2><JournalTitle kind="green" title={settings.green_title} size={20}/></h2><p>{settings.green_description}</p><div style={{margin:'12px 0 14px',border:'1px solid #cfe5d6',background:'#f7fcf8',padding:'10px 12px',borderRadius:4}}><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#148444',marginBottom:7}}>GREEN Journal Particulars</div><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'7px 14px',fontSize:10.5,lineHeight:1.45,color:'#40584a'}}>{[
          ['Frequency',settings.green_frequency],
          ['Language',settings.green_language],
          ['Starting Year',String(settings.first_volume_year)],
          ['Publication Format',settings.green_format],
          ['Subject',settings.green_subject],
          ['ISSN Status',greenIssnStatus],
        ].map(([label,value])=><div key={label}><strong style={{display:'block',fontSize:9,textTransform:'uppercase',letterSpacing:'.04em',color:'#64786a'}}>{label}</strong><span style={{fontWeight:700,color:label==='ISSN Status'&&greenIssnStatus==='Pending / Not Assigned'?'#9a6a12':'#183f2a'}}>{value}</span></div>)}</div></div><Link className="btn btnGreen" href="/green">View GREEN Research Papers →</Link><div className="featureRow"><span>⚖ Peer-reviewed</span><span>▣ Open access</span><span>◉ Multidisciplinary</span></div></div><div className="journalWatermark">▤</div></article>
        <div><div className="sectionTitle greenTitle"><h2>🍃 Latest Research Papers <span>(GREEN)</span></h2><Link href="/green">View GREEN Papers →</Link></div><div className="listPanel">{greenPapers.length ? greenPapers.map((p)=><div className="paperRow" key={p.id}><div className="paperThumb"><PaperIcon/></div><div className="itemMain"><div className="itemTitle">{p.title}</div><div className="meta">{p.authors}</div><div className="meta">{p.publication_year || ''}{p.volume ? ` · Vol. ${p.volume}` : ''}{p.issue ? ` · Issue ${p.issue}` : ''}</div></div><div className="actions"><Link className="smallBtn" href={`/green/view/${p.id}`}>View Details</Link>{p.download_url ? <a className="smallBtn filledGreen" href={p.download_url}>↓ Download PDF</a> : null}</div></div>) : <div style={{padding:'18px',color:'#687586'}}>Published GREEN research papers will appear here.</div>}</div></div>
      </div>

      <div style={{display:'grid',gap:16,alignContent:'start'}}>
        <article className="journalCard red"><img className="journalLogo redJournalLogo" src="/api/brand/red_logo" alt={settings.red_title}/><div className="journalCopy"><h2><JournalTitle kind="red" title={settings.red_title} size={20}/></h2><p>{settings.red_description}</p><div style={{margin:'12px 0 14px',border:'1px solid #efd2d3',background:'#fff8f8',padding:'10px 12px',borderRadius:4}}><div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#bd2025',marginBottom:7}}>RED Journal Particulars</div><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'7px 14px',fontSize:10.5,lineHeight:1.45,color:'#654345'}}>{[
          ['Frequency',settings.red_frequency],
          ['Language',settings.red_language],
          ['Starting Year',String(settings.red_starting_year)],
          ['Publication Format',settings.red_format],
          ['Subject',settings.red_subject],
          ['ISSN Status',redIssnStatus],
        ].map(([label,value])=><div key={label}><strong style={{display:'block',fontSize:9,textTransform:'uppercase',letterSpacing:'.04em',color:'#826467'}}>{label}</strong><span style={{fontWeight:700,color:label==='ISSN Status'&&redIssnStatus==='Pending / Not Assigned'?'#9a6a12':'#722226'}}>{value}</span></div>)}</div></div><Link className="btn btnRed" href="/red">View RED Publications →</Link><div className="featureRow"><span>▣ Print publication</span><span>▤ Scholarly publications</span><span>▰ Multidisciplinary</span></div></div><div className="journalWatermark">▥</div></article>
        <div><div className="sectionTitle redTitle"><h2>📕 Latest Publications <span>(RED)</span></h2><Link href="/red">View RED Publications →</Link></div><div className="listPanel">{redBooks.length ? redBooks.map((b)=><div className="bookRow" key={b.id}>{b.cover_url ? <img src={b.cover_url} alt={`${b.title} cover`} style={{width:72,height:96,objectFit:'cover',border:'1px solid #ddd',borderRadius:3,flex:'0 0 auto'}}/> : <div className="bookCover">RED<br/>Book<br/>Publication</div>}<div className="itemMain"><div className="itemTitle">{b.title}</div><div className="meta">{b.editors ? `Edited by ${b.editors}` : 'IRED Publication'}</div><div className="meta">{[b.publication_month,b.publication_year].filter(Boolean).join(' ') || b.publication_label || ''}{b.volume ? ` · Vol. ${b.volume}` : ''}{b.issue ? ` · Issue ${b.issue}` : ''}</div></div><div className="actions"><Link className="smallBtn" href={`/red/view/${b.id}`} style={{background:'#cb2528',borderColor:'#cb2528',color:'#fff'}}>View Publication</Link></div></div>) : <div style={{padding:'18px',color:'#687586'}}>Published RED books and publications will appear here.</div>}</div></div>
      </div>
    </div></section>

    <section className="audience"><div className="container audienceGrid">{[['👥','For Researchers','Share your research with the world'],['🎓','For Academicians','Access quality research and publications'],['♟','For Students','Learn and explore new knowledge'],['🏛','For Institutions','A trusted platform for academic growth'],['🌐','For a Better Tomorrow','Research · Education · Development']].map(([i,t,d])=><div className="audienceItem" key={t}><div className="audienceIcon">{i}</div><div><strong>{t}</strong><span>{d}</span></div></div>)}</div></section>

    <section className="section about compactSection"><div className="container aboutGrid"><div><h2>About {settings.institution_short_name}</h2><p>The {settings.institution_name} ({settings.institution_short_name}) is an academic and research-oriented organization located in Ahmedabad, Gujarat, India. {settings.institution_short_name} is committed to promoting research, education, academic development, and the exchange of knowledge.</p><Link className="btn btnGold compact" href="/about">Learn More About {settings.institution_short_name} →</Link></div><div className="quotePanel"><div className="quote">“Research is the key<br/>to a brighter,<br/>more informed<br/>tomorrow.”</div><div className="openBook">⌒⌒</div></div></div></section>
  </main><Footer/></>
}
