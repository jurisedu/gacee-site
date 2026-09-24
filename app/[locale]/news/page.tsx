import type { Metadata } from "next";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import { fetchArticles } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.news, description: t.news.title };
}

export default async function News({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  // 优先拉协会平台已发布文章（headless）；平台未上线 / 不可达则回退静态字典
  const live = await fetchArticles(l);
  const items = live
    ? live.map((a) => ({
        date: a.publishedAt ? String(a.publishedAt).slice(0, 10) : "",
        source: a.author ?? "GACEE",
        title: a.title,
        body: typeof a.body === "string" ? a.body : "",
      }))
    : t.news.items;
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={t.news.eyebrow} title={t.news.title} />
      <section className="section">
        <div className="container news-list">
          {items.map((n, i) => (
            <Reveal as="article" key={i} className="news-item" delay={i * 50}>
              <div><time dateTime={n.date}>{n.date}</time><div className="src">{n.source}</div></div>
              <div><h3>{n.title}</h3><p>{n.body}</p></div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
