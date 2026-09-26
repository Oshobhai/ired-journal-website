import type { Metadata } from 'next'
import Link from 'next/link'
import { Header, Footer } from '../../../components'
import { createClient } from '@/lib/supabase/server'
import { getPublishedRedBookById } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params
  const publication=await getPublishedRedBookById(id)
  if(!publication)return {title:'RED: The Research Journal e-Journal'}
  const description=(publication.description||publication.subtitle||`${publication.title}${publication.editors?` edited by ${publication.editors}`:''}`).slice(0,220)
  return {
    title:publication.title,
    description,
    alternates:{canonical:`/red/view/${publication.id}`},
    openGraph:{type:'article',title:publication.title,description,url:`/red/view/${publication.id}`,images:publication.cover_url?[{url:publication.cover_url,alt:`${publication.title} cover`}]:undefined},
    other:{
      citation_journal_title:'RED: The Research Journal e-Journal',
      citation_title:publication.title,
      citation_author:publication.editors||'Institute of Research Education and Development',
      citation_publication_date:String(publication.publication_year||''),
      citation_volume:publication.volume||'',
      citation_issue:publication.issue||'',
      citation_issn:publication.issn||'',
      citation_isbn:publication.isbn||'',
      citation_publisher:'Institute of Research Education and Development (IRED)',
    }
  }
}

export default async function RedPublicationViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const publication = await getPublishedRedBookById(id)

  if (!publication) {
    return <><Header/><main className="container" style={{paddingTop:20,paddingBottom:30}}><div className="contentCard"><h1>Publication not available</h1><p>This RED e-Journal publication is not currently available for public viewing.</p><Link className="smallBtn" href="/red">← Back to RED e-Journal</Link></div></main><Footer/></>
  }

  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('red-books').createSignedUrl(publication.pdf_path, 300)
  const viewerUrl = data?.signedUrl ? `${data.signedUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH` : ''
  const dateLabel = [publication.publication_month, publication.publication_year].filter(Boolean).join(' ') || publication.publication_label || ''
  const details=[['Published',dateLabel],['Editor(s)',publication.editors],['Volume',publication.volume],['Issue',publication.issue],['ISSN',publication.issn],['ISBN',publication.isbn],['Theme',publication.theme]].filter(([,v])=>v)

  return <><Header/>
    <section className="pageHero"><div className="container"><div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#b32328',marginBottom:5}}>RED: The Research Journal e-Journal · Publication</div><h1 style={{fontSize:31,maxWidth:980}}>{publication.title}</h1>{publication.subtitle?<p style={{fontSize:13,color:'#536473',margin:'8px 0 0'}}>{publication.subtitle}</p>:null}<p style={{fontSize:11.5,color:'#6a7885',margin:'7px 0 0'}}>Published by Institute of Research Education and Development (IRED)</p></div></section>
    <main className="container" style={{paddingTop:20,paddingBottom:30}}>
      <div className="contentCard redViewerCard" style={{padding:18}}>
        <div style={{display:'flex',gap:22,alignItems:'flex-start',flexWrap:'wrap',marginBottom:18}}>
          {publication.cover_url?<img src={publication.cover_url} alt={`${publication.title} cover`} style={{width:180,maxWidth:'42vw',height:'auto',maxHeight:250,objectFit:'cover',border:'1px solid #d8d8d8',boxShadow:'0 3px 10px #00000014'}}/>:<div style={{width:160,height:215,display:'grid',placeItems:'center',background:'#8f2e31',color:'#fff',fontFamily:'Georgia,serif',textAlign:'center',padding:16}}>RED<br/>The Research Journal<br/>e-Journal</div>}
          <div style={{flex:'1 1 320px',minWidth:0}}>
            <div style={{fontSize:9.5,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:800,color:'#b32328',marginBottom:5}}>RED e-Journal Publication</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:23,color:'#0b2d4e',margin:'0 0 7px',overflowWrap:'anywhere'}}>{publication.title}</h2>
            {publication.subtitle?<div style={{fontSize:12.5,color:'#5f6f7b',marginBottom:10}}>{publication.subtitle}</div>:null}
            {publication.description?<p style={{fontSize:12,lineHeight:1.7,color:'#4e6170',margin:'0 0 13px'}}>{publication.description}</p>:null}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',borderTop:'1px solid #e2e7ea'}}>{details.map(([k,v])=><div key={String(k)} style={{padding:'9px 10px 9px 0',borderBottom:'1px solid #edf1f3'}}><div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.07em',fontWeight:800,color:'#7d8992'}}>{k}</div><div style={{fontSize:11.5,color:'#344b5d',marginTop:3,overflowWrap:'anywhere'}}>{v}</div></div>)}</div>
            <div style={{marginTop:13,display:'flex',gap:8,flexWrap:'wrap'}}><Link className="smallBtn" href="/red">← Back to RED e-Journal</Link><Link className="smallBtn" href="/journal-information">Official Journal Information</Link></div>
          </div>
        </div>
        <div style={{paddingTop:14,borderTop:'1px solid #dde4e8'}}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:10}}><h2 style={{fontFamily:'Georgia,serif',fontSize:18,color:'#0b2d4e',margin:0}}>Read RED e-Journal Publication</h2><span style={{fontSize:10.5,color:'#687586'}}>View-only mode · download control hidden</span></div>
        {viewerUrl ? <iframe className="redViewerFrame" src={viewerUrl} title={publication.title} style={{width:'100%',height:'82vh',border:'1px solid #ccd5dd',borderRadius:6,background:'#fff'}}/> : <div style={{padding:'24px',border:'1px solid #e1b9b9',background:'#fff5f5',borderRadius:6,color:'#8b2222'}}>The publication viewer could not be opened. Please try again after refreshing the page.{error?.message ? ` (${error.message})` : ''}</div>}</div>
      </div>
    </main><Footer/></>
}
