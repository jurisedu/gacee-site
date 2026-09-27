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

// 板块合并助手：平台已发布则覆盖静态字段（保留静态里平台没有的字段，如 hero.scroll）。
export function mergeSection<T extends Blob>(staticVal: T, platform?: Blob): T {
  return platform && Object.keys(platform).length ? ({ ...staticVal, ...platform } as T) : staticVal;
}
