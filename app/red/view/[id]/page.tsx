import { Header, Footer } from '../../../components'
import { getPublishedRedBookById } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export default async function RedBookViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await getPublishedRedBookById(id)
  const dateLabel = book ? ([book.publication_month, book.publication_year].filter(Boolean).join(' ') || book.publication_label || '') : ''
  const title = book?.title || 'RED Research Book'

  return <><Header/><main className="container" style={{paddingTop:20,paddingBottom:30}}>
    <div className="contentCard" style={{padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'flex-start',marginBottom:14,flexWrap:'wrap'}}>
        <div>
          <h1 style={{margin:'0 0 6px',fontSize:24}}>{title}</h1>
          {book ? <>
            <div className="meta">{dateLabel}{book.volume ? ` · Volume ${book.volume}` : ''}{book.issue ? ` · Issue ${book.issue}` : ''}</div>
            <div className="meta">{book.editors ? `Edited by ${book.editors}` : ''}</div>
          </> : null}
        </div>
        <a className="smallBtn" href="/red">← Back to RED Books</a>
      </div>
      <div style={{fontSize:12,color:'#687586',marginBottom:10}}>View-only mode. Direct download link is not shown.</div>
      <iframe
        src={`/red/view/${id}/pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
        title={title}
        style={{width:'100%',height:'82vh',border:'1px solid #ccd5dd',borderRadius:6,background:'#fff'}}
      />
    </div>
  </main><Footer/></>
}
