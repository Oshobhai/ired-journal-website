import { Buffer } from 'node:buffer'
import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const FIRST_VOLUME_YEAR = 2026

type ZipEntry = { name:string; data:Buffer; time:number; date:number }

function crc32(buf:Buffer){
  let c=0xffffffff
  for(const b of buf){
    c^=b
    for(let k=0;k<8;k++) c=(c>>>1)^((c&1)?0xedb88320:0)
  }
  return (c^0xffffffff)>>>0
}

function unzipDocx(buf:Buffer):ZipEntry[]{
  let eocd=-1
  for(let i=buf.length-22;i>=Math.max(0,buf.length-65557);i--){
    if(buf.readUInt32LE(i)===0x06054b50){eocd=i;break}
  }
  if(eocd<0) throw new Error('This Word file is not a valid DOCX package.')

  const count=buf.readUInt16LE(eocd+10)
  const centralOffset=buf.readUInt32LE(eocd+16)
  let p=centralOffset
  const entries:ZipEntry[]=[]

  for(let i=0;i<count;i++){
    if(buf.readUInt32LE(p)!==0x02014b50) throw new Error('Could not read the DOCX package.')
    const method=buf.readUInt16LE(p+10)
    const time=buf.readUInt16LE(p+12)
    const date=buf.readUInt16LE(p+14)
    const compressedSize=buf.readUInt32LE(p+20)
    const uncompressedSize=buf.readUInt32LE(p+24)
    const nameLength=buf.readUInt16LE(p+28)
    const extraLength=buf.readUInt16LE(p+30)
    const commentLength=buf.readUInt16LE(p+32)
    const localOffset=buf.readUInt32LE(p+42)
    const name=buf.subarray(p+46,p+46+nameLength).toString('utf8')

    if(buf.readUInt32LE(localOffset)!==0x04034b50) throw new Error('Could not read a DOCX file entry.')
    const localNameLength=buf.readUInt16LE(localOffset+26)
    const localExtraLength=buf.readUInt16LE(localOffset+28)
    const dataStart=localOffset+30+localNameLength+localExtraLength
    const compressed=buf.subarray(dataStart,dataStart+compressedSize)
    let data:Buffer
    if(method===0) data=Buffer.from(compressed)
    else if(method===8) data=inflateRawSync(compressed)
    else throw new Error(`Unsupported DOCX compression method in ${name}.`)
    if(data.length!==uncompressedSize) throw new Error(`Could not verify DOCX entry ${name}.`)

    entries.push({name,data,time,date})
    p+=46+nameLength+extraLength+commentLength
  }
  return entries
}

function zipDocx(entries:ZipEntry[]){
  const localParts:Buffer[]=[]
  const centralParts:Buffer[]=[]
  let offset=0

  for(const entry of entries){
    const name=Buffer.from(entry.name,'utf8')
    const isDir=entry.name.endsWith('/')
    const method=isDir?0:8
    const compressed=isDir?Buffer.alloc(0):deflateRawSync(entry.data,{level:6})
    const checksum=crc32(entry.data)

    const local=Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50,0)
    local.writeUInt16LE(20,4)
    local.writeUInt16LE(0x800,6)
    local.writeUInt16LE(method,8)
    local.writeUInt16LE(entry.time||0,10)
    local.writeUInt16LE(entry.date||0,12)
    local.writeUInt32LE(checksum,14)
    local.writeUInt32LE(compressed.length,18)
    local.writeUInt32LE(entry.data.length,22)
    local.writeUInt16LE(name.length,26)
    local.writeUInt16LE(0,28)
    localParts.push(local,name,compressed)

    const central=Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50,0)
    central.writeUInt16LE(20,4)
    central.writeUInt16LE(20,6)
    central.writeUInt16LE(0x800,8)
    central.writeUInt16LE(method,10)
    central.writeUInt16LE(entry.time||0,12)
    central.writeUInt16LE(entry.date||0,14)
    central.writeUInt32LE(checksum,16)
    central.writeUInt32LE(compressed.length,20)
    central.writeUInt32LE(entry.data.length,24)
    central.writeUInt16LE(name.length,28)
    central.writeUInt16LE(0,30)
    central.writeUInt16LE(0,32)
    central.writeUInt16LE(0,34)
    central.writeUInt16LE(0,36)
    central.writeUInt32LE(isDir?0x10:0,38)
    central.writeUInt32LE(offset,42)
    centralParts.push(central,name)

    offset+=local.length+name.length+compressed.length
  }

  const locals=Buffer.concat(localParts)
  const centralDirectory=Buffer.concat(centralParts)
  const end=Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50,0)
  end.writeUInt16LE(0,4)
  end.writeUInt16LE(0,6)
  end.writeUInt16LE(entries.length,8)
  end.writeUInt16LE(entries.length,10)
  end.writeUInt32LE(centralDirectory.length,12)
  end.writeUInt32LE(locals.length,16)
  end.writeUInt16LE(0,20)
  return Buffer.concat([locals,centralDirectory,end])
}

function xmlEscape(value:string){
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function decodeXml(value:string){
  return value.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&')
}

function paragraphs(documentXml:string){
  const list:string[]=[]
  const blocks=documentXml.match(/<w:p\b[\s\S]*?<\/w:p>/g)||[]
  for(const block of blocks){
    const runs=[...block.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m=>decodeXml(m[1]))
    const text=runs.join('').replace(/\s+/g,' ').trim()
    if(text) list.push(text)
  }
  return list
}

function extractPaperMetadata(documentXml:string){
  const lines=paragraphs(documentXml)
  const title=lines[0]||'Untitled GREEN Research Paper'
  const authors=lines[1]||'Author not detected'
  const affiliation=lines[2]||null
  const abstractIndex=lines.findIndex(x=>/^abstract\s*[:：]?$/i.test(x))
  const abstract=abstractIndex>=0?(lines[abstractIndex+1]||null):null
  const keywordLine=lines.find(x=>/^keywords?\s*[:：]/i.test(x))||''
  const keywords=keywordLine.replace(/^keywords?\s*[:：]\s*/i,'').split(',').map(x=>x.trim()).filter(Boolean)
  return {title,authors,affiliation,abstract,keywords}
}

function headerParagraph(text:string){
  return `<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="148444"/><w:sz w:val="17"/></w:rPr><w:t>${xmlEscape(text)}</w:t></w:r></w:p>`
}

function headerMarkup(volume:number,issue:number,month:string,year:number){
  return `<!-- IRED_GREEN_HEADER_META -->${headerParagraph('GREEN: The Research Journal')}${headerParagraph(`Volume ${volume} | Issue ${issue}`)}${headerParagraph(`${month} ${year}`)}<!-- /IRED_GREEN_HEADER_META -->`
}

function footerMarkup(articleId:string,volume:number,issue:number){
  return `<!-- IRED_GREEN_FOOTER_META --><w:p><w:pPr><w:jc w:val="center"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="148444"/></w:pBdr><w:spacing w:before="60" w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="526577"/></w:rPr><w:t>${xmlEscape(articleId)} | Volume ${volume} | Issue ${issue} | Page </w:t></w:r><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p><!-- /IRED_GREEN_FOOTER_META -->`
}

function replaceMarker(xml:string,marker:string){
  return xml.replace(new RegExp(`<!-- ${marker} -->[\\s\\S]*?<!-- \\/${marker} -->`,'g'),'')
}

function addBeforeClose(xml:string,closingTag:string,markup:string){
  return xml.replace(closingTag,`${markup}${closingTag}`)
}

function contentTypeOverride(xml:string,partName:string,contentType:string){
  if(xml.includes(`PartName="${partName}"`)) return xml
  return xml.replace('</Types>',`<Override PartName="${partName}" ContentType="${contentType}"/></Types>`)
}

function ensureRelationship(xml:string,id:string,type:string,target:string){
  xml=xml.replace(new RegExp(`<Relationship[^>]*Id="${id}"[^>]*/>`,'g'),'')
  return xml.replace('</Relationships>',`<Relationship Id="${id}" Type="${type}" Target="${target}"/></Relationships>`)
}

function standardHeaderXml(markup:string){
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${markup}</w:hdr>`
}

function standardFooterXml(markup:string){
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${markup}</w:ftr>`
}

function addReferences(documentXml:string,kind:'header'|'footer',relationshipId:string){
  const ref=`<w:${kind}Reference w:type="default" r:id="${relationshipId}"/><w:${kind}Reference w:type="first" r:id="${relationshipId}"/><w:${kind}Reference w:type="even" r:id="${relationshipId}"/>`
  return documentXml.replace(/(<w:sectPr\b[^>]*>)/g,`$1${ref}`)
}

function processWord(input:Buffer,articleId:string,volume:number,issue:number,month:string,year:number){
  const entries=unzipDocx(input)
  const map=new Map(entries.map(entry=>[entry.name,entry]))
  const documentEntry=map.get('word/document.xml')
  if(!documentEntry) throw new Error('The Word document body could not be found.')

  const header=headerMarkup(volume,issue,month,year)
  const footer=footerMarkup(articleId,volume,issue)
  const headerEntries=entries.filter(x=>/^word\/header\d*\.xml$/i.test(x.name))
  const footerEntries=entries.filter(x=>/^word\/footer\d*\.xml$/i.test(x.name))

  for(const entry of headerEntries){
    let xml=replaceMarker(entry.data.toString('utf8'),'IRED_GREEN_HEADER_META')
    xml=addBeforeClose(xml,'</w:hdr>',header)
    entry.data=Buffer.from(xml,'utf8')
  }

  for(const entry of footerEntries){
    let xml=replaceMarker(entry.data.toString('utf8'),'IRED_GREEN_FOOTER_META')
    xml=xml.replace(/<w:sdt\b[\s\S]*?<w:instrText[^>]*>\s*PAGE[\s\S]*?<\/w:sdt>/gi,'')
    xml=addBeforeClose(xml,'</w:ftr>',footer)
    entry.data=Buffer.from(xml,'utf8')
  }

  let documentXml=documentEntry.data.toString('utf8')
  let contentTypes=map.get('[Content_Types].xml')?.data.toString('utf8')||''
  let rels=map.get('word/_rels/document.xml.rels')?.data.toString('utf8')||'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>'

  if(!headerEntries.length){
    const headerName='word/iredHeader.xml'
    entries.push({name:headerName,data:Buffer.from(standardHeaderXml(header),'utf8'),time:0,date:0})
    contentTypes=contentTypeOverride(contentTypes,'/word/iredHeader.xml','application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml')
    rels=ensureRelationship(rels,'rIdIredGreenHeader','http://schemas.openxmlformats.org/officeDocument/2006/relationships/header','iredHeader.xml')
    documentXml=addReferences(documentXml,'header','rIdIredGreenHeader')
  }

  if(!footerEntries.length){
    const footerName='word/iredFooter.xml'
    entries.push({name:footerName,data:Buffer.from(standardFooterXml(footer),'utf8'),time:0,date:0})
    contentTypes=contentTypeOverride(contentTypes,'/word/iredFooter.xml','application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml')
    rels=ensureRelationship(rels,'rIdIredGreenFooter','http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer','iredFooter.xml')
    documentXml=addReferences(documentXml,'footer','rIdIredGreenFooter')
  }

  documentEntry.data=Buffer.from(documentXml,'utf8')
  const contentTypesEntry=map.get('[Content_Types].xml')
  if(contentTypesEntry) contentTypesEntry.data=Buffer.from(contentTypes,'utf8')
  const relEntry=map.get('word/_rels/document.xml.rels')
  if(relEntry) relEntry.data=Buffer.from(rels,'utf8')
  else entries.push({name:'word/_rels/document.xml.rels',data:Buffer.from(rels,'utf8'),time:0,date:0})

  return {buffer:zipDocx(entries),metadata:extractPaperMetadata(documentXml)}
}

function safeFileName(name:string){
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'paper.docx'
}

export async function POST(request:Request){
  const supabase=await createClient()
  const {data:{user},error:userError}=await supabase.auth.getUser()
  if(userError||!user) return Response.json({error:'Please sign in as an administrator.'},{status:401})

  const {data:access}=await supabase.from('admin_users').select('role').eq('user_id',user.id).maybeSingle()
  if(access?.role!=='admin') return Response.json({error:'Administrator access is required.'},{status:403})

  const payload=await request.json().catch(()=>null) as {sourcePath?:string;originalName?:string}|null
  const sourcePath=payload?.sourcePath?.trim()||''
  const originalName=payload?.originalName?.trim()||'paper.docx'
  if(!sourcePath.startsWith('incoming/')) return Response.json({error:'Invalid manuscript path.'},{status:400})

  try{
    const {data:source,error:downloadError}=await supabase.storage.from('green-manuscripts').download(sourcePath)
    if(downloadError||!source) throw new Error(downloadError?.message||'Could not read the uploaded Word file.')
    const sourceBuffer=Buffer.from(await source.arrayBuffer())
    if(sourceBuffer.length>25*1024*1024) throw new Error('Word file must be 25 MB or smaller.')

    const now=new Date()
    const indiaParts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',month:'long',year:'numeric'}).formatToParts(now)
    const month=indiaParts.find(x=>x.type==='month')?.value||'September'
    const year=Number(indiaParts.find(x=>x.type==='year')?.value)||now.getUTCFullYear()
    const volume=Math.max(1,year-FIRST_VOLUME_YEAR+1)

    const {data:existing,error:existingError}=await supabase.from('green_papers').select('article_id,issue').eq('publication_year',year)
    if(existingError) throw existingError
    let maxSequence=0
    let maxIssue=0
    for(const row of existing||[]){
      const match=String(row.article_id||'').match(new RegExp(`^GREEN-${year}-(\\d+)$`))
      if(match) maxSequence=Math.max(maxSequence,Number(match[1])||0)
      const issueNumber=Number.parseInt(String(row.issue||''),10)
      if(Number.isFinite(issueNumber)) maxIssue=Math.max(maxIssue,issueNumber)
    }
    const sequence=maxSequence+1
    const issue=maxIssue+1
    const articleId=`GREEN-${year}-${String(sequence).padStart(4,'0')}`

    const originalEntries=unzipDocx(sourceBuffer)
    const originalDocument=originalEntries.find(x=>x.name==='word/document.xml')
    if(!originalDocument) throw new Error('Could not read the Word document content.')
    const extracted=extractPaperMetadata(originalDocument.data.toString('utf8'))
    const processed=processWord(sourceBuffer,articleId,volume,issue,month,year)

    const processedPath=`${year}/${articleId}-${safeFileName(originalName.replace(/\.docx$/i,''))}.docx`
    const {error:uploadError}=await supabase.storage.from('green-manuscripts').upload(processedPath,processed.buffer,{contentType:DOCX_MIME,upsert:false})
    if(uploadError) throw uploadError

    const {error:insertError}=await supabase.from('green_papers').insert({
      article_id:articleId,
      title:extracted.title,
      authors:extracted.authors,
      affiliation:extracted.affiliation,
      abstract:extracted.abstract,
      keywords:extracted.keywords,
      publication_month:month,
      publication_year:year,
      volume:String(volume),
      issue:String(issue),
      source_docx_path:processedPath,
      pdf_path:`pending/${articleId}.pdf`,
      status:'draft',
      created_by:user.id,
    })
    if(insertError){
      await supabase.storage.from('green-manuscripts').remove([processedPath])
      throw insertError
    }

    await supabase.storage.from('green-manuscripts').remove([sourcePath])
    const {data:signed,error:signedError}=await supabase.storage.from('green-manuscripts').createSignedUrl(processedPath,3600,{download:`${articleId}.docx`})
    if(signedError) throw signedError

    return Response.json({
      articleId,
      title:extracted.title,
      authors:extracted.authors,
      affiliation:extracted.affiliation,
      month,
      year,
      volume,
      issue,
      downloadUrl:signed?.signedUrl||null,
    })
  }catch(error){
    await supabase.storage.from('green-manuscripts').remove([sourcePath])
    return Response.json({error:error instanceof Error?error.message:'Could not prepare the GREEN Word file.'},{status:400})
  }
}
