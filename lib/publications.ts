import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type PublicGreenPaper = {
  id: string
  title: string
  authors: string
  affiliation: string | null
  author_email: string | null
  abstract: string | null
  keywords: string[]
  article_id: string | null
  article_type: string | null
  publication_year: number | null
  publication_month: string | null
  volume: string | null
  issue: string | null
  issn: string | null
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
  publication_month: string | null
  volume: string | null
  issue: string | null
  issn: string | null
  publication_label: string | null
  isbn: string | null
  cover_path: string | null
  cover_url: string | null
  pdf_path: string
  published_at: string | null
  view_url: string
}

export type PublicationSearchResult = {
  kind: 'green' | 'red'
  id: string
  title: string
  people: string | null
  publication_year: number | null
  publication_month: string | null
  volume: string | null
  issue: string | null
  article_id: string | null
  subtitle: string | null
  cover_path: string | null
  cover_url?: string | null
}

export type GreenArchiveResult = {
  papers: PublicGreenPaper[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type RedArchiveResult = {
  publications: PublicRedBook[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

async function signedUrls(bucket: string, path: string) {
  const supabase = await createClient()
  const [{ data: view }, { data: download }] = await Promise.all([
    supabase.storage.from(bucket).createSignedUrl(path, 600),
    supabase.storage.from(bucket).createSignedUrl(path, 600, { download: true }),
  ])
  return { view_url: view?.signedUrl ?? null, download_url: download?.signedUrl ?? null }
}

const greenSelect = 'id,title,authors,affiliation,author_email,abstract,keywords,article_id,article_type,publication_year,publication_month,volume,issue,issn,doi,pdf_path,published_at'
const redSelect = 'id,title,subtitle,editors,description,theme,publication_year,publication_month,volume,issue,issn,publication_label,isbn,cover_path,pdf_path,published_at'

export async function getPublishedGreenPapers(limit?: number): Promise<PublicGreenPaper[]> {
  const supabase = await createClient()
  let query = supabase.from('green_papers').select(greenSelect).eq('status', 'published').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error || !data) return []
  return Promise.all(data.map(async (paper) => ({ ...paper, ...(await signedUrls('green-papers', paper.pdf_path)) }))) as Promise<PublicGreenPaper[]>
}

export async function getGreenArchive(options?: { q?: string; year?: number | null; page?: number; pageSize?: number }): Promise<GreenArchiveResult> {
  const supabase = await createClient()
  const q = (options?.q || '').trim().slice(0, 100)
  const year = options?.year && Number.isFinite(options.year) ? Number(options.year) : null
  const pageSize = Math.min(Math.max(options?.pageSize || 10, 5), 50)
  const page = Math.max(options?.page || 1, 1)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('green_papers')
    .select(greenSelect, { count: 'exact' })
    .eq('status', 'published')

  if (year) query = query.eq('publication_year', year)
  if (q) {
    const safe = q.replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').trim()
    if (safe) query = query.or(`title.ilike.%${safe}%,authors.ilike.%${safe}%,article_id.ilike.%${safe}%,doi.ilike.%${safe}%,abstract.ilike.%${safe}%`)
  }

  const { data, error, count } = await query
    .order('publication_year', { ascending: false, nullsFirst: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error || !data) return { papers: [], total: 0, page, pageSize, totalPages: 0 }

  const papers = await Promise.all(data.map(async (paper) => ({ ...paper, ...(await signedUrls('green-papers', paper.pdf_path)) }))) as PublicGreenPaper[]
  const total = count || 0
  return { papers, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getPublishedGreenPaperById(id: string): Promise<PublicGreenPaper | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('green_papers').select(greenSelect).eq('id', id).eq('status', 'published').maybeSingle()
  if (error || !data) return null
  return { ...data, ...(await signedUrls('green-papers', data.pdf_path)) } as PublicGreenPaper
}

export async function getPublishedRedBooks(limit?: number): Promise<PublicRedBook[]> {
  const supabase = await createClient()
  let query = supabase.from('red_books').select(redSelect).eq('status', 'published').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error || !data) return []
  return data.map((book) => ({ ...book, cover_url: book.cover_path ? supabase.storage.from('red-book-covers').getPublicUrl(book.cover_path).data.publicUrl : null, view_url: `/red/view/${book.id}` })) as PublicRedBook[]
}

export async function getRedArchive(options?: { q?: string; year?: number | null; page?: number; pageSize?: number }): Promise<RedArchiveResult> {
  const supabase = await createClient()
  const q = (options?.q || '').trim().slice(0, 100)
  const year = options?.year && Number.isFinite(options.year) ? Number(options.year) : null
  const pageSize = Math.min(Math.max(options?.pageSize || 10, 5), 50)
  const page = Math.max(options?.page || 1, 1)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('red_books')
    .select(redSelect, { count: 'exact' })
    .eq('status', 'published')

  if (year) query = query.eq('publication_year', year)
  if (q) {
    const safe = q.replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').trim()
    if (safe) query = query.or(`title.ilike.%${safe}%,subtitle.ilike.%${safe}%,editors.ilike.%${safe}%,description.ilike.%${safe}%,theme.ilike.%${safe}%,issn.ilike.%${safe}%,isbn.ilike.%${safe}%`)
  }

  const { data, error, count } = await query
    .order('publication_year', { ascending: false, nullsFirst: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error || !data) return { publications: [], total: 0, page, pageSize, totalPages: 0 }

  const publications = data.map((book) => ({
    ...book,
    cover_url: book.cover_path ? supabase.storage.from('red-book-covers').getPublicUrl(book.cover_path).data.publicUrl : null,
    view_url: `/red/view/${book.id}`,
  })) as PublicRedBook[]
  const total = count || 0
  return { publications, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getPublishedRedBookById(id: string): Promise<PublicRedBook | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('red_books').select(redSelect).eq('id', id).eq('status', 'published').maybeSingle()
  if (error || !data) return null
  return { ...data, cover_url: data.cover_path ? supabase.storage.from('red-book-covers').getPublicUrl(data.cover_path).data.publicUrl : null, view_url: `/red/view/${data.id}` } as PublicRedBook
}

export async function searchPublications(term: string): Promise<PublicationSearchResult[]> {
  const supabase = await createClient()
  const q = term.trim().slice(0, 120)
  if (!q) return []
  const { data, error } = await supabase.rpc('search_publications', { search_query: q })
  if (error || !data) return []
  return data.map((row: PublicationSearchResult) => ({
    ...row,
    cover_url: row.kind === 'red' && row.cover_path ? supabase.storage.from('red-book-covers').getPublicUrl(row.cover_path).data.publicUrl : null,
  })) as PublicationSearchResult[]
}
