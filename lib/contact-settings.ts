import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type ContactSettings={
  phone_primary:string
  phone_secondary:string
  email:string
  registration_no:string
}

export const defaultContactSettings:ContactSettings={
  phone_primary:'7383000930',
  phone_secondary:'7203998343',
  email:'ired.foundation@gmail.com',
  registration_no:'GUJ/15856/AHMEDABAD',
}

export async function getContactSettings():Promise<ContactSettings>{
  try{
    const supabase=await createClient()
    const {data,error}=await supabase.from('contact_settings').select('phone_primary,phone_secondary,email,registration_no').eq('id',true).maybeSingle()
    if(error||!data)return defaultContactSettings
    return {
      phone_primary:data.phone_primary||defaultContactSettings.phone_primary,
      phone_secondary:data.phone_secondary||defaultContactSettings.phone_secondary,
      email:data.email||defaultContactSettings.email,
      registration_no:data.registration_no||defaultContactSettings.registration_no,
    }
  }catch{return defaultContactSettings}
}
