// 官网从协会平台（hub.gacee.org）拉取已发布内容（headless）。
// 平台未上线 / 不可达 / DB 未就绪时返回 null，调用方回退静态字典 —— 官网始终可用。
import { type Locale } from "@/lib/i18n";

export type Article = {
  id: string;
  title: string;
  body?: unknown; // 平台 textarea 为 string；二期富文本为 JSON
  publishedAt?: string;
  author?: string;
};

const BASE = process.env.PLATFORM_CONTENT_API_URL ?? "https://hub.gacee.org";
const TOKEN = process.env.PLATFORM_CONTENT_API_TOKEN ?? "";

export async function fetchArticles(locale: Locale, limit = 12): Promise<Article[] | null> {
  const l = locale === "zh" ? "zh" : "en"; // 平台内容目前 zh/en（fr 回退 en）
  try {
    const res = await fetch(
      `${BASE}/api/content?kind=article&locale=${l}&limit=${limit}`,
      {
        headers: TOKEN ? { authorization: `Bearer ${TOKEN}` } : {},
        next: { revalidate: 300 }, // 官网侧 ISR 缓存 5 分钟
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.degraded) return null; // 平台 DB 未就绪 → 用静态兜底
    return Array.isArray(data?.items) && data.items.length ? (data.items as Article[]) : null;
  } catch {
    return null; // 平台不可达 → 官网静态兜底
  }
}
