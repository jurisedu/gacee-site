// 新闻列表数据：平台已发布文章优先；平台不可用时回退站内已核实的静态资讯（并告知读者），平台正常但无文章时同样展示静态资讯。
import { getDictionary, type Locale } from "@/lib/i18n";
import { fetchFeed, articleLang } from "@/lib/content";

export type NewsItem = { id?: string; date: string; updated?: string; source: string; title: string; body: string; lang?: string };

export async function newsItems(l: Locale, limit = 12): Promise<{ items: NewsItem[]; unavailable: boolean }> {
  const t = getDictionary(l);
  const feed = await fetchFeed(l, limit);
  if (feed.status === "ok") {
    return {
      unavailable: false,
      items: feed.items.map((a) => ({
        id: String(a.id), date: a.publishedAt ? String(a.publishedAt).slice(0, 10) : "", updated: a.updatedAt ? String(a.updatedAt).slice(0, 10) : undefined,
        source: a.author ?? "GACEE", title: a.title, body: typeof a.body === "string" ? a.body : "", lang: articleLang(a, l),
      })),
    };
  }
  return { unavailable: feed.status === "unavailable", items: (t.news.items as NewsItem[]).slice(0, limit) };
}
