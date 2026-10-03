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

function PanelHeading({title,color,calendar=false}:{title:string;color:string;calendar?:boolean}){
  return <div style={{display:'flex',alignItems:'center',gap:8,fontSize:10,fontWeight:800,letterSpacing:'.075em',textTransform:'uppercase',color,marginBottom:12}}>
    <span style={{width:24,height:24,borderRadius:5,display:'grid',placeItems:'center',background:`${color}0d`,border:`1px solid ${color}22`}}>
      {calendar?<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3M8 17h3"/></svg>:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>}
    </span>
    <span>{title}</span>
  </div>;
}

function InfoItem({label,value,valueColor='#203344'}:{label:string;value:string;valueColor?:string}){
  return <div style={{padding:'1px 0 5px'}}>
    <div style={{fontSize:8.5,textTransform:'uppercase',letterSpacing:'.065em',color:'#73808c',marginBottom:2,fontWeight:700}}>{label}</div>
    <div style={{fontSize:10.5,lineHeight:1.35,fontWeight:700,color:valueColor}}>{value}</div>
  </div>;
}

function ScheduleItem({label,value,accent}:{label:string;value:string;accent:string}){
  return <div style={{background:'#fff',border:'1px solid #e2e8ec',borderRadius:5,padding:'8px 9px',minHeight:49}}>
    <div style={{fontSize:8.2,textTransform:'uppercase',letterSpacing:'.06em',color:'#7a8792',fontWeight:700,marginBottom:3}}>{label}</div>
    <div style={{fontSize:10.5,lineHeight:1.35,fontWeight:800,color:accent}}>{value}</div>
  </div>;
}

function issnDisplay(value:string){
  const raw=String(value||'').trim();
  return (!raw || /^x{4}-?x{4}$/i.test(raw)) ? 'Pending' : raw;
}

function formatMonthYear(value:string){
  const match=/^(\d{4})-(\d{2})$/.exec(String(value||'').trim());
  if(!match)return value||'—';
  const year=Number(match[1]);const month=Number(match[2]);
  if(month<1||month>12)return value;
  return new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,1)));
}

function formatDate(value:string){
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||'').trim());
  if(!match)return value||'—';
  const year=Number(match[1]);const month=Number(match[2]);const day=Number(match[3]);
  return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,day)));
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
  const greenScheduleVisible=[settings.green_upcoming_volume,settings.green_upcoming_issue,settings.green_upcoming_month,settings.green_upcoming_publication_date,settings.green_upcoming_submission_deadline].some(v=>String(v||'').trim());
  const redScheduleVisible=[settings.red_upcoming_volume,settings.red_upcoming_issue,settings.red_upcoming_month,settings.red_upcoming_publication_date,settings.red_upcoming_submission_deadline].some(v=>String(v||'').trim());

  return <><Header/><main>
    <section className="hero heroVisual" style={{backgroundImage:"linear-gradient(90deg,rgba(6,20,18,.86) 0%,rgba(7,22,18,.67) 38%,rgba(13,21,16,.18) 67%,rgba(12,14,10,.34) 100%),url('/hero-reference-art.jpg')",backgroundSize:'cover',backgroundPosition:'center 47%',backgroundRepeat:'no-repeat'}}><div className="container heroGrid" style={{minHeight:285,gridTemplateColumns:'minmax(0,.9fr) minmax(420px,1.1fr)',gap:24}}>
      <div className="heroCopy" style={{maxWidth:520,padding:'30px 0'}}><div className="heroKicker">{settings.homepage_kicker}</div><h1 style={{fontSize:43,textShadow:'0 2px 10px rgba(0,0,0,.55)',maxWidth:500}}>{settings.homepage_title}<br/><span>{settings.homepage_highlight}</span></h1><p style={{maxWidth:470,textShadow:'0 1px 5px rgba(0,0,0,.82)'}}>{settings.homepage_description}</p><div className="heroActions"><Link className="btn btnGold" href="/contact">Submit a Paper →</Link><Link className="btn btnGhost" href="#publications">Explore Our Publications</Link></div></div>
      <div className="heroArt" aria-hidden="true" style={{justifyContent:'flex-end',alignItems:'center',paddingRight:6}}>
        <div className="heroQuote" style={{maxWidth:220,marginRight:0,background:'linear-gradient(135deg,rgba(9,17,14,.58),rgba(9,17,14,.32))',backdropFilter:'blur(3px)',WebkitBackdropFilter:'blur(3px)',padding:'14px 16px',borderLeft:'3px solid #e2ad32',boxShadow:'0 8px 24px rgba(0,0,0,.18)',textShadow:'0 1px 5px #000'}}>Ideas<br/>Research<br/>People<br/><strong>A Better Tomorrow.</strong></div>
      </div>
    </div></section>

    {settings.homepage_notice?<section style={{background:'#fff8df',borderBottom:'1px solid #e5d8a8'}}><div className="container" style={{padding:'10px 0',fontSize:11.5,color:'#5d512a'}}><strong>Notice:</strong> {settings.homepage_notice}</div></section>:null}

    <section style={{background:'linear-gradient(180deg,#f9fbfc 0%,#f4f7f9 100%)',borderTop:'1px solid #e3e9ed',borderBottom:'1px solid #d6e0e7',boxShadow:'0 1px 0 rgba(13,45,69,.03)'}}><div className="container" style={{padding:'14px 0',display:'flex',justifyContent:'space-between',alignItems:'center',gap:18,flexWrap:'wrap'}}><div style={{display:'flex',alignItems:'flex-start',gap:12,flex:'1 1 760px',minWidth:0}}><span aria-hidden="true" style={{width:38,height:38,borderRadius:6,display:'grid',placeItems:'center',background:'#fff',border:'1px solid #d5e0e7',color:'#173d60',boxShadow:'0 2px 7px rgba(20,52,75,.05)',flex:'0 0 auto'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M2 20h20"/><path d="M12 3 3 8h18l-9-5Z"/></svg></span><div style={{minWidth:0,flex:1}}><div style={{fontSize:9,letterSpacing:'.11em',textTransform:'uppercase',fontWeight:800,color:'#6c7a86',marginBottom:7}}>Publisher &amp; Editorial Offices</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:'7px 22px'}}><div><div style={{fontSize:8.5,letterSpacing:'.055em',textTransform:'uppercase',fontWeight:800,color:'#173d60',marginBottom:2}}>Publishing Body &amp; Publisher</div><div style={{fontSize:10.5,lineHeight:1.45,color:'#526577'}}>{settings.publisher_name}</div></div><div><div style={{fontSize:8.5,letterSpacing:'.055em',textTransform:'uppercase',fontWeight:800,color:'#173d60',marginBottom:2}}>Institute Address</div><div style={{fontSize:10.5,lineHeight:1.45,color:'#526577'}}>{settings.official_address}</div></div><div><div style={{fontSize:8.5,letterSpacing:'.055em',textTransform:'uppercase',fontWeight:800,color:'#173d60',marginBottom:2}}>Journal / Editorial Office</div><div style={{fontSize:10.5,lineHeight:1.45,color:'#526577'}}>{settings.journal_office_address}</div></div></div></div></div><Link className="btn btnOutline compact" href="/journal-information" style={{fontSize:10.5,fontWeight:800,whiteSpace:'nowrap',borderColor:'#b9cbd7',color:'#123f61',background:'#fff',boxShadow:'0 2px 7px rgba(20,52,75,.04)'}}>Official Journal Information →</Link></div></section>

    <section className="publicationStrip" id="publications"><div className="container journalGrid">
      <div style={{display:'grid',gap:16,alignContent:'start'}}>
        <article className="journalCard green"><img className="journalLogo" src="/api/brand/green_logo" alt={settings.green_title}/><div className="journalCopy"><h2><JournalTitle kind="green" title={settings.green_title} size={20}/></h2><p>{settings.green_description}</p><Link className="btn btnGreen" href="/green">View GREEN Research Papers →</Link><div className="featureRow"><span>⚖ Peer-reviewed</span><span>▣ Open access</span><span>◉ Multidisciplinary</span></div></div><div className="journalWatermark">▤</div></article>

        <section style={{border:'1px solid #d7e5dc',borderLeft:'3px solid #148444',background:'#fbfdfb',padding:'13px 14px',borderRadius:6}}>
          <PanelHeading title="GREEN Journal Particulars" color="#148444"/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:'7px 16px'}}>{[
            ['Frequency',settings.green_frequency],
            ['Language',settings.green_language],
            ['Starting Year',String(settings.first_volume_year)],
            ['Publication Format',settings.green_format],
            ['Subject',settings.green_subject],
            ['ISSN Status',greenIssnStatus],
          ].map(([label,value])=><InfoItem key={label} label={label} value={value} valueColor={label==='ISSN Status'&&greenIssnStatus==='Pending'?'#9a6a12':'#183f2a'}/>)}</div>
          {greenScheduleVisible?<div style={{borderTop:'1px solid #dbe7df',marginTop:8,paddingTop:11}}>
            <PanelHeading title="Upcoming Issue Schedule" color="#148444" calendar/>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>
              <ScheduleItem label="Volume / Issue" value={[settings.green_upcoming_volume?`Volume ${settings.green_upcoming_volume}`:'',settings.green_upcoming_issue?`Issue ${settings.green_upcoming_issue}`:''].filter(Boolean).join(' · ')||'—'} accent="#183f2a"/>
              <ScheduleItem label="Issue Month" value={formatMonthYear(settings.green_upcoming_month)} accent="#183f2a"/>
              <ScheduleItem label="Publication Date" value={formatDate(settings.green_upcoming_publication_date)} accent="#148444"/>
              <ScheduleItem label="Paper Submission Last Date" value={formatDate(settings.green_upcoming_submission_deadline)} accent="#8a6412"/>
            </div>
          </div>:null}
        </section>

        <div><div className="sectionTitle greenTitle"><h2>🍃 Latest Research Papers <span>(GREEN)</span></h2><Link href="/green">View GREEN Papers →</Link></div><div className="listPanel">{greenPapers.length ? greenPapers.map((p)=><div className="paperRow" key={p.id}><div className="paperThumb"><PaperIcon/></div><div className="itemMain"><div className="itemTitle">{p.title}</div><div className="meta">{p.authors}</div><div className="meta">{p.publication_year || ''}{p.volume ? ` · Vol. ${p.volume}` : ''}{p.issue ? ` · Issue ${p.issue}` : ''}</div></div><div className="actions"><Link className="smallBtn" href={`/green/view/${p.id}`}>View Details</Link>{p.download_url ? <a className="smallBtn filledGreen" href={p.download_url}>↓ Download PDF</a> : null}</div></div>) : <div style={{padding:'18px',color:'#687586'}}>Published GREEN research papers will appear here.</div>}</div></div>
      </div>

      <div style={{display:'grid',gap:16,alignContent:'start'}}>
        <article className="journalCard red"><img className="journalLogo redJournalLogo" src="/api/brand/red_logo" alt={settings.red_title}/><div className="journalCopy"><h2><JournalTitle kind="red" title={settings.red_title} size={20}/></h2><p>{settings.red_description}</p><Link className="btn btnRed" href="/red">View RED Publications →</Link><div className="featureRow"><span>▣ Print publication</span><span>▤ Scholarly publications</span><span>▰ Multidisciplinary</span></div></div><div className="journalWatermark">▥</div></article>

        <section style={{border:'1px solid #eed9da',borderLeft:'3px solid #bd2025',background:'#fffdfd',padding:'13px 14px',borderRadius:6}}>
          <PanelHeading title="RED Journal Particulars" color="#bd2025"/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:'7px 16px'}}>{[
            ['Frequency',settings.red_frequency],
            ['Language',settings.red_language],
            ['Starting Year',String(settings.red_starting_year)],
            ['Publication Format',settings.red_format],
            ['Subject',settings.red_subject],
            ['ISSN Status',redIssnStatus],
          ].map(([label,value])=><InfoItem key={label} label={label} value={value} valueColor={label==='ISSN Status'&&redIssnStatus==='Pending'?'#9a6a12':'#722226'}/>)}</div>
          {redScheduleVisible?<div style={{borderTop:'1px solid #efdede',marginTop:8,paddingTop:11}}>
            <PanelHeading title="Upcoming Issue Schedule" color="#bd2025" calendar/>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>
              <ScheduleItem label="Volume / Issue" value={[settings.red_upcoming_volume?`Volume ${settings.red_upcoming_volume}`:'',settings.red_upcoming_issue?`Issue ${settings.red_upcoming_issue}`:''].filter(Boolean).join(' · ')||'—'} accent="#722226"/>
              <ScheduleItem label="Issue Month" value={formatMonthYear(settings.red_upcoming_month)} accent="#722226"/>
              <ScheduleItem label="Publication Date" value={formatDate(settings.red_upcoming_publication_date)} accent="#bd2025"/>
              <ScheduleItem label="Paper Submission Last Date" value={formatDate(settings.red_upcoming_submission_deadline)} accent="#8a6412"/>
            </div>
          </div>:null}
        </section>

        <div><div className="sectionTitle redTitle"><h2>📕 Latest Publications <span>(RED)</span></h2><Link href="/red">View RED Publications →</Link></div><div className="listPanel">{redBooks.length ? redBooks.map((b)=><div className="bookRow" key={b.id}>{b.cover_url ? <img src={b.cover_url} alt={`${b.title} cover`} style={{width:72,height:96,objectFit:'cover',border:'1px solid #ddd',borderRadius:3,flex:'0 0 auto'}}/> : <div className="bookCover">RED<br/>Print<br/>Publication</div>}<div className="itemMain"><div className="itemTitle">{b.title}</div><div className="meta">{b.editors ? `Edited by ${b.editors}` : 'IRED Publication'}</div><div className="meta">{[b.publication_month,b.publication_year].filter(Boolean).join(' ') || b.publication_label || ''}{b.volume ? ` · Vol. ${b.volume}` : ''}{b.issue ? ` · Issue ${b.issue}` : ''}</div></div><div className="actions"><Link className="smallBtn" href={`/red/view/${b.id}`} style={{background:'#cb2528',borderColor:'#cb2528',color:'#fff'}}>View Publication</Link></div></div>) : <div style={{padding:'18px',color:'#687586'}}>Published RED publications will appear here.</div>}</div></div>
      </div>
    </div></section>

    <section className="audience"><div className="container audienceGrid">{[['👥','For Researchers','Share your research with the world'],['🎓','For Academicians','Access quality research and publications'],['♟','For Students','Learn and explore new knowledge'],['🏛','For Institutions','A trusted platform for academic growth'],['🌐','For a Better Tomorrow','Research · Education · Development']].map(([i,t,d])=><div className="audienceItem" key={t}><div className="audienceIcon">{i}</div><div><strong>{t}</strong><span>{d}</span></div></div>)}</div></section>

    <section className="section about compactSection"><div className="container aboutGrid"><div><h2>About {settings.institution_short_name}</h2><p>The {settings.institution_name} ({settings.institution_short_name}) is an academic and research-oriented organization located in Ahmedabad, Gujarat, India. {settings.institution_short_name} is committed to promoting research, education, academic development, and the exchange of knowledge.</p><Link className="btn btnGold compact" href="/about">Learn More About {settings.institution_short_name} →</Link></div><div className="quotePanel"><div className="quote">“Research is the key<br/>to a brighter,<br/>more informed<br/>tomorrow.”</div><div className="openBook">⌒⌒</div></div></div></section>
  </main><Footer/></>
}