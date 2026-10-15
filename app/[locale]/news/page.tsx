import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { newsItems } from "@/lib/news";
import { localizedPath } from "@/lib/i18n";
import { mdToHtml } from "@/lib/md";
import { creditLine } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return pageSeo(((isLocale(locale) ? locale : "en") as Locale), "/news", { title: t.nav.news, description: t.news.title });
}

export default async function News({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const sep = l === "zh" ? "：" : ": "; // 中文全角冒号，英法半角
  const { items, unavailable } = await newsItems(l, 40);
  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <PageHead eyebrow={t.news.eyebrow} title={t.news.title} />
      <section className="section">
        <div className="container news-list">
          {unavailable ? <p className="small" role="note" style={{ opacity: 1 }}>{t.news.unavailable}</p> : null}
          {items.map((n, i) => (
            <Reveal as="article" key={n.id || i} className="news-item" delay={i * 50}>
              <div><time dateTime={n.date}>{n.date}</time><div className="src">{n.thirdParty ? `${t.news.source}${sep}` : ""}{n.source}</div></div>
              <div lang={n.lang}>
                {n.cover ? (
                  <figure className={"news-cover" + (n.cover.width && n.cover.height && n.cover.height > n.cover.width ? " news-cover--portrait" : "")}>
                    <img src={n.cover.url} alt={n.cover.alt || n.title} loading="lazy" />
                    {creditLine(n.cover) ? <figcaption>{t.news.photo}{sep}{creditLine(n.cover)}</figcaption> : null}
                  </figure>
                ) : null}
                <h3>{n.id ? <Link href={localizedPath(l, `/news/${n.id}`)}>{n.title}</Link> : n.title}</h3>
                {n.lang ? <p className="small" lang={l === "zh" ? "zh-Hans" : l} style={{ opacity: 0.8 }}>{n.lang.startsWith("zh") ? t.news.originalZh : t.news.originalEn}</p> : null}
                {n.excerpt ? <p>{n.excerpt}</p> : <div className="md" dangerouslySetInnerHTML={{ __html: mdToHtml(n.body) }} />}
                {n.thirdParty && n.sourceUrl ? <p className="small"><a href={n.sourceUrl} target="_blank" rel="noopener noreferrer">{t.news.readOriginal} ↗</a></p> : null}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
