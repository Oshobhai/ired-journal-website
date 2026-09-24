import type { Metadata } from 'next'
import Link from 'next/link'
import { Header, Footer } from '../../../components'
import { createClient } from '@/lib/supabase/server'
import { getPublishedRedBookById } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params
  const book=await getPublishedRedBookById(id)
  if(!book)return {title:'RED Research Book'}
  const description=(book.description||book.subtitle||`${book.title}${book.editors?` edited by ${book.editors}`:''}`).slice(0,220)
  return {
    title:book.title,
    description,
    alternates:{canonical:`/red/view/${book.id}`},
    openGraph:{type:'book',title:book.title,description,url:`/red/view/${book.id}`,images:book.cover_url?[{url:book.cover_url,alt:`${book.title} cover`}]:undefined},
    other:{
      citation_title:book.title,
      citation_author:book.editors||'Institute of Research Education and Development',
      citation_publication_date:String(book.publication_year||''),
      citation_volume:book.volume||'',
      citation_issue:book.issue||'',
      citation_issn:book.issn||'',
      citation_isbn:book.isbn||'',
    }
  }
}

export default async function RedBookViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await getPublishedRedBookById(id)

  if (!book) {
    return <><Header/><main className="container" style={{paddingTop:20,paddingBottom:30}}><div className="contentCard"><h1>Book not available</h1><p>This RED publication is not currently available for public viewing.</p><Link className="smallBtn" href="/red">← Back to RED Books</Link></div></main><Footer/></>
  }

  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('red-books').createSignedUrl(book.pdf_path, 300)
  const viewerUrl = data?.signedUrl ? `${data.signedUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH` : ''
  const dateLabel = [book.publication_month, book.publication_year].filter(Boolean).join(' ') || book.publication_label || ''
  const details=[['Published',dateLabel],['Editor(s)',book.editors],['Volume',book.volume],['Issue',book.issue],['ISSN',book.issn],['ISBN',book.isbn],['Theme',book.theme]].filter(([,v])=>v)

  return <><Header/>
    <section className="pageHero"><div className="container"><div style={{fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:800,color:'#b32328',marginBottom:5}}>RED · Research Book</div><h1 style={{fontSize:31,maxWidth:980}}>{book.title}</h1>{book.subtitle?<p style={{fontSize:13,color:'#536473',margin:'8px 0 0'}}>{book.subtitle}</p>:null}</div></section>
    <main className="container" style={{paddingTop:20,paddingBottom:30}}>
      <div className="contentCard redViewerCard" style={{padding:18}}>
        <div style={{display:'flex',gap:22,alignItems:'flex-start',flexWrap:'wrap',marginBottom:18}}>
          {book.cover_url?<img src={book.cover_url} alt={`${book.title} cover`} style={{width:180,maxWidth:'42vw',height:'auto',maxHeight:250,objectFit:'cover',border:'1px solid #d8d8d8',boxShadow:'0 3px 10px #00000014'}}/>:<div style={{width:160,height:215,display:'grid',placeItems:'center',background:'#8f2e31',color:'#fff',fontFamily:'Georgia,serif',textAlign:'center',padding:16}}>RED<br/>Research Book</div>}
          <div style={{flex:'1 1 320px',minWidth:0}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:23,color:'#0b2d4e',margin:'0 0 7px',overflowWrap:'anywhere'}}>{book.title}</h2>
            {book.subtitle?<div style={{fontSize:12.5,color:'#5f6f7b',marginBottom:10}}>{book.subtitle}</div>:null}
            {book.description?<p style={{fontSize:12,lineHeight:1.7,color:'#4e6170',margin:'0 0 13px'}}>{book.description}</p>:null}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',borderTop:'1px solid #e2e7ea'}}>{details.map(([k,v])=><div key={String(k)} style={{padding:'9px 10px 9px 0',borderBottom:'1px solid #edf1f3'}}><div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.07em',fontWeight:800,color:'#7d8992'}}>{k}</div><div style={{fontSize:11.5,color:'#344b5d',marginTop:3,overflowWrap:'anywhere'}}>{v}</div></div>)}</div>
            <div style={{marginTop:13}}><Link className="smallBtn" href="/red">← Back to RED Books</Link></div>
          </div>
        </div>
        <div style={{paddingTop:14,borderTop:'1px solid #dde4e8'}}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:10}}><h2 style={{fontFamily:'Georgia,serif',fontSize:18,color:'#0b2d4e',margin:0}}>Read Publication</h2><span style={{fontSize:10.5,color:'#687586'}}>View-only mode · download control hidden</span></div>
        {viewerUrl ? <iframe className="redViewerFrame" src={viewerUrl} title={book.title} style={{width:'100%',height:'82vh',border:'1px solid #ccd5dd',borderRadius:6,background:'#fff'}}/> : <div style={{padding:'24px',border:'1px solid #e1b9b9',background:'#fff5f5',borderRadius:6,color:'#8b2222'}}>The PDF viewer could not be opened. Please try again after refreshing the page.{error?.message ? ` (${error.message})` : ''}</div>}</div>
      </div>
    </main><Footer/></>
}
