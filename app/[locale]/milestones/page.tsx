import type { Metadata } from "next";
import Link from "next/link";
import { pageSeo } from "@/lib/seo";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import { fetchFeed, sgDate, articleLang } from "@/lib/content";

// 发展历程：由门户已发布的协会动态与媒体报道自动生成（按年份分组，均链接原条目），不另行编写。
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const l = (isLocale(locale) ? locale : "en") as Locale; const t = getDictionary(l);
  return pageSeo(l, "/milestones", { title: t.history.title, description: t.history.lede });
}

export default async function Milestones({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const h = t.history;
  const feed = await fetchFeed(l, 50);
  const items = feed.items
    .filter((a) => (a.category === "association" || a.category === "coverage") && a.publishedAt)
    .map((a) => ({ id: String(a.id), date: sgDate(a.publishedAt), title: a.title, lang: articleLang(a, l), source: a.category === "coverage" ? a.sourceName : undefined }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const years = Array.from(new Set(["2025", ...items.map((i) => i.date.slice(0, 4))])).sort();
  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <PageHead eyebrow={t.columns.aboutGov} title={h.title} lede={h.lede} />
      <section className="section">
        <div className="container timeline">
          {years.map((y) => (
            <div className="timeline__year" key={y}>
              <div className="timeline__label">{y}</div>
              <ol>
                {y === "2025" ? (
                  <Reveal as="li" className="timeline__item timeline__item--key">
                    <span className="timeline__date">2025</span>
                    <div><b>{h.founded}</b><p>{h.foundedNote}</p></div>
                  </Reveal>
                ) : null}
                {items.filter((i) => i.date.startsWith(y)).map((i, k) => (
                  <Reveal as="li" key={i.id} className="timeline__item" delay={Math.min(k, 6) * 40}>
                    <span className="timeline__date">{i.date.slice(5).replace("-", ".")}</span>
                    <div lang={i.lang}>
                      <Link href={localizedPath(l, `/news/${i.id}`)}>{i.title}</Link>
                      {i.source ? <p className="timeline__src">{i.source}</p> : null}
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          ))}
          {!items.length ? <p className="small">{h.empty}</p> : null}
        </div>
      </section>
    </>
  );
}
