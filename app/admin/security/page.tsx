import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'
import AdminFrame from '../admin-frame'

export const dynamic='force-dynamic'

type Bucket={id:string;public:boolean;objects:number;bytes:number}
type Snapshot={
  staff:{full_admins:number;editorial_managers:number;pending_invites:number}
  publications:{green_total:number;green_published:number;green_drafts:number;red_total:number;red_published:number;red_drafts:number}
  storage:{total_objects:number;total_bytes:number;buckets:Bucket[]}
  security:{storage_policies:number;rls_tables:number;checked_at:string}
}

function formatBytes(value:number){
  if(!value)return '0 B'
  const units=['B','KB','MB','GB','TB']
  let size=value,index=0
  while(size>=1024&&index<units.length-1){size/=1024;index++}
  return `${size>=10||index===0?size.toFixed(0):size.toFixed(1)} ${units[index]}`
}

function StatCard({label,value,detail}:{label:string;value:string|number;detail:string}){
  return <div style={{border:'1px solid #d9e2e8',background:'#fff',padding:'15px 16px',minHeight:94}}>
    <div style={{fontSize:9.5,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:'#71808d'}}>{label}</div>
    <div style={{fontFamily:'Georgia,serif',fontSize:25,fontWeight:700,color:'#0b2d4e',marginTop:6}}>{value}</div>
    <div style={{fontSize:10.5,color:'#687986',marginTop:4,lineHeight:1.45}}>{detail}</div>
  </div>
}

export default async function SecurityAdmin(){
  const access=await requireAdmin()
  const supabase=await createClient()
  const {data,error}=await supabase.rpc('security_dashboard_snapshot')
  const snapshot=(data||null) as Snapshot|null

  return <AdminFrame access={access} active="security" kicker="Administration" title="Security & Storage" description="Live operational view of staff access, publication protection, storage usage and Supabase security controls.">
    {error||!snapshot?<section style={{background:'#fff7f2',border:'1px solid #efd1c3',padding:'14px 16px',fontSize:12,color:'#87462f'}}>Security dashboard data could not be loaded. {error?.message||'Please refresh the page.'}</section>:<>
      <section style={{background:'#f8fafb',border:'1px solid #d7e0e6',borderLeft:'4px solid #8b6d2f',padding:'17px 19px'}}>
        <h2 style={{fontFamily:'Georgia,serif',color:'#0b2d4e',fontSize:18,margin:'0 0 8px'}}>Current Protection Model</h2>
        <p style={{fontSize:11,lineHeight:1.7,color:'#63727f',margin:0}}>Full administrators control publications, protected storage and delegated staff access. Editorial Board Managers remain restricted to academic-governance records. This dashboard reads the current Supabase state rather than showing a static checklist.</p>
      </section>

      <section className="contentCard">
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'end',flexWrap:'wrap',marginBottom:14}}><div><h2 style={{margin:'0 0 4px'}}>Live Security Status</h2><p style={{margin:0,fontSize:11,color:'#6a7885'}}>Last checked: {new Date(snapshot.security.checked_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</p></div><span style={{fontSize:10,fontWeight:800,color:'#167843',border:'1px solid #c9dfd1',background:'#f3faf5',padding:'5px 8px'}}>SUPABASE LIVE</span></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
          <StatCard label="Full Administrators" value={snapshot.staff.full_admins} detail="Accounts with full administrative control"/>
          <StatCard label="Editorial Managers" value={snapshot.staff.editorial_managers} detail="Restricted academic-governance accounts"/>
          <StatCard label="Pending Invites" value={snapshot.staff.pending_invites} detail="Staff invitations awaiting account setup"/>
          <StatCard label="Storage Objects" value={snapshot.storage.total_objects} detail={`${formatBytes(snapshot.storage.total_bytes)} stored across buckets`}/>
          <StatCard label="Storage Policies" value={snapshot.security.storage_policies} detail="Policies currently attached to storage.objects"/>
          <StatCard label="RLS Tables" value={snapshot.security.rls_tables} detail="Public-schema tables protected by Row Level Security"/>
        </div>
      </section>

      <section className="contentCard">
        <h2 style={{marginTop:0}}>Publication Protection</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12}}>
          <div style={{border:'1px solid #dce5df',borderTop:'3px solid #167843',padding:'14px 15px'}}><div style={{fontSize:10,fontWeight:800,color:'#167843',textTransform:'uppercase',letterSpacing:'.08em'}}>GREEN Papers</div><div style={{fontFamily:'Georgia,serif',fontSize:24,color:'#0b2d4e',margin:'5px 0'}}>{snapshot.publications.green_total}</div><div style={{fontSize:11,color:'#667784'}}>{snapshot.publications.green_published} Published · {snapshot.publications.green_drafts} Draft</div></div>
          <div style={{border:'1px solid #eadedd',borderTop:'3px solid #9b3434',padding:'14px 15px'}}><div style={{fontSize:10,fontWeight:800,color:'#9b3434',textTransform:'uppercase',letterSpacing:'.08em'}}>RED Books</div><div style={{fontFamily:'Georgia,serif',fontSize:24,color:'#0b2d4e',margin:'5px 0'}}>{snapshot.publications.red_total}</div><div style={{fontSize:11,color:'#667784'}}>{snapshot.publications.red_published} Published · {snapshot.publications.red_drafts} Draft</div></div>
        </div>
      </section>

      <section className="contentCard">
        <h2 style={{marginTop:0}}>Storage Buckets</h2>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5,minWidth:650}}><thead><tr style={{background:'#f4f7f9',textAlign:'left'}}><th style={{padding:9}}>Bucket</th><th style={{padding:9}}>Visibility</th><th style={{padding:9}}>Objects</th><th style={{padding:9}}>Storage Used</th><th style={{padding:9}}>Status</th></tr></thead><tbody>{snapshot.storage.buckets.map(bucket=><tr key={bucket.id} style={{borderTop:'1px solid #e3e9ed'}}><td style={{padding:9,fontWeight:700,color:'#0b2d4e'}}>{bucket.id}</td><td style={{padding:9}}>{bucket.public?'Public':'Protected'}</td><td style={{padding:9}}>{bucket.objects}</td><td style={{padding:9}}>{formatBytes(bucket.bytes)}</td><td style={{padding:9}}><span style={{fontSize:10,fontWeight:800,color:'#167843'}}>Available</span></td></tr>)}</tbody></table></div>
      </section>

      <section className="contentCard">
        <h2 style={{marginTop:0}}>Operational Checks</h2>
        <div style={{display:'grid',gap:8,fontSize:11,color:'#4f6474'}}>
          <div>✓ Service-role credentials must remain server-side and must never be exposed through NEXT_PUBLIC variables.</div>
          <div>✓ Publication and storage write permissions remain limited to authenticated administrative roles.</div>
          <div>✓ Review pending invitations and staff access whenever editorial personnel change.</div>
          <div>✓ Prefer archiving obsolete scholarly records over permanent deletion whenever preservation is appropriate.</div>
          <div>✓ Verify production environment variables and Supabase policies before major releases.</div>
        </div>
      </section>
    </>}
  </AdminFrame>
}
