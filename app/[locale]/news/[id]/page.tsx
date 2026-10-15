// 新闻详情：永久链接、发布与更新时间；文章语言与页面语言不同时标注原文语言。
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageSeo } from "@/lib/seo";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import { fetchFeed, articleLang, sgDate, creditLine } from "@/lib/content";
import { mdToHtml } from "@/lib/md";
import JsonLd, { SITE, ORG_ID } from "@/components/JsonLd";
import RelatedNews from "@/components/RelatedNews";
import { newsItems } from "@/lib/news";

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
  return pageSeo(l, `/news/${id}`, { title: a.title, description: a.excerpt || (typeof a.body === "string" ? a.body.slice(0, 160) : undefined) });
}

export default async function NewsArticle({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const sep = l === "zh" ? "：" : ": "; // 中文全角冒号，英法半角
  const a = await load(l, id);
  if (!a) notFound();
  const lang = articleLang(a, l);
  const thirdParty = a.category === "coverage" || a.category === "industry";
  // 上一篇 / 下一篇（按发布时间）与同栏目相关阅读
  const all = (await newsItems(l, 100)).items.filter((n) => n.id);
  const idx = all.findIndex((n) => n.id === String(a.id));
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const related = all.filter((n) => n.id !== String(a.id) && n.category === (a.category || "association")).slice(0, 3);
  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "NewsArticle", headline: a.title, datePublished: a.publishedAt, ...(a.updatedAt ? { dateModified: a.updatedAt } : {}),
        ...(a.cover?.url ? { image: [a.cover.url] } : {}), inLanguage: lang || (l === "zh" ? "zh-Hans" : l), mainEntityOfPage: `${SITE}${localizedPath(l, `/news/${id}`)}`,
        ...(thirdParty ? { author: { "@type": "Organization", name: a.sourceName || "—" }, isBasedOn: a.sourceUrl || undefined } : { author: { "@id": ORG_ID } }),
        publisher: { "@id": ORG_ID },
      }} />
      <main className="section" style={{ paddingTop: 140 }}>
        <article className="container" style={{ maxWidth: 760 }} lang={lang}>
          <p className="small"><Link href={localizedPath(l, "/news")} lang={l === "zh" ? "zh-Hans" : l}>← {t.news.back}</Link></p>
          <h1 className="display h2">{a.title}</h1>
          <p className="small" lang={l === "zh" ? "zh-Hans" : l} style={{ opacity: 0.8 }}>
            <time dateTime={a.publishedAt}>{sgDate(a.publishedAt)}</time>
            {a.sourceName ? <> · {t.news.source}{sep}{a.sourceName}</> : null}
            {lang ? <> · {lang.startsWith("zh") ? t.news.originalZh : t.news.originalEn}</> : null}
          </p>
          {a.cover ? (
            <figure className={"news-cover news-cover--lead" + (a.cover.width && a.cover.height && a.cover.height > a.cover.width ? " news-cover--portrait" : "")}>
              <img src={a.cover.url} alt={a.cover.alt || a.title} />
              {creditLine(a.cover) ? <figcaption>{t.news.photo}{sep}{a.cover.sourceUrl ? <a href={a.cover.sourceUrl} target="_blank" rel="noopener noreferrer">{creditLine(a.cover)}</a> : creditLine(a.cover)}</figcaption> : null}
            </figure>
          ) : null}
          {thirdParty ? <p className="small news-external" lang={l === "zh" ? "zh-Hans" : l}>{t.news.externalNote}</p> : null}
          <div className="md" dangerouslySetInnerHTML={{ __html: mdToHtml(typeof a.body === "string" ? a.body : "") }} />
          {a.sourceUrl ? (
            <p className="news-source" lang={l === "zh" ? "zh-Hans" : l}>
              {t.news.source}{sep}{a.sourceName || a.sourceUrl} · <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer">{t.news.readOriginal} ↗</a>
            </p>
          ) : null}
          {newer || older ? (
            <nav className="news-pager" aria-label={t.news.eyebrow}>
              {older ? <Link href={localizedPath(l, `/news/${older.id}`)} className="news-pager__item"><span>{t.news.older}</span><b lang={older.lang}>{older.title}</b></Link> : <span />}
              {newer ? <Link href={localizedPath(l, `/news/${newer.id}`)} className="news-pager__item news-pager__item--next"><span>{t.news.newer}</span><b lang={newer.lang}>{newer.title}</b></Link> : <span />}
            </nav>
          ) : null}
        </article>
      </main>
      <RelatedNews l={l} items={related} title={t.news.relatedReading} more={t.programmes.relatedMore} />
    </>
  );
}
