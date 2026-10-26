import { zipFiles } from './zip'
import { escapeXml as x } from './rich'

const utf8 = (s: string) => new TextEncoder().encode(s)
const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
type ZipEntry = { name: string; bytes: Uint8Array }
function dataBytes(uri: string) {
  const m = /^data:([^;,]+);base64,([\s\S]+)$/.exec(uri)
  if (!m) throw new Error('SHARE_MEDIA_MISSING')
  return {
    mime: m[1],
    bytes: Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0)),
  }
}
function mathWord(node: Node): string {
  if (node.nodeType === 3)
    return node.textContent?.trim()
      ? `<m:r><m:t>${x(node.textContent)}</m:t></m:r>`
      : ''
  const el = node as Element,
    children = Array.from(el.childNodes),
    child = (i: number) => (children[i] ? mathWord(children[i]) : '')
  if (el.tagName === 'annotation') return ''
  if (el.tagName === 'mfrac')
    return `<m:f><m:num>${child(0)}</m:num><m:den>${child(1)}</m:den></m:f>`
  if (el.tagName === 'msup' || el.tagName === 'msub') {
    const k = el.tagName === 'msup' ? 'sup' : 'sub'
    return `<m:s${k === 'sup' ? 'Sup' : 'Sub'}><m:e>${child(0)}</m:e><m:${k}>${child(1)}</m:${k}></m:s${k === 'sup' ? 'Sup' : 'Sub'}>`
  }
  if (el.tagName === 'msubsup')
    return `<m:sSubSup><m:e>${child(0)}</m:e><m:sub>${child(1)}</m:sub><m:sup>${child(2)}</m:sup></m:sSubSup>`
  if (el.tagName === 'msqrt')
    return `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${children.map(mathWord).join('')}</m:e></m:rad>`
  if (el.tagName === 'mtable')
    return `<m:m>${children
      .filter((n) => n.nodeType === 1)
      .map(
        (row) =>
          `<m:mr>${Array.from(row.childNodes)
            .filter((n) => n.nodeType === 1)
            .map((cell) => `<m:e>${mathWord(cell)}</m:e>`)
            .join('')}</m:mr>`
      )
      .join('')}</m:m>`
  return children.map(mathWord).join('')
}

/** Structured OOXML: paragraphs, tables, links, images and editable equations. */
export function wordDocument(html: string): Uint8Array {
  const doc = new DOMParser().parseFromString(html, 'text/html'),
    files: ZipEntry[] = []
  const rels: string[] = [],
    types = new Set<string>()
  let counter = 0
  const inline = (node: Node, style = ''): string => {
    if (node.nodeType === 3)
      return (node.textContent ?? '')
        .split(/(\n|\t)/)
        .map((part) =>
          part === '\n'
            ? '<w:r><w:br/></w:r>'
            : part === '\t'
              ? '<w:r><w:tab/></w:r>'
              : `<w:r>${style ? `<w:rPr>${style}</w:rPr>` : ''}<w:t xml:space="preserve">${x(part)}</w:t></w:r>`
        )
        .join('')
    const el = node as Element,
      tag = el.tagName?.toLowerCase()
    if (tag === 'math') return `<m:oMath>${mathWord(el)}</m:oMath>`
    if (tag === 'br') return '<w:r><w:br/></w:r>'
    if (tag === 'img') {
      const image = dataBytes(el.getAttribute('src') ?? ''),
        ext = image.mime.split('/')[1].replace('jpeg', 'jpg')
      if (!['png', 'jpg', 'gif', 'bmp', 'tiff', 'webp'].includes(ext))
        return `<w:r><w:t>${x(el.getAttribute('alt') ?? '')}</w:t></w:r>`
      const id = ++counter,
        name = `image${id}.${ext}`,
        rel = `rId${id}`
      files.push({ name: `word/media/${name}`, bytes: image.bytes })
      types.add(`${ext}|${image.mime}`)
      rels.push(
        `<Relationship Id="${rel}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${name}"/>`
      )
      const width = Number(el.getAttribute('width')) || 640,
        height = Number(el.getAttribute('height')) || 480
      const cx = Math.min(5486400, Math.round((8000000 * width) / height)),
        cy = Math.round((cx * height) / width)
      return `<w:r><w:drawing><wp:inline><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="${x(name)}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${id}" name="${x(name)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rel}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`
    }
    if (tag === 'a') {
      const href = el.getAttribute('href') ?? ''
      if (/^https?:|^mailto:/i.test(href)) {
        const rel = `rId${++counter}`
        rels.push(
          `<Relationship Id="${rel}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${x(href)}" TargetMode="External"/>`
        )
        return `<w:hyperlink r:id="${rel}">${Array.from(el.childNodes)
          .map((n) => inline(n, style))
          .join('')}</w:hyperlink>`
      }
    }
    const extra =
      tag === 'strong' || tag === 'b'
        ? '<w:b/>'
        : tag === 'em' || tag === 'i'
          ? '<w:i/>'
          : tag === 'code'
            ? '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'
            : ''
    return Array.from(el.childNodes)
      .map((n) => inline(n, style + extra))
      .join('')
  }
  const blocks = (node: Element): string =>
    Array.from(node.children)
      .map((el) => {
        const tag = el.tagName.toLowerCase()
        if (['article', 'section', 'figure', 'div', 'ul', 'ol'].includes(tag))
          return blocks(el)
        if (tag === 'video') return ''
        if (tag === 'table')
          return `<w:tbl><w:tblPr><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((side) => `<w:${side} w:val="single" w:sz="4"/>`).join('')}</w:tblBorders></w:tblPr>${Array.from(
            el.querySelectorAll('tr')
          )
            .map(
              (tr) =>
                `<w:tr>${Array.from(tr.children)
                  .map((td) => `<w:tc><w:p>${inline(td)}</w:p></w:tc>`)
                  .join('')}</w:tr>`
            )
            .join('')}</w:tbl>`
        const heading = /^h[1-6]$/.test(tag)
          ? `<w:pPr><w:pStyle w:val="Heading${tag[1]}"/></w:pPr>`
          : ''
        return `<w:p>${heading}${tag === 'li' ? '<w:r><w:t>• </w:t></w:r>' : ''}${inline(el)}</w:p>`
      })
      .join('')
  const body = blocks(doc.body)
  return zipFiles([
    {
      name: '[Content_Types].xml',
      bytes: utf8(
        `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>${[
          ...types,
        ]
          .map((t) => {
            const [ext, mime] = t.split('|')
            return `<Default Extension="${ext}" ContentType="${mime}"/>`
          })
          .join('')}</Types>`
      ),
    },
    {
      name: '_rels/.rels',
      bytes: utf8(
        `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
      ),
    },
    {
      name: 'word/document.xml',
      bytes: utf8(
        `${xml}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`
      ),
    },
    {
      name: 'word/_rels/document.xml.rels',
      bytes: utf8(
        `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${rels.join('')}</Relationships>`
      ),
    },
    {
      name: 'word/styles.xml',
      bytes: utf8(
        `${xml}<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr></w:style>${[1, 2, 3, 4, 5, 6].map((i) => `<w:style w:type="paragraph" w:styleId="Heading${i}"><w:name w:val="heading ${i}"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="${i - 1}"/></w:pPr><w:rPr><w:b/><w:sz w:val="${40 - i * 3}"/></w:rPr></w:style>`).join('')}</w:styles>`
      ),
    },
    ...files,
  ])
}

export function openDocument(html: string): Uint8Array {
  const doc = new DOMParser().parseFromString(html, 'text/html'),
    images: ZipEntry[] = []
  const objects: ZipEntry[] = [],
    objectFolders: string[] = []
  const walk = (node: Node): string => {
    if (node.nodeType === 3) return x(node.textContent ?? '')
    const el = node as Element,
      tag = el.tagName?.toLowerCase(),
      inner = () => Array.from(el.childNodes).map(walk).join('')
    if (tag === 'video') return ''
    if (tag === 'img') {
      const img = dataBytes(el.getAttribute('src') ?? ''),
        name = `Pictures/image${images.length}.${img.mime.split('/')[1]}`
      images.push({ name, bytes: img.bytes })
      const ratio =
          (Number(el.getAttribute('height')) || 480) /
          (Number(el.getAttribute('width')) || 640),
        w = Math.min(16, 24 / ratio)
      return `<draw:frame draw:name="Image${images.length}" svg:width="${w}cm" svg:height="${w * ratio}cm" text:anchor-type="as-char"><draw:image xlink:href="${name}" xlink:type="simple"/></draw:frame>`
    }
    if (tag === 'table') return `<table:table>${inner()}</table:table>`
    if (tag === 'tr') return `<table:table-row>${inner()}</table:table-row>`
    if (tag === 'td' || tag === 'th')
      return `<table:table-cell office:value-type="string"><text:p>${inner()}</text:p></table:table-cell>`
    if (tag === 'a' && /^https?:|^mailto:/i.test(el.getAttribute('href') ?? ''))
      return `<text:a xlink:href="${x(el.getAttribute('href')!)}">${inner()}</text:a>`
    if (tag === 'math') {
      const folder = `Object${objectFolders.length + 1}`
      objectFolders.push(folder)
      objects.push({
        name: `${folder}/content.xml`,
        bytes: utf8(xml + new XMLSerializer().serializeToString(el)),
      })
      return `<draw:frame svg:width="12cm" svg:height="1.5cm" text:anchor-type="as-char"><draw:object xlink:href="./${folder}" xlink:type="simple"/></draw:frame>`
    }
    if (tag === 'strong' || tag === 'b')
      return `<text:span text:style-name="Strong">${inner()}</text:span>`
    if (tag === 'em' || tag === 'i')
      return `<text:span text:style-name="Emphasis">${inner()}</text:span>`
    if (tag === 'pre')
      return `<text:p text:style-name="Code">${x(el.textContent ?? '')
        .replace(/ {2,}/g, (s) => `<text:s text:c="${s.length}"/>`)
        .replace(/\n/g, '<text:line-break/>')}</text:p>`
    if (tag === 'ul' || tag === 'ol')
      return `<text:list text:style-name="${tag === 'ul' ? 'Bullet' : 'Numbered'}">${inner()}</text:list>`
    if (tag === 'li')
      return `<text:list-item>${el.querySelector('p') ? inner() : `<text:p>${inner()}</text:p>`}</text:list-item>`
    if (['p', 'figcaption'].includes(tag)) return `<text:p>${inner()}</text:p>`
    if (/^h[1-6]$/.test(tag))
      return `<text:h text:outline-level="${tag[1]}">${inner()}</text:h>`
    if (tag === 'br') return '<text:line-break/>'
    return inner()
  }
  const content = `${xml}<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" office:version="1.2"><office:automatic-styles><style:style style:name="Strong" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style><style:style style:name="Emphasis" style:family="text"><style:text-properties fo:font-style="italic"/></style:style><style:style style:name="Code" style:family="paragraph"><style:text-properties fo:font-family="monospace"/></style:style><text:list-style style:name="Bullet"><text:list-level-style-bullet text:level="1" text:bullet-char="•"/></text:list-style><text:list-style style:name="Numbered"><text:list-level-style-number text:level="1" style:num-format="1"/></text:list-style></office:automatic-styles><office:body><office:text>${walk(doc.body)}</office:text></office:body></office:document-content>`
  return zipFiles([
    {
      name: 'mimetype',
      bytes: utf8('application/vnd.oasis.opendocument.text'),
    },
    { name: 'content.xml', bytes: utf8(content) },
    {
      name: 'META-INF/manifest.xml',
      bytes: utf8(
        `${xml}<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>${images.map((i) => `<manifest:file-entry manifest:full-path="${i.name}" manifest:media-type="image/${i.name.split('.').at(-1)}"/>`).join('')}${objectFolders.map((f) => `<manifest:file-entry manifest:full-path="${f}/" manifest:media-type="application/vnd.oasis.opendocument.formula"/><manifest:file-entry manifest:full-path="${f}/content.xml" manifest:media-type="text/xml"/>`).join('')}</manifest:manifest>`
      ),
    },
    ...images,
    ...objects,
  ])
}

export function epubDocument(html: string, title: string): Uint8Array {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const assets: ZipEntry[] = [],
    manifest: string[] = []
  const urls = new Map<string, string>()
  doc.querySelectorAll('[src],[href]').forEach((el) => {
    const attr = el.hasAttribute('src') ? 'src' : 'href',
      uri = el.getAttribute(attr) ?? ''
    if (!uri.startsWith('data:')) return
    let path = urls.get(uri)
    if (!path) {
      const data = dataBytes(uri),
        ext = data.mime.split('/')[1]?.replace('jpeg', 'jpg') || 'bin'
      path = `media/asset${assets.length}.${ext}`
      urls.set(uri, path)
      assets.push({ name: path, bytes: data.bytes })
      manifest.push(
        `<item id="media${assets.length}" href="${path}" media-type="${data.mime}"/>`
      )
    }
    el.setAttribute(attr, path)
  })
  doc.querySelectorAll('meta[http-equiv]').forEach((n) => n.remove())
  const content = new XMLSerializer().serializeToString(doc.documentElement)
  const properties = doc.querySelector('math') ? ' properties="mathml"' : ''
  return zipFiles([
    { name: 'mimetype', bytes: utf8('application/epub+zip') },
    {
      name: 'META-INF/container.xml',
      bytes: utf8(
        `${xml}<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`
      ),
    },
    {
      name: 'content.opf',
      bytes: utf8(
        `${xml}<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:uuid:${crypto.randomUUID()}</dc:identifier><dc:title>${x(title)}</dc:title><dc:language>und</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta></metadata><manifest><item id="page" href="index.xhtml" media-type="application/xhtml+xml"${properties}/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${manifest.join('')}</manifest><spine><itemref idref="page"/></spine></package>`
      ),
    },
    { name: 'index.xhtml', bytes: utf8(content) },
    {
      name: 'nav.xhtml',
      bytes: utf8(
        `${xml}<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>${x(title)}</title></head><body><nav epub:type="toc"><ol><li><a href="index.xhtml">${x(title)}</a></li></ol></nav></body></html>`
      ),
    },
    ...assets,
  ])
}

export function rtfDocument(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const escape = (s: string) =>
    Array.from({ length: s.length }, (_, i) => {
      const c = s.charCodeAt(i)
      return c > 127
        ? `\\u${c > 32767 ? c - 65536 : c}?`
        : s[i].replace(/[\\{}]/g, '\\$&')
    }).join('')
  const walk = (node: Node): string => {
    if (node.nodeType === 3) return escape(node.textContent ?? '')
    const el = node as Element,
      tag = el.tagName?.toLowerCase(),
      value = () => Array.from(el.childNodes).map(walk).join('')
    if (tag === 'img') {
      const image = dataBytes(el.getAttribute('src') ?? '')
      if (!['image/png', 'image/jpeg'].includes(image.mime))
        return escape(el.getAttribute('alt') ?? '')
      const width = Number(el.getAttribute('width')) || 640,
        height = Number(el.getAttribute('height')) || 480,
        goal = Math.min(9000, Math.round((13000 * width) / height))
      return `{\\pict${image.mime === 'image/png' ? '\\pngblip' : '\\jpegblip'}\\picw${width}\\pich${height}\\picwgoal${goal}\\pichgoal${Math.round((goal * height) / width)} ${Array.from(image.bytes, (b) => b.toString(16).padStart(2, '0')).join('')}}`
    }
    if (tag === 'video') return ''
    if (['strong', 'b'].includes(tag)) return `{\\b ${value()}}`
    if (['em', 'i'].includes(tag)) return `{\\i ${value()}}`
    if (tag === 'br') return '\\line '
    if (tag === 'pre')
      return `{\\f1 ${escape(el.textContent ?? '')
        .replace(/\n/g, '\\line\n')
        .replace(/\t/g, '\\tab ')} }\\par\n`
    if (tag === 'tr')
      return `{\\trowd ${Array.from(el.children, (_, i) => `\\cellx${Math.floor(9000 / el.children.length) * (i + 1)}`).join('')} ${Array.from(el.children, (cell) => '\\intbl ' + walk(cell) + '\\cell ').join('')}\\row }`
    if (tag === 'td' || tag === 'th') return value()
    if (['p', 'pre', 'li', 'tr', 'h1', 'h2', 'h3', 'figcaption'].includes(tag))
      return value() + '\\par\n'
    return value()
  }
  return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}{\\f1 Consolas;}}\\uc1\\fs22 ${walk(doc.body)}}`
}
