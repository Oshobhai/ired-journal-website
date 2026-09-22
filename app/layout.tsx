import './globals.css';
import './logo-fix.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {title:'IRED | Research Publications',description:'Institute of Research Education and Development research publication platform'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
