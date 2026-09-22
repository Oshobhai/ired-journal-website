import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type PublicGreenPaper = {
  id: string
  title: string
  authors: string
  abstract: string | null
  keywords: string[]
  publication_year: number | null
  volume: string | null
  issue: string | null
  doi: string | null
  pdf_path: string
  published_at: string | null
  view_url: string | null
  download_url: string | null
}

export type PublicRedBook = {
  id: string
  title: string
  subtitle: string | null
  editors: string | null
  description: string | null
  theme: string | null
  publication_year: number | null
  volume: string | null
  isbn: string | null
  pdf_path: string
  published_at: string | null
  view_url: string | null
  download_url: string | null
}

async function signedUrls(bucket: string, path: string) {
  const supabase = await createClient()
  const [{ data: view }, { data: download }] = await Promise.all([
    supabase.storage.from(bucket).createSignedUrl(path, 600),
    supabase.storage.from(bucket).createSignedUrl(path, 600, { download: true }),
  ])

  return {
    view_url: view?.signedUrl ?? null,
    download_url: download?.signedUrl ?? null,
  }
}

export async function getPublishedGreenPapers(limit?: number): Promise<PublicGreenPaper[]> {
  const supabase = await createClient()
  let query = supabase
    .from('green_papers')
    .select('id,title,authors,abstract,keywords,publication_year,volume,issue,doi,pdf_path,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error || !data) return []

  return Promise.all(
    data.map(async (paper) => ({
      ...paper,
      ...(await signedUrls('green-papers', paper.pdf_path)),
    }))
  ) as Promise<PublicGreenPaper[]>
}

export async function getPublishedRedBooks(limit?: number): Promise<PublicRedBook[]> {
  const supabase = await createClient()
  let query = supabase
    .from('red_books')
    .select('id,title,subtitle,editors,description,theme,publication_year,volume,isbn,pdf_path,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error || !data) return []

  return Promise.all(
    data.map(async (book) => ({
      ...book,
      ...(await signedUrls('red-books', book.pdf_path)),
    }))
  ) as Promise<PublicRedBook[]>
}
