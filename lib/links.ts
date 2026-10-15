// 跳转到其它域名（数字门户 hub.gacee.org 等子域、第三方）的链接一律新窗口打开，不替换当前官网页面。
const SITE_HOSTS = new Set(["gacee.org", "www.gacee.org"]);

export function isExternal(href: string | undefined | null): boolean {
  if (!href || !/^https?:\/\//i.test(href)) return false;
  try { return !SITE_HOSTS.has(new URL(href).hostname.toLowerCase()); } catch { return false; }
}

/** 外部链接的 <a> 属性：新窗口 + 断开 opener。站内链接返回空对象。 */
export const extProps = (href: string | undefined | null) =>
  isExternal(href) ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : ({} as const);
