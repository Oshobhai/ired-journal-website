import {requireAdmin} from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import ActivityLogManager from '../activity-log-manager'

export const dynamic='force-dynamic'

export default async function ActivityLogPage(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="activity-log" kicker="Administrative Audit" title="Activity Log" description="Review the internal, read-only history of publication, file, certificate, status and GREEN issue-management changes.">
    <ActivityLogManager/>
  </AdminFrame>
}
