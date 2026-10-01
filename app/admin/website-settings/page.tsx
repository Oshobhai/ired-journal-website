import { requireAdmin } from '@/lib/admin-auth'
import AdminFrame from '../admin-frame'
import WebsiteSettingsManager from '../website-settings-manager'

export const dynamic='force-dynamic'

const websiteSettingsLayout=`
  .website-settings-layout > form{
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    align-items:start;
  }
  .website-settings-layout > form > *{
    grid-column:1 / -1;
    min-width:0;
  }
  .website-settings-layout > form > section:nth-of-type(2){
    grid-column:1;
  }
  .website-settings-layout > form > section:nth-of-type(3){
    grid-column:2;
  }
  .website-settings-layout > form > section:nth-of-type(2),
  .website-settings-layout > form > section:nth-of-type(3){
    height:100%;
    min-width:0;
  }
  @media (max-width:1100px){
    .website-settings-layout > form{
      grid-template-columns:minmax(0,1fr)!important;
    }
    .website-settings-layout > form > section:nth-of-type(2),
    .website-settings-layout > form > section:nth-of-type(3){
      grid-column:1;
    }
  }
`

export default async function WebsiteSettingsPage(){
  const access=await requireAdmin()
  return <AdminFrame access={access} active="website-settings" kicker="Administration" title="Website Settings" description="Manage institution, journal, publication, homepage and SEO settings from one protected admin workspace.">
    <style>{websiteSettingsLayout}</style>
    <div className="website-settings-layout"><WebsiteSettingsManager/></div>
  </AdminFrame>
}
