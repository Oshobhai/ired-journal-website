import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type SiteSettings={
  institution_name:string
  institution_short_name:string
  motto:string
  publisher_name:string
  official_address:string
  journal_office_address:string
  green_title:string
  green_description:string
  green_scope:string
  green_editor_in_chief:string
  green_frequency:string
  green_language:string
  green_format:string
  green_subject:string
  red_title:string
  red_description:string
  red_scope:string
  red_frequency:string
  red_language:string
  red_format:string
  red_subject:string
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
  official_address:'IRED, Pooja Bunglows, Kalol Highway-Road, Chandkheda, Ahmedabad-382424, Gujarat, India.',
  journal_office_address:'A-3, 3rd Floor, Gita Apartment, Nr. Hirabaug Crossing, Ambawadi, Ahmedabad-380015, Gujarat, India.',
  green_title:'GREEN: The Research e-Journal',
  green_description:'International, peer-reviewed, open-access multidisciplinary research e-Journal for original research papers and scholarly articles.',
  green_scope:'Accounting, Archaeology, Biology, Business, Chemistry, Commerce, Economics, Education, Law, Linguistics, Management, Physics, Political Science, Social Work, Arts, Humanities, Sciences, Social Sciences and related academic disciplines.',
  green_editor_in_chief:'Dr. Bhavika Kadikar — Librarian and Assistant Professor, Surendranagar University, Wadhwan',
  green_frequency:'Monthly',
  green_language:'English, Gujarati',
  green_format:'Online',
  green_subject:'Multidisciplinary',
  red_title:'RED: The Research Journal',
  red_description:'Print research journals to disseminate scholarly and research-based knowledge across multiple academic disciplines.',
  red_scope:'Multidisciplinary research across Arts, Humanities, Sciences, Social Sciences, Commerce, Education, Management, Law and other academic disciplines.',
  red_frequency:'Monthly',
  red_language:'English, Gujarati',
  red_format:'Print',
  red_subject:'Multidisciplinary',
  first_volume_year:2026,
  article_id_prefix:'GREEN',
  doi_prefix:'',
  submission_status:'Open for Submission',
  homepage_kicker:'Research · Education · Development',
  homepage_title:'Research Knowledge',
  homepage_highlight:'for a Better Tomorrow',
  homepage_description:'A platform for researchers, academicians, and students to share knowledge and create a positive impact.',
  homepage_notice:'',
  seo_title:'IRED | GREEN: The Research e-Journal & RED: The Research Journal',
  seo_description:'Official publication website of the Institute of Research Education and Development (IRED), publisher of GREEN: The Research e-Journal and RED: The Research Journal.',
  seo_keywords:'IRED, Institute of Research Education and Development, GREEN: The Research e-Journal, RED: The Research Journal, peer-reviewed journal, open-access journal, research journal, academic publications',
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
