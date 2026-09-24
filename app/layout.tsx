import './globals.css';
import './logo-fix.css';
import './green-paper.css';
import './mobile.css';
import type { Metadata } from 'next';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||'https://ired-journal-website.vercel.app';

export const metadata: Metadata = {
  metadataBase:new URL(siteUrl),
  title:{default:'IRED | Research Publications',template:'%s | IRED'},
  description:'Institute of Research Education and Development (IRED) academic research publication platform for GREEN research papers and RED research books.',
  applicationName:'IRED Research Publications',
  keywords:['IRED','Institute of Research Education and Development','GREEN Research Journal','RED Research Journal','research papers','research books','academic publications'],
  authors:[{name:'Institute of Research Education and Development'}],
  creator:'Institute of Research Education and Development',
  publisher:'Institute of Research Education and Development',
  openGraph:{type:'website',siteName:'IRED Research Publications',title:'IRED | Research Publications',description:'Academic research papers and research books published by the Institute of Research Education and Development.',url:siteUrl,images:[{url:'/ired-header-logo.webp?v=5',alt:'IRED — Institute of Research Education and Development'}]},
  twitter:{card:'summary_large_image',title:'IRED | Research Publications',description:'Academic research papers and research books published by IRED.',images:['/ired-header-logo.webp?v=5']},
  robots:{index:true,follow:true},
};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
