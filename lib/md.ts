// 极简安全 Markdown → HTML。先转义所有 HTML(杜绝注入),再套用受控的 Markdown 语法。
// 支持:## ### 标题、**粗** *斜* `代码`、``` 代码块、- / 1. 列表、> 引用、--- 分隔线、[文本](链接)、![alt](图)、段落。
// URL 仅允许 http(s)/mailto/相对路径(防 javascript: 等)。供编辑器预览与官网渲染共用。

const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safeUrl = (u: string) => {
  const t = u.trim();
  return /^(https?:\/\/|mailto:|\/|#|\.\/|\.\.\/)/i.test(t) ? t : "#";
};

// 行内:代码 → 图片 → 链接 → 粗 → 斜（在已转义文本上操作）。
function inline(s: string): string {
  let out = s;
  out = out.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => {
    const u = escHtml(safeUrl(url));
    return /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(url)
      ? `<video src="${u}" controls preload="metadata"${alt ? ` aria-label="${alt}"` : ""}></video>`
      : `<img src="${u}" alt="${alt}" loading="lazy" />`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, txt, url) => {
    const u = safeUrl(url);
    const ext = /^https?:\/\//i.test(u);
    return `<a href="${escHtml(u)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${txt}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return out;
}

export function mdToHtml(src: string): string {
  if (!src) return "";
  const lines = escHtml(src.replace(/\r\n?/g, "\n")).split("\n");
  const html: string[] = [];
  let i = 0;
  const closeP: string[] = []; // paragraph buffer
  const flushP = () => { if (closeP.length) { html.push(`<p>${inline(closeP.join(" "))}</p>`); closeP.length = 0; } };

  while (i < lines.length) {
    const line = lines[i];
    // 代码块 ```
    if (/^```/.test(line)) {
      flushP(); i++;
      const buf: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // 跳过结束 ```
      html.push(`<pre><code>${buf.join("\n")}</code></pre>`);
      continue;
    }
    // 分隔线
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) { flushP(); html.push("<hr />"); i++; continue; }
    // 标题
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { flushP(); const lv = Math.min(6, h[1].length + 1); html.push(`<h${lv}>${inline(h[2].trim())}</h${lv}>`); i++; continue; }
    // 引用
    if (/^>\s?/.test(line)) {
      flushP(); const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      html.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }
    // 无序列表
    if (/^\s*[-*+]\s+/.test(line)) {
      flushP(); const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\s*[-*+]\s+/, ""))}</li>`); i++; }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    // 有序列表
    if (/^\s*\d+\.\s+/.test(line)) {
      flushP(); const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`); i++; }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    // 空行 → 段落分隔
    if (/^\s*$/.test(line)) { flushP(); i++; continue; }
    // 普通行 → 段落缓冲
    closeP.push(line.trim()); i++;
  }
  flushP();
  return html.join("\n");
}

// 纯文本摘要（用于列表/SEO）：去 markdown 记号,截断。
export function mdExcerpt(src: string, n = 160): string {
  const plain = (src || "").replace(/[#>*`_~-]/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
  return plain.length > n ? plain.slice(0, n) + "…" : plain;
}
