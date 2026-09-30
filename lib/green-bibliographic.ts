import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type GreenEnglishBibliographic = {
  id: string
  english_title: string | null
  english_abstract: string | null
}

export async function getGreenEnglishBibliographic(ids: string[]): Promise<Map<string, GreenEnglishBibliographic>> {
  const cleanIds = Array.from(new Set(ids.filter(Boolean)))
  if (!cleanIds.length) return new Map()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('green_papers')
    .select('id,english_title,english_abstract')
    .in('id', cleanIds)
  if (error || !data) return new Map()
  return new Map((data as GreenEnglishBibliographic[]).map(row => [row.id, row]))
}

export async function getGreenEnglishBibliographicById(id: string): Promise<GreenEnglishBibliographic | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('green_papers')
    .select('id,english_title,english_abstract')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()
  if (error || !data) return null
  return data as GreenEnglishBibliographic
}
