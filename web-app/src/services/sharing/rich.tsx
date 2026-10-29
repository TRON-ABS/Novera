import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { ShareEntry } from '@/modules/conversations/share'

export const escapeXml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]!
  )
export const shareStyle = `body{font:16px system-ui,sans-serif;color:#202020;background:white;max-width:960px;margin:32px auto;padding:0 24px;line-height:1.6;overflow-wrap:anywhere}article{padding:16px 0;border-bottom:1px solid #ddd}h1,h2,h3{line-height:1.25;break-after:avoid}pre{padding:12px;background:#f3f4f6;white-space:pre-wrap;overflow-wrap:anywhere;font:13px ui-monospace,monospace}code{font-family:ui-monospace,monospace}table{border-collapse:collapse;max-width:100%}th,td{border:1px solid #bbb;padding:6px 10px;text-align:start}img,video{max-width:100%;height:auto}figure{margin:16px 0}figcaption{font-size:12px}blockquote{border-inline-start:3px solid #aaa;padding-inline-start:16px}a{color:#175f9e}math{font-size:1.1em}.role{font-size:12px;color:#555}.parameters{white-space:pre-wrap;font-size:12px}@media print{body{max-width:none;margin:0}video{display:none}img,table,figure{break-inside:avoid}a{color:inherit}}`

export function markdownImages(text: string): string[] {
  const urls: string[] = []
  renderToStaticMarkup(
    <ReactMarkdown
      skipHtml
      urlTransform={(url) => url}
      components={{
        img: ({ src }) => {
          if (
            typeof src === 'string' &&
            /^(https?:|data:image\/|blob:)/i.test(src)
          )
            urls.push(src)
          return null
        },
      }}
    >
      {text}
    </ReactMarkdown>
  )
  return [...new Set(urls)]
}

export function renderShareHtml(
  title: string,
  entries: ShareEntry[],
  media: Map<string, string>,
  labels: {
    user: string
    assistant: string
    sources: string
    parameters: string
  },
  sources: { title: string; url: string }[],
  parameters: unknown[]
): string {
  const articles = entries
    .map((entry) => {
      const markdown = renderToStaticMarkup(
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          skipHtml
          urlTransform={(url, key) =>
            /^(?:https?:|mailto:|#)/i.test(url) ||
            (key === 'src' && /^data:image\//.test(url))
              ? url
              : ''
          }
          components={{
            img: ({ alt, src }) =>
              typeof src === 'string' && media.get(src) ? (
                <img src={media.get(src)} alt={alt ?? ''} />
              ) : (
                <span>{alt}</span>
              ),
          }}
        >
          {entry.text}
        </ReactMarkdown>
      )
      const assets = entry.assets
        .filter((a) => !a.inline)
        .map((asset) => {
          const src = media.get(asset.id)
          if (src === '')
            return `<figure><figcaption>${escapeXml(asset.name)}</figcaption></figure>`
          if (!src) throw new Error('SHARE_MEDIA_MISSING')
          const tag = asset.mime.startsWith('audio/') ? 'audio' : 'video'
          return `<figure>${asset.mime.startsWith('image/') ? `<img src="${escapeXml(src)}" alt="${escapeXml(asset.name)}">` : `<${tag} controls preload="metadata" src="${escapeXml(src)}"></${tag}><p><a href="${escapeXml(src)}" download="${escapeXml(asset.name)}">${escapeXml(asset.name)}</a></p>`}<figcaption>${escapeXml(asset.name)}</figcaption></figure>`
        })
        .join('')
      return `<article data-message-id="${escapeXml(entry.id)}"><p class="role">${escapeXml(entry.role === 'user' ? labels.user : labels.assistant)}</p>${markdown}${assets}</article>`
    })
    .join('')
  const sourceHtml = sources.length
    ? `<section><h2>${escapeXml(labels.sources)}</h2><ul>${sources.map((s) => `<li><a href="${escapeXml(s.url)}">${escapeXml(s.title || s.url)}</a></li>`).join('')}</ul></section>`
    : ''
  const meta = parameters.length
    ? `<section><h2>${escapeXml(labels.parameters)}</h2><pre class="parameters">${escapeXml(JSON.stringify(parameters, null, 2))}</pre></section>`
    : ''
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; media-src data:; style-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escapeXml(title)}</title><style>${shareStyle}</style></head><body dir="auto"><h1>${escapeXml(title)}</h1>${articles}${sourceHtml}${meta}</body></html>`
  // Keep portable MathML rather than duplicate KaTeX's visual and accessibility
  // trees. No remote stylesheets, font downloads, scripts or event handlers.
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc
    .querySelectorAll('.katex-html,annotation')
    .forEach((node) => node.remove())
  return '<!doctype html>\n' + doc.documentElement.outerHTML
}
