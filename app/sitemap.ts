import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=process.env.NEXT_PUBLIC_SITE_URL||'https://ired-journal-website.vercel.app'
  const staticPaths=['','/about','/journal-information','/green','/red','/editorial-board','/author-guidelines','/publication-ethics','/archives','/contact','/privacy','/terms']
  const supabase=await createClient()
  const [{data:green},{data:red}]=await Promise.all([
    supabase.from('green_papers').select('id,updated_at,published_at').eq('status','published'),
    supabase.from('red_books').select('id,updated_at,published_at').eq('status','published'),
  ])
  return [
    ...staticPaths.map((path,index)=>({url:`${base}${path}`,changeFrequency:(index===0?'weekly':'monthly') as 'weekly'|'monthly',priority:index===0?1:path==='/journal-information'?0.9:0.7})),
    ...(green||[]).map(item=>({url:`${base}/green/view/${item.id}`,lastModified:item.updated_at||item.published_at||undefined,changeFrequency:'monthly' as const,priority:0.8})),
    ...(red||[]).map(item=>({url:`${base}/red/view/${item.id}`,lastModified:item.updated_at||item.published_at||undefined,changeFrequency:'monthly' as const,priority:0.8})),
  ]
}
