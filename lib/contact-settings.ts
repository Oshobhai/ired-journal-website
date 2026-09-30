import 'server-only'
import { createClient } from '@/lib/supabase/server'

export const IRED_EMAILS={
  contact:'contact@iredjournal.org',
  foundation:'ired.foundation@gmail.com',
  greenSubmission:'greensubmission@iredjournal.org',
  redSubmission:'redsubmission@iredjournal.org',
} as const

export type ContactSettings={
  phone_primary:string
  phone_secondary:string
  email:string
  secondary_email:string
  registration_no:string
  green_issn:string
  red_eissn:string
}

export const defaultContactSettings:ContactSettings={
  phone_primary:'7383000930',
  phone_secondary:'7203998343',
  email:IRED_EMAILS.contact,
  secondary_email:IRED_EMAILS.foundation,
  registration_no:'GUJ/15856/AHMEDABAD',
  green_issn:'Pending',
  red_eissn:'Pending',
}

export async function getContactSettings():Promise<ContactSettings>{
  try{
    const supabase=await createClient()
    const {data,error}=await supabase.from('contact_settings').select('phone_primary,phone_secondary,email,secondary_email,registration_no,green_issn,red_eissn').eq('id',true).maybeSingle()
    if(error||!data)return defaultContactSettings
    return {
      phone_primary:data.phone_primary||defaultContactSettings.phone_primary,
      phone_secondary:data.phone_secondary||defaultContactSettings.phone_secondary,
      email:data.email||defaultContactSettings.email,
      secondary_email:data.secondary_email||defaultContactSettings.secondary_email,
      registration_no:data.registration_no||defaultContactSettings.registration_no,
      green_issn:data.green_issn||defaultContactSettings.green_issn,
      red_eissn:data.red_eissn||defaultContactSettings.red_eissn,
    }
  }catch{return defaultContactSettings}
}
