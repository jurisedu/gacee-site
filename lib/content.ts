// 官网从协会平台（hub.gacee.org）拉取已发布内容（headless）。
// 区分三种结果：ok（有内容）/ empty（平台正常但没有已发布内容）/ unavailable（不可达或数据库未就绪）。
// 不可用时回退到站内已核实的静态资讯，并在页面上不把「读取失败」显示成「没有内容」。
import { type Locale } from "@/lib/i18n";

export type Cover = { url: string; alt?: string; credit?: string; license?: string; author?: string; sourceUrl?: string; width?: number; height?: number };
export type Article = {
  id: string;
  title: string;
  body?: unknown;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  contentLang?: "zh" | "en";
  category?: "association" | "coverage" | "industry" | "notice";
  sourceName?: string;
  sourceUrl?: string;
  cover?: Cover | null;
};

// 日期按协会所在地（新加坡）时区显示，避免 UTC 截取把当地凌晨的日期显示成前一天
export function sgDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso).slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

// 图片署名：署名/作者 + 许可（开放许可图片须标注作者与许可）
const LICENSE_LABEL: Record<string, string> = { "cc0": "CC0", "cc-by": "CC BY", "cc-by-sa": "CC BY-SA" };
export function creditLine(c?: { credit?: string; author?: string; license?: string } | null): string {
  if (!c) return "";
  const who = c.credit || c.author || "";
  const lic = c.license ? LICENSE_LABEL[c.license] : "";
  return [who, lic && !who.includes(lic) ? lic : ""].filter(Boolean).join(" · ");
}
export type Feed = { status: "ok" | "empty" | "unavailable"; items: Article[] };

const BASE = process.env.PLATFORM_CONTENT_API_URL ?? "https://hub.gacee.org";
const TOKEN = process.env.PLATFORM_CONTENT_API_TOKEN ?? "";
export const platformLocale = (l: Locale) => (l === "zh" ? "zh" : "en"); // 平台内容 zh/en；法文页面使用英文内容并标注

export async function fetchFeed(locale: Locale, limit = 12, id?: string): Promise<Feed> {
  try {
    const res = await fetch(`${BASE}/api/content?kind=article&locale=${platformLocale(locale)}&limit=${limit}${id ? `&id=${encodeURIComponent(id)}` : ""}`, {
      headers: TOKEN ? { authorization: `Bearer ${TOKEN}` } : {},
      next: { revalidate: 300 },
    });
    if (!res.ok) return { status: "unavailable", items: [] };
    const data = await res.json();
    if (data?.degraded) return { status: "unavailable", items: [] };
    const items = Array.isArray(data?.items) ? (data.items as Article[]) : [];
    return { status: items.length ? "ok" : "empty", items };
  } catch {
    return { status: "unavailable", items: [] };
  }
}

// 兼容旧调用：有内容返回数组，否则 null
export async function fetchArticles(locale: Locale, limit = 12): Promise<Article[] | null> {
  const f = await fetchFeed(locale, limit);
  return f.status === "ok" ? f.items : null;
}

// 文章实际语言与页面语言不同时，返回应写入 lang 属性的值
export function articleLang(a: Article, page: Locale): string | undefined {
  const actual = a.contentLang || platformLocale(page);
  const pageLang = page === "zh" ? "zh" : page;
  return actual === pageLang ? undefined : actual === "zh" ? "zh-Hans" : actual;
}
