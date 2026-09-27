// 官网从平台 hub.gacee.org 聚合内容 API 实时拉取（可编辑板块 + 真实 impact/events/news）。
// 平台不可达 / 未就绪 / 板块未发布 → 返回 null 或缺该板块,调用方回退自带静态字典。官网永远可用。
import { type Locale } from "@/lib/i18n";

export type Blob = Record<string, unknown>;
export type SiteEvent = { id: string | number; title?: string; time?: string; location?: string; summary?: string; mode?: string; status?: string };
export type SiteNews = { id: string | number; title?: string; body?: unknown; publishedAt?: string; author?: string };
export type SiteData = {
  sections: Record<string, Blob>;
  impact: Record<string, number> | null;
  events: SiteEvent[];
  news: SiteNews[];
  degraded?: boolean;
};

const BASE = process.env.PLATFORM_CONTENT_API_URL ?? "https://hub.gacee.org";

export type SiteMode = "live" | "coming_soon" | "maintenance";
// 站点模式（平台可控）。平台不可达/异常 → 默认 live（不因平台故障拦住官网）。ISR 60s。
export async function fetchSiteMode(): Promise<SiteMode> {
  try {
    const res = await fetch(`${BASE}/api/site-mode`, { next: { revalidate: 60 } });
    if (!res.ok) return "live";
    const d = await res.json();
    return d?.mode === "coming_soon" || d?.mode === "maintenance" ? d.mode : "live";
  } catch {
    return "live";
  }
}

export async function fetchSite(locale: Locale): Promise<SiteData | null> {
  try {
    const res = await fetch(`${BASE}/api/site?locale=${locale}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d || d.degraded) return null;
    return {
      sections: (d.sections as Record<string, Blob>) || {},
      impact: (d.impact as Record<string, number>) || null,
      events: Array.isArray(d.events) ? (d.events as SiteEvent[]) : [],
      news: Array.isArray(d.news) ? (d.news as SiteNews[]) : [],
    };
  } catch {
    return null;
  }
}

// 只保留平台的非空值（空串/空数组/undefined 不覆盖静态，避免部分填写把静态内容清空）。
function nonEmpty(platform?: Blob): Blob {
  const out: Blob = {};
  if (!platform) return out;
  for (const [k, v] of Object.entries(platform)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}

// 板块合并助手：平台已发布的非空字段覆盖静态（保留静态独有字段，如 hero.scroll）。
export function mergeSection<T extends Blob>(staticVal: T, platform?: Blob): T {
  const clean = nonEmpty(platform);
  return Object.keys(clean).length ? ({ ...staticVal, ...clean } as T) : staticVal;
}

// 详情正文：空行分段 → 段落数组；已是数组则原样。
function parseBody(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string" && v.trim()) return v.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return undefined;
}
// 关键信息：每行「标签: 值」（半/全角冒号）→ [{label,value}]；已是数组则原样。
function parseFacts(v: unknown): { label: string; value: string }[] | undefined {
  if (Array.isArray(v)) return v as { label: string; value: string }[];
  if (typeof v === "string" && v.trim()) {
    return v.split(/\n/).map((line) => {
      const m = line.split(/[:：]/);
      if (m.length < 2) return null;
      return { label: m[0].trim(), value: m.slice(1).join(":").trim() };
    }).filter((x): x is { label: string; value: string } => !!x && !!x.label);
  }
  return undefined;
}

// 每行「标题 | 说明」→ [{title,body}]；已是数组则原样；空/无效则 undefined（调用方回退静态）。
export function parsePairs(v: unknown): { title: string; body: string }[] | undefined {
  if (Array.isArray(v)) return v as { title: string; body: string }[];
  if (typeof v === "string" && v.trim()) {
    const out = v.split(/\n/).map((line) => {
      const i = line.indexOf("|");
      if (i < 0) return line.trim() ? { title: line.trim(), body: "" } : null;
      return { title: line.slice(0, i).trim(), body: line.slice(i + 1).trim() };
    }).filter((x): x is { title: string; body: string } => !!x && !!x.title);
    return out.length ? out : undefined;
  }
  return undefined;
}
// 每行一项 → [string]；已是数组则原样。
export function parseLines(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string" && v.trim()) {
    const out = v.split(/\n/).map((s) => s.trim()).filter(Boolean);
    return out.length ? out : undefined;
  }
  return undefined;
}

// 项目按 slug 合并：平台 items 的非空字段覆盖对应 slug 的静态内容；body/facts 由文本解析成数组；配图(art)保持静态。
export function mergeProgrammes<T extends Blob>(staticItems: Record<string, T>, platform?: Blob): Record<string, T> {
  const items = platform && Array.isArray((platform as { items?: unknown }).items) ? ((platform as { items: Blob[] }).items) : [];
  if (!items.length) return staticItems;
  const merged: Record<string, T> = { ...staticItems };
  for (const it of items) {
    const slug = typeof it.slug === "string" ? it.slug : "";
    if (!slug || !merged[slug]) continue;
    const clean = nonEmpty(it);
    const body = parseBody(clean.body); if (body && body.length) clean.body = body; else delete clean.body;
    const facts = parseFacts(clean.facts); if (facts && facts.length) clean.facts = facts; else delete clean.facts;
    merged[slug] = { ...merged[slug], ...clean };
  }
  return merged;
}
