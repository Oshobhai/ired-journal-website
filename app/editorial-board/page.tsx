import {Header,Footer} from '../components';
import {createClient} from '@/lib/supabase/server';

type Member={id:string;name:string;role:string|null;institution:string;location:string|null;section:'editorial'|'review';sort_order:number};

function AcademicIcon({type}:{type:'board'|'review'|'institution'|'location'}){
  const common={width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true};
  if(type==='board') return <svg {...common}><path d="M12 3 3 8h18l-9-5Z"/><path d="M5 10v7M9 10v7M15 10v7M19 10v7M3 20h18"/></svg>;
  if(type==='review') return <svg {...common}><path d="M9 11l2 2 4-4"/><path d="M5 4h14v16H5z"/><path d="M8 4V2h8v2"/></svg>;
  if(type==='institution') return <svg {...common}><path d="M4 19h16M6 17V9h12v8M9 17v-5M15 17v-5M12 3l8 4H4l8-4Z"/></svg>;
  return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
}

function Initials({name}:{name:string}){
  const clean=name.replace(/^Dr\.\s*/,'').trim().split(/\s+/).filter(Boolean);
  const initials=(clean[0]?.[0]||'')+(clean.length>1?(clean[clean.length-1]?.[0]||''):'');
  return <div style={{width:52,height:52,borderRadius:'50%',display:'grid',placeItems:'center',background:'#eef3f6',border:'1px solid #cfd9e1',color:'#12395c',fontFamily:'Georgia,serif',fontSize:16,fontWeight:700,flex:'0 0 auto'}}>{initials}</div>;
}

function MemberCard({member,index,tone}:{member:Member;index:number;tone:'green'|'navy'}){
  const accent=tone==='green'?'#167843':'#173d60';
  return <article style={{border:'1px solid #dbe3e9',borderTop:`3px solid ${accent}`,background:'#fff',padding:'17px 18px',minHeight:178,display:'flex',flexDirection:'column'}}>
    <div style={{display:'flex',gap:13,alignItems:'flex-start'}}><Initials name={member.name}/><div style={{minWidth:0}}><div style={{fontSize:9.5,letterSpacing:'.09em',textTransform:'uppercase',fontWeight:800,color:'#7a8792',marginBottom:4}}>{tone==='green'?'Editorial Board':'Review Committee'} · {String(index+1).padStart(2,'0')}</div><h3 style={{fontFamily:'Georgia,serif',fontSize:17,color:'#0b2d4e',lineHeight:1.25,margin:'0 0 5px'}}>{member.name}</h3>{member.role?<div style={{fontSize:11.5,fontWeight:700,color:accent,lineHeight:1.45}}>{member.role}</div>:null}</div></div>
    <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid #edf1f4',display:'grid',gap:7}}><div style={{display:'grid',gridTemplateColumns:'20px 1fr',gap:6,alignItems:'start',fontSize:11.5,lineHeight:1.5,color:'#4e5f6e'}}><span style={{color:'#718290'}}><AcademicIcon type="institution"/></span><span>{member.institution}</span></div>{member.location?<div style={{display:'grid',gridTemplateColumns:'20px 1fr',gap:6,alignItems:'start',fontSize:11.5,lineHeight:1.5,color:'#6a7885'}}><span style={{color:'#8997a2'}}><AcademicIcon type="location"/></span><span>{member.location}</span></div>:null}</div>
  </article>;
}

export const dynamic='force-dynamic';

export default async function Editorial(){
  const supabase=await createClient();
  const {data}=await supabase.from('editorial_members').select('id,name,role,institution,location,section,sort_order').eq('is_visible',true).order('sort_order').order('name');
  const members=(data||[]) as Member[];
  const board=members.filter(m=>m.section==='editorial');
  const review=members.filter(m=>m.section==='review');

  return <><Header/>
    <section className="pageHero" style={{padding:'32px 0 30px'}}><div className="container"><div style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:42,height:42,borderRadius:'50%',background:'#fff',border:'1px solid #cad6df',display:'grid',placeItems:'center',color:'#0b2d4e'}}><AcademicIcon type="board"/></span><div><div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:800,color:'#7b8792',marginBottom:3}}>Academic Governance</div><h1 style={{fontSize:36,margin:0}}>Editorial Board</h1></div></div><p style={{maxWidth:820,fontSize:12.5,lineHeight:1.65,color:'#5d6c79',margin:'12px 0 0'}}>The editorial and review panels support the academic quality, subject relevance, and scholarly review process of IRED research publications.</p></div></section>
    <main className="container" style={{padding:'24px 0 34px'}}>
      <section style={{marginBottom:30}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:18,borderBottom:'2px solid #173d60',paddingBottom:9,marginBottom:16}}><div><div style={{display:'flex',alignItems:'center',gap:7,color:'#173d60',fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase'}}><AcademicIcon type="board"/> Editorial Leadership</div><h2 style={{fontFamily:'Georgia,serif',fontSize:24,color:'#0b2d4e',margin:'5px 0 0'}}>Editorial Board</h2></div><div style={{fontSize:11,color:'#71808d'}}>{board.length} Members</div></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:14}}>{board.length?board.map((member,i)=><MemberCard key={member.id} member={member} index={i} tone="green"/>):<p style={{fontSize:12,color:'#687586'}}>Editorial Board members will appear here.</p>}</div></section>
      <section><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:18,borderBottom:'2px solid #8b6d2f',paddingBottom:9,marginBottom:16}}><div><div style={{display:'flex',alignItems:'center',gap:7,color:'#8b6d2f',fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase'}}><AcademicIcon type="review"/> Peer Review</div><h2 style={{fontFamily:'Georgia,serif',fontSize:24,color:'#0b2d4e',margin:'5px 0 0'}}>Review Committee</h2></div><div style={{fontSize:11,color:'#71808d'}}>{review.length} Members</div></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:14}}>{review.length?review.map((member,i)=><MemberCard key={member.id} member={member} index={i} tone="navy"/>):<p style={{fontSize:12,color:'#687586'}}>Review Committee members will appear here.</p>}</div></section>
      <section style={{marginTop:26,padding:'15px 18px',background:'#f7f9fb',border:'1px solid #dbe3e9',fontSize:11.5,lineHeight:1.6,color:'#5b6b79'}}><strong style={{color:'#0b2d4e'}}>Academic note:</strong> Board and committee affiliations are displayed for institutional identification. Editorial assignments may vary according to subject area and publication requirements.</section>
    </main><Footer/></>;
}
