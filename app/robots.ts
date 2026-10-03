import type { MetadataRoute } from 'next'

export default function robots():MetadataRoute.Robots{
  const base=process.env.NEXT_PUBLIC_SITE_URL||'https://iredjournal.org'
  return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/admin/']}],sitemap:`${base}/sitemap.xml`,host:base}
}
