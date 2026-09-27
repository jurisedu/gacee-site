import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, type Locale } from "./lib/i18n";

/**
 * 站点模式门控（平台可控）：
 * 平台控制台设置 live / coming_soon / maintenance；本中间件读取 /api/site-mode 决定公众呈现。
 *   - live：正常展示完整官网
 *   - coming_soon：改写为「即将上线」页
 *   - maintenance：改写为「维护中」页
 * 以下主机始终绕过门控、访问完整站（内部验收）：localhost / 127.0.0.1 / *.vercel.app / preview.gacee.org
 * 平台不可达/超时 → 默认 live（不因平台故障拦住官网）。
 */
const BYPASS_HOSTS = new Set(["localhost", "127.0.0.1", "preview.gacee.org"]);
function isBypass(host: string): boolean {
  return BYPASS_HOSTS.has(host) || host.endsWith(".vercel.app");
}

const PLATFORM = process.env.PLATFORM_CONTENT_API_URL ?? "https://hub.gacee.org";
// 模块级缓存，避免每个请求都打平台（边缘实例复用期内约 60s 一次）。
let cachedMode = "live";
let cachedAt = 0;
async function siteMode(): Promise<string> {
  if (Date.now() - cachedAt < 60_000) return cachedMode;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 2000);
    const r = await fetch(`${PLATFORM}/api/site-mode`, { signal: ctl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (r.ok) { const d = await r.json(); cachedMode = d?.mode === "coming_soon" || d?.mode === "maintenance" ? d.mode : "live"; }
    else cachedMode = "live";
  } catch { cachedMode = "live"; }
  cachedAt = Date.now();
  return cachedMode;
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

export async function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const { pathname } = req.nextUrl;

  // 门控页自身放行，避免 rewrite 循环
  if (pathname === "/coming-soon" || pathname === "/maintenance") return NextResponse.next();

  // 非放行主机：按平台站点模式门控
  if (!isBypass(host)) {
    const mode = await siteMode();
    if (mode === "coming_soon" || mode === "maintenance") {
      const url = req.nextUrl.clone();
      url.pathname = mode === "maintenance" ? "/maintenance" : "/coming-soon";
      return NextResponse.rewrite(url);
    }
  }

  // 正常多语言路由
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
