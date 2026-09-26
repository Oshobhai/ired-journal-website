import './globals.css';
import './logo-fix.css';
import './green-paper.css';
import './mobile.css';
import type { Metadata } from 'next';
import {getSiteSettings} from '@/lib/site-settings';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||'https://ired-journal-website.vercel.app';

export async function generateMetadata():Promise<Metadata>{
  const settings=await getSiteSettings();
  const keywords=settings.seo_keywords.split(',').map(x=>x.trim()).filter(Boolean);
  return {
    metadataBase:new URL(siteUrl),
    title:{default:settings.seo_title,template:`%s | ${settings.institution_short_name}`},
    description:settings.seo_description,
    applicationName:`${settings.institution_short_name} Research Journals`,
    keywords,
    authors:[{name:settings.publisher_name}],
    creator:settings.publisher_name,
    publisher:settings.publisher_name,
    icons:{icon:'/api/brand/favicon'},
    openGraph:{type:'website',siteName:`${settings.institution_short_name} Research Journals`,title:settings.seo_title,description:settings.seo_description,url:siteUrl,images:[{url:'/api/brand/ired_header',alt:`${settings.institution_short_name} — ${settings.institution_name}`}]},
    twitter:{card:'summary_large_image',title:settings.seo_title,description:settings.seo_description,images:['/api/brand/ired_header']},
    robots:{index:true,follow:true},
  };
}

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
