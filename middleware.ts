import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, type Locale } from "./lib/i18n";

/**
 * 上线前临时屏蔽：
 * 主域（gacee.org 等）整站显示「即将上线」页；
 * 以下主机可绕过屏蔽、访问完整测试站：
 *   - localhost / 127.0.0.1（本地开发）
 *   - *.vercel.app（Vercel 部署域名）
 *   - preview.gacee.org（专用的隐藏预览域名，测试用）
 * 需要开放/关闭屏蔽时，改动此列表即可。
 */
const BYPASS_HOSTS = new Set(["localhost", "127.0.0.1", "preview.gacee.org"]);
function isBypass(host: string): boolean {
  return BYPASS_HOSTS.has(host) || host.endsWith(".vercel.app");
}

function pickLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get("gacee_lang")?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) return cookie as Locale;
  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase();
    if (tag.startsWith("zh")) return "zh";
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("en")) return "en";
  }
  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const { pathname } = req.nextUrl;

  // 「即将上线」页自身放行，避免 rewrite 循环
  if (pathname === "/coming-soon") return NextResponse.next();

  // 非放行主机：整站改写为「即将上线」（保留原始 URL）
  if (!isBypass(host)) {
    const url = req.nextUrl.clone();
    url.pathname = "/coming-soon";
    return NextResponse.rewrite(url);
  }

  // 放行主机：正常的多语言逻辑
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();
  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|internal|.*\\..*).*)"],
};
