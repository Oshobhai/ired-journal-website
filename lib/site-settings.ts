import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type SiteSettings={
  institution_name:string
  institution_short_name:string
  motto:string
  publisher_name:string
  official_address:string
  green_title:string
  green_description:string
  green_scope:string
  green_editor_in_chief:string
  red_title:string
  red_description:string
  red_scope:string
  first_volume_year:number
  article_id_prefix:string
  doi_prefix:string
  submission_status:string
  homepage_kicker:string
  homepage_title:string
  homepage_highlight:string
  homepage_description:string
  homepage_notice:string
  seo_title:string
  seo_description:string
  seo_keywords:string
}

export const defaultSiteSettings:SiteSettings={
  institution_name:'Institute of Research Education and Development',
  institution_short_name:'IRED',
  motto:'Knowledge for a Better Tomorrow',
  publisher_name:'Institute of Research Education and Development (IRED)',
  official_address:'A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.',
  green_title:'GREEN: The Research Journal',
  green_description:'International, peer-reviewed, open-access multidisciplinary research journal for original research papers and scholarly articles.',
  green_scope:'Accounting, Archaeology, Biology, Business, Chemistry, Commerce, Economics, Education, Law, Linguistics, Management, Physics, Political Science, Social Work, Arts, Humanities, Sciences, Social Sciences and related academic disciplines.',
  green_editor_in_chief:'Dr. Bhavika Kadikar — Librarian and Assistant Professor, Surendranagar University, Wadhwan',
  red_title:'RED: The Research Journal e-Journal',
  red_description:'Electronic research journal for online dissemination of scholarly and research-based knowledge across multiple academic disciplines.',
  red_scope:'Multidisciplinary research across Arts, Humanities, Sciences, Social Sciences, Commerce, Education, Management, Law and other academic disciplines.',
  first_volume_year:2026,
  article_id_prefix:'GREEN',
  doi_prefix:'',
  submission_status:'Open for Submission',
  homepage_kicker:'Research · Education · Development',
  homepage_title:'Research Knowledge',
  homepage_highlight:'for a Better Tomorrow',
  homepage_description:'A platform for researchers, academicians, and students to share knowledge and create a positive impact.',
  homepage_notice:'',
  seo_title:'IRED | GREEN: The Research Journal & RED: The Research Journal e-Journal',
  seo_description:'Official publication website of the Institute of Research Education and Development (IRED), publisher of GREEN: The Research Journal and RED: The Research Journal e-Journal.',
  seo_keywords:'IRED, Institute of Research Education and Development, GREEN: The Research Journal, RED: The Research Journal e-Journal, peer-reviewed journal, open-access journal, research journal, academic publications',
}

export async function getSiteSettings():Promise<SiteSettings>{
  try{
    const supabase=await createClient()
    const {data,error}=await supabase.from('site_settings').select('*').eq('id',true).maybeSingle()
    if(error||!data)return defaultSiteSettings
    const out={...defaultSiteSettings} as SiteSettings
    for(const key of Object.keys(defaultSiteSettings) as (keyof SiteSettings)[]){
      const value=data[key]
      if(value!==null&&value!==undefined&&value!=='') (out as any)[key]=value
    }
    return out
  }catch{return defaultSiteSettings}
}
