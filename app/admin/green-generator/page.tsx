import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import GreenPaperGenerator from '../green-paper-generator'

export const dynamic='force-dynamic'

export default async function GreenGeneratorAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="green-generator" kicker="Publication Workflow" title="GREEN Word Formatter" description="Upload the final author Word document and add the GREEN journal header, footer, Article ID, Volume, Issue and publication date automatically while preserving the paper content.">
    <GreenPaperGenerator/>
  </AdminFrame>
}
