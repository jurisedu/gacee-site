// 新闻列表数据：平台已发布文章优先；平台不可用时回退站内已核实的静态资讯（并告知读者），平台正常但无文章时同样展示静态资讯。
import { getDictionary, type Locale } from "@/lib/i18n";
import { fetchFeed, articleLang, sgDate, type Article, type Cover } from "@/lib/content";

export type NewsItem = { id?: string; date: string; updated?: string; source: string; title: string; body: string; lang?: string; excerpt?: string; cover?: Cover | null; sourceUrl?: string; thirdParty?: boolean; category?: string };

export async function newsItems(l: Locale, limit = 12): Promise<{ items: NewsItem[]; unavailable: boolean }> {
  const t = getDictionary(l);
  const feed = await fetchFeed(l, limit);
  if (feed.status === "ok") {
    return {
      unavailable: false,
      items: feed.items.map((a) => toItem(a, l)),
    };
  }
  return { unavailable: feed.status === "unavailable", items: (t.news.items as NewsItem[]).slice(0, limit) };
}

function toItem(a: Article, l: Locale): NewsItem {
  return {
    id: String(a.id), date: sgDate(a.publishedAt), updated: a.updatedAt ? sgDate(a.updatedAt) : undefined,
    source: a.sourceName || "GACEE", title: a.title, body: typeof a.body === "string" ? a.body : "", lang: articleLang(a, l),
    excerpt: a.excerpt, cover: a.cover || null, sourceUrl: a.sourceUrl, thirdParty: a.category === "coverage" || a.category === "industry", category: a.category || "association",
  };
}

// 项目相关报道：按中文标题关键词匹配协会动态与媒体报道（不含行业资讯），工作人员新发布的文章自动归入。
// 匹配以中文版为准，再按 id 取当前语言版本（无译本时显示中文原文并标注语言）。
const RELATED: Record<string, string[]> = {
  "principals-tour": ["校长中国行", "河南卫视"],
  "composition-competition": ["作文大赛"],
  "study-tours": ["研学"],
  "principals-forum": ["校长论坛", "座谈"],
  "public-good": ["公益讲座", "公益"],
};

export async function relatedNews(l: Locale, key: string, limit = 6): Promise<NewsItem[]> {
  const kws = RELATED[key];
  if (!kws) return [];
  const zh = await fetchFeed("zh", 100);
  if (zh.status !== "ok") return [];
  const hits = zh.items.filter((a) => (a.category === "association" || a.category === "coverage" || !a.category) && kws.some((k) => (a.title || "").includes(k)));
  if (!hits.length) return [];
  const local = l === "zh" ? zh : await fetchFeed(l, 100);
  const byId = new Map((local.status === "ok" ? local.items : []).map((a) => [String(a.id), a]));
  return hits
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0, limit)
    .map((a) => { const loc = byId.get(String(a.id)); return loc ? toItem(loc, l) : toItem(a, l); });
}
