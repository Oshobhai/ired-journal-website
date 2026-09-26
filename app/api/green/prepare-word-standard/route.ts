import { Buffer } from 'node:buffer'
import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { createClient } from '@/lib/supabase/server'
import { POST as prepareBaseWord } from '../prepare-word/route'

export const runtime='nodejs'
export const dynamic='force-dynamic'

const DOCX_MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
type ZipEntry={name:string;data:Buffer;time:number;date:number}

function crc32(buf:Buffer){
  let c=0xffffffff
  for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}
  return (c^0xffffffff)>>>0
}

function unzip(buf:Buffer):ZipEntry[]{
  let end=-1
  for(let i=buf.length-22;i>=Math.max(0,buf.length-65557);i--){if(buf.readUInt32LE(i)===0x06054b50){end=i;break}}
  if(end<0)throw new Error('Prepared Word file is not a valid DOCX package.')
  const count=buf.readUInt16LE(end+10)
  let p=buf.readUInt32LE(end+16)
  const out:ZipEntry[]=[]
  for(let i=0;i<count;i++){
    if(buf.readUInt32LE(p)!==0x02014b50)throw new Error('Could not read prepared DOCX package.')
    const method=buf.readUInt16LE(p+10),time=buf.readUInt16LE(p+12),date=buf.readUInt16LE(p+14)
    const csize=buf.readUInt32LE(p+20),usize=buf.readUInt32LE(p+24),nlen=buf.readUInt16LE(p+28),elen=buf.readUInt16LE(p+30),clen=buf.readUInt16LE(p+32),local=buf.readUInt32LE(p+42)
    const name=buf.subarray(p+46,p+46+nlen).toString('utf8')
    const ln=buf.readUInt16LE(local+26),le=buf.readUInt16LE(local+28),start=local+30+ln+le
    const compressed=buf.subarray(start,start+csize)
    const data=method===0?Buffer.from(compressed):method===8?inflateRawSync(compressed):(()=>{throw new Error(`Unsupported DOCX compression in ${name}.`)})()
    if(data.length!==usize)throw new Error(`Could not verify ${name}.`)
    out.push({name,data,time,date});p+=46+nlen+elen+clen
  }
  return out
}

function zip(entries:ZipEntry[]){
  const locals:Buffer[]=[];const centrals:Buffer[]=[];let offset=0
  for(const entry of entries){
    const name=Buffer.from(entry.name,'utf8'),dir=entry.name.endsWith('/'),method=dir?0:8
    const compressed=dir?Buffer.alloc(0):deflateRawSync(entry.data,{level:6}),crc=crc32(entry.data)
    const local=Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(method,8);local.writeUInt16LE(entry.time||0,10);local.writeUInt16LE(entry.date||0,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(entry.data.length,22);local.writeUInt16LE(name.length,26)
    locals.push(local,name,compressed)
    const central=Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(method,10);central.writeUInt16LE(entry.time||0,12);central.writeUInt16LE(entry.date||0,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(entry.data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(dir?0x10:0,38);central.writeUInt32LE(offset,42)
    centrals.push(central,name);offset+=local.length+name.length+compressed.length
  }
  const localData=Buffer.concat(locals),centralData=Buffer.concat(centrals),end=Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(centralData.length,12);end.writeUInt32LE(localData.length,16)
  return Buffer.concat([localData,centralData,end])
}

function esc(value:string){return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function run(text:string,size=16,bold=false,color='1B2633',italic=false){return `<w:r><w:rPr>${bold?'<w:b/>':''}${italic?'<w:i/>':''}<w:color w:val="${color}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`}
function para(content:string,align:'left'|'right'|'center'='left',after=0){return `<w:p><w:pPr><w:jc w:val="${align}"/><w:spacing w:after="${after}"/></w:pPr>${content}</w:p>`}

function headerMarkup(articleId:string,volume:number,issue:number,year:number){
  const left=[
    para(run('◉ ',42,true,'148444')+run('GREEN',48,true,'148444'), 'left', 0),
    para(run('The Research Journal',18,true,'148444',true),'left',15),
    para(run('Institute of Research Education and Development (IRED)',13,true,'334B5F'),'left',0),
    para(run('Knowledge for a Better Tomorrow',12,false,'148444',true),'left',0),
  ].join('')
  const right=[
    para(run(`Volume ${volume} | Issue ${issue} | ${year}`,16,true,'1B2633'),'right',0),
    para(run('ISSN: Not assigned (Online)',13,false,'536779'),'right',0),
    para(run(`Article ID: ${articleId}`,13,false,'536779'),'right',18),
    `<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="13"/><w:shd w:val="clear" w:color="auto" w:fill="148444"/></w:rPr><w:t xml:space="preserve">  Research Article  </w:t></w:r></w:p>`,
  ].join('')
  return `<!-- IRED_GREEN_STANDARD_HEADER --><w:tbl><w:tblPr><w:tblW w:w="10000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="6100"/><w:gridCol w:w="3900"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="6100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${left}</w:tc><w:tc><w:tcPr><w:tcW w:w="3900" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${right}</w:tc></w:tr></w:tbl><w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="10" w:space="1" w:color="148444"/></w:pBdr><w:spacing w:after="40"/></w:pPr></w:p><!-- /IRED_GREEN_STANDARD_HEADER -->`
}

function footerMarkup(articleId:string,volume:number,issue:number){
  const pageField=`<w:r><w:rPr><w:b/><w:color w:val="148444"/><w:sz w:val="14"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>`
  return `<!-- IRED_GREEN_STANDARD_FOOTER --><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="6" w:space="1" w:color="148444"/></w:pBdr><w:spacing w:before="50" w:after="0"/></w:pPr></w:p><w:tbl><w:tblPr><w:tblW w:w="10000" w:type="dxa"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="8000"/><w:gridCol w:w="2000"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="8000" w:type="dxa"/></w:tcPr>${para(run(`${articleId}  |  Volume ${volume}  |  Issue ${issue}`,14,false,'526577'),'left',0)}</w:tc><w:tc><w:tcPr><w:tcW w:w="2000" w:type="dxa"/></w:tcPr>${para(run('Page ',14,true,'148444')+pageField,'right',0)}</w:tc></w:tr></w:tbl><!-- /IRED_GREEN_STANDARD_FOOTER -->`
}

function replaceRootBody(xml:string,root:'hdr'|'ftr',markup:string){
  const pattern=new RegExp(`(<w:${root}\\b[^>]*>)[\\s\\S]*?(<\\/w:${root}>)`)
  if(!pattern.test(xml))throw new Error(`Could not format Word ${root==='hdr'?'header':'footer'}.`)
  return xml.replace(pattern,`$1${markup}$2`)
}

function formatDocx(input:Buffer,articleId:string,volume:number,issue:number,year:number){
  const entries=unzip(input)
  const header=headerMarkup(articleId,volume,issue,year),footer=footerMarkup(articleId,volume,issue)
  let headers=0,footers=0
  for(const entry of entries){
    if(/^word\/header\d*\.xml$/i.test(entry.name)||entry.name==='word/iredHeader.xml'){
      entry.data=Buffer.from(replaceRootBody(entry.data.toString('utf8'),'hdr',header),'utf8');headers++
    }
    if(/^word\/footer\d*\.xml$/i.test(entry.name)||entry.name==='word/iredFooter.xml'){
      entry.data=Buffer.from(replaceRootBody(entry.data.toString('utf8'),'ftr',footer),'utf8');footers++
    }
  }
  if(!headers||!footers)throw new Error('The prepared Word file is missing its header or footer section.')
  return zip(entries)
}

function safeFileName(name:string){return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'paper'}

export async function POST(request:Request){
  const cloned=request.clone()
  const input=await cloned.json().catch(()=>null) as {originalName?:string}|null
  const originalName=input?.originalName?.trim()||'paper.docx'
  const baseResponse=await prepareBaseWord(request)
  const basePayload=await baseResponse.json().catch(()=>null) as {articleId?:string;year?:number;volume?:number;issue?:number;downloadUrl?:string;[key:string]:unknown}|null
  if(!baseResponse.ok)return Response.json(basePayload||{error:'Could not prepare the GREEN Word file.'},{status:baseResponse.status})
  if(!basePayload?.articleId||!basePayload.year||!basePayload.volume||!basePayload.issue)return Response.json({error:'Prepared paper numbering could not be determined.'},{status:400})

  const articleId=basePayload.articleId,year=basePayload.year,volume=basePayload.volume,issue=basePayload.issue
  const stem=safeFileName(originalName.replace(/\.docx$/i,''))
  const processedPath=`${year}/${articleId}-${stem}.docx`
  const supabase=await createClient()

  try{
    const {data:file,error:downloadError}=await supabase.storage.from('green-manuscripts').download(processedPath)
    if(downloadError||!file)throw new Error(downloadError?.message||'Could not open the prepared Word file.')
    const updated=formatDocx(Buffer.from(await file.arrayBuffer()),articleId,volume,issue,year)
    const {error:updateError}=await supabase.storage.from('green-manuscripts').update(processedPath,new Blob([updated]),{contentType:DOCX_MIME})
    if(updateError)throw updateError
    const {data:signed,error:signedError}=await supabase.storage.from('green-manuscripts').createSignedUrl(processedPath,3600,{download:`${articleId}.docx`})
    if(signedError)throw signedError
    return Response.json({...basePayload,downloadUrl:signed?.signedUrl||basePayload.downloadUrl,headerStyle:'GREEN standard journal header'})
  }catch(error){
    await supabase.from('green_papers').delete().eq('article_id',articleId)
    await supabase.storage.from('green-manuscripts').remove([processedPath])
    return Response.json({error:error instanceof Error?error.message:'Could not apply the standard GREEN journal header.'},{status:400})
  }
}
