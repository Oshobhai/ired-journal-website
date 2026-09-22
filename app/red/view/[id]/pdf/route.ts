import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPublishedRedBookById } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await getPublishedRedBookById(id)
  if (!book) return new NextResponse('Not found', { status: 404 })

  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('red-books').createSignedUrl(book.pdf_path, 60)
  if (error || !data?.signedUrl) return new NextResponse('Not found', { status: 404 })

  const pdfResponse = await fetch(data.signedUrl, { cache: 'no-store' })
  if (!pdfResponse.ok || !pdfResponse.body) return new NextResponse('Not found', { status: 404 })

  return new NextResponse(pdfResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="red-research-book.pdf"',
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
