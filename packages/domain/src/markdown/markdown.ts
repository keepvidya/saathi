/** Minimal, XSS-safe Markdown → HTML. Escapes everything first; no raw HTML passthrough.
 *  Supports: # / ## headings, - / * lists, ``` fenced code, `inline code`, **bold**, *italic*,
 *  [text](url) links (http(s)/relative only). A markdown-it swap can hide behind this later. */

const escapeHtml = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

const SAFE_URL = /^(https?:\/\/|\/|#)/

function inline(escaped: string): string {
  return escaped
    .replace(/`([^`]+)`/g, (_, c: string) => `<code>${c}</code>`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, url: string) =>
      SAFE_URL.test(url) ? `<a href="${url}">${text}</a>` : text,
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let inList = false
  const closeList = (): void => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (/^```/.test(line)) {
      closeList()
      const code: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i])
        i++
      }
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    const heading = /^(#{1,2})\s+(.*)$/.exec(line)
    if (heading) {
      closeList()
      const lvl = heading[1].length
      out.push(`<h${lvl}>${inline(escapeHtml(heading[2]))}</h${lvl}>`)
      continue
    }

    const item = /^[-*]\s+(.*)$/.exec(line)
    if (item) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${inline(escapeHtml(item[1]))}</li>`)
      continue
    }

    if (line.trim() === '') {
      closeList()
      continue
    }

    closeList()
    out.push(`<p>${inline(escapeHtml(line))}</p>`)
  }

  closeList()
  return out.join('')
}
