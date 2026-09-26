import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import GreenPaperGenerator from '../green-paper-generator'
import GreenFinalPdfManager from '../green-final-pdf-manager'

export const dynamic='force-dynamic'

export default async function GreenGeneratorAdmin(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="green-generator" kicker="Publication Workflow" title="GREEN Paper Generator" description="Process multilingual student and researcher DOCX manuscripts, verify extracted metadata, preview the GREEN journal format, save a protected draft and attach the final publication PDF from the same workflow.">
    <GreenPaperGenerator/>
    <GreenFinalPdfManager/>
  </AdminFrame>
}
