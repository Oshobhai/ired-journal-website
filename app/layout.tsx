import './globals.css';
import './logo-fix.css';
import './green-paper.css';
import './mobile.css';
import type { Metadata } from 'next';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||'https://ired-journal-website.vercel.app';

export const metadata: Metadata = {
  metadataBase:new URL(siteUrl),
  title:{default:'IRED | GREEN: The Research Journal & RED: The Research Journal e-Journal',template:'%s | IRED'},
  description:'Official publication website of the Institute of Research Education and Development (IRED), publisher of GREEN: The Research Journal and RED: The Research Journal e-Journal.',
  applicationName:'IRED Research Journals',
  keywords:['IRED','Institute of Research Education and Development','GREEN: The Research Journal','RED: The Research Journal e-Journal','peer-reviewed journal','open-access journal','research journal','academic publications'],
  authors:[{name:'Institute of Research Education and Development (IRED)'}],
  creator:'Institute of Research Education and Development (IRED)',
  publisher:'Institute of Research Education and Development (IRED)',
  openGraph:{type:'website',siteName:'IRED Research Journals',title:'IRED | GREEN: The Research Journal & RED: The Research Journal e-Journal',description:'Official research-journal publication website of the Institute of Research Education and Development (IRED).',url:siteUrl,images:[{url:'/ired-header-logo.webp?v=5',alt:'IRED — Institute of Research Education and Development'}]},
  twitter:{card:'summary_large_image',title:'IRED Research Journals',description:'GREEN: The Research Journal and RED: The Research Journal e-Journal, published by IRED.',images:['/ired-header-logo.webp?v=5']},
  robots:{index:true,follow:true},
};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
