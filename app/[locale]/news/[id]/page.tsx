// 新闻详情：永久链接、发布与更新时间；文章语言与页面语言不同时标注原文语言。
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageSeo } from "@/lib/seo";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import { fetchFeed, articleLang } from "@/lib/content";
import { mdToHtml } from "@/lib/md";

async function load(l: Locale, id: string) {
  if (!/^\d+$/.test(id)) return null;
  const f = await fetchFeed(l, 1, id);
  return f.items[0] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const a = await load(l, id);
  if (!a) return { robots: { index: false } };
  return pageSeo(l, `/news/${id}`, { title: a.title, description: typeof a.body === "string" ? a.body.slice(0, 160) : undefined });
}

export default async function NewsArticle({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const a = await load(l, id);
  if (!a) notFound();
  const lang = articleLang(a, l);
  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <main className="section" style={{ paddingTop: 140 }}>
        <article className="container" style={{ maxWidth: 760 }} lang={lang}>
          <p className="small"><Link href={localizedPath(l, "/news")} lang={l === "zh" ? "zh-Hans" : l}>← {t.news.back}</Link></p>
          <h1 className="display h2">{a.title}</h1>
          <p className="small" lang={l === "zh" ? "zh-Hans" : l} style={{ opacity: 0.8 }}>
            <time dateTime={a.publishedAt}>{a.publishedAt ? String(a.publishedAt).slice(0, 10) : ""}</time>
            {a.updatedAt && a.updatedAt !== a.publishedAt ? <> · {t.news.updated} <time dateTime={a.updatedAt}>{String(a.updatedAt).slice(0, 10)}</time></> : null}
            {lang ? <> · {lang.startsWith("zh") ? t.news.originalZh : t.news.originalEn}</> : null}
          </p>
          <div className="md" dangerouslySetInnerHTML={{ __html: mdToHtml(typeof a.body === "string" ? a.body : "") }} />
        </article>
      </main>
    </>
  );
}
