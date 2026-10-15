// 新闻列表数据：平台已发布文章优先；平台不可用时回退站内已核实的静态资讯（并告知读者），平台正常但无文章时同样展示静态资讯。
import { getDictionary, type Locale } from "@/lib/i18n";
import { fetchFeed, articleLang, sgDate, type Cover } from "@/lib/content";

export type NewsItem = { id?: string; date: string; updated?: string; source: string; title: string; body: string; lang?: string; excerpt?: string; cover?: Cover | null; sourceUrl?: string; thirdParty?: boolean; category?: string };

export async function newsItems(l: Locale, limit = 12): Promise<{ items: NewsItem[]; unavailable: boolean }> {
  const t = getDictionary(l);
  const feed = await fetchFeed(l, limit);
  if (feed.status === "ok") {
    return {
      unavailable: false,
      items: feed.items.map((a) => ({
        id: String(a.id), date: sgDate(a.publishedAt), updated: a.updatedAt ? sgDate(a.updatedAt) : undefined,
        source: a.sourceName || "GACEE", title: a.title, body: typeof a.body === "string" ? a.body : "", lang: articleLang(a, l),
        excerpt: a.excerpt, cover: a.cover || null, sourceUrl: a.sourceUrl, thirdParty: a.category === "coverage" || a.category === "industry", category: a.category || "association",
      })),
    };
  }
  return { unavailable: feed.status === "unavailable", items: (t.news.items as NewsItem[]).slice(0, limit) };
}
