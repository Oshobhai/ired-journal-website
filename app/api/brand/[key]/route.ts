import { createClient } from '@/lib/supabase/server'

export const dynamic='force-dynamic'

const defaults:Record<string,string>={
  ired_header:'/ired-header-red.svg?v=1',
  ired_footer:'/ired-header-red.svg?v=1',
  green_logo:'/green-logo-family.svg?v=1',
  red_logo:'/red-logo-family.svg?v=1',
  green_word_header_logo:'/green-logo-family.svg?v=1',
  favicon:'/favicon.ico',
}

export async function GET(request:Request,{params}:{params:Promise<{key:string}>}){
  const {key}=await params
  const fallback=defaults[key]||'/'
  try{
    const supabase=await createClient()
    const {data}=await supabase.from('brand_assets').select('storage_path').eq('asset_key',key).maybeSingle()
    if(data?.storage_path){
      const url=supabase.storage.from('brand-assets').getPublicUrl(data.storage_path).data.publicUrl
      return Response.redirect(url,302)
    }
  }catch{}
  return Response.redirect(new URL(fallback,request.url),302)
}
