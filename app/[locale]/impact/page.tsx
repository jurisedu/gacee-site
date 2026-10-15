import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import { relatedNews } from "@/lib/news";
import RelatedNews from "@/components/RelatedNews";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return pageSeo(((isLocale(locale) ? locale : "en") as Locale), "/impact", { title: t.nav.impact, description: t.impact.lede });
}

export default async function Impact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  // 公益页不放与公益无关的平台计数（证书、研学线路等）；改为展示公益讲座等真实报道
  const related = await relatedNews(l, "public-good");
  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <PageHead eyebrow={t.impact.eyebrow} title={t.impact.title} lede={t.impact.lede} />
      <section className="section">
        <div className="container card-grid">
          {t.impact.sections.map((s, i) => (
            <Reveal key={i} className={`card ${i === 1 ? "card--ink" : ""}`} delay={i * 80}><h3>{s.title}</h3><p>{s.body}</p></Reveal>
          ))}
        </div>
      </section>
      <RelatedNews l={l} items={related} title={t.programmes.related} more={t.programmes.relatedMore} />
      <section className="section section--white section--line">
        <div className="container two">
          <Reveal><div className="eyebrow">{t.impact.principlesTitle}</div></Reveal>
          <Reveal delay={100}>
            <ol className="steps">{t.impact.principles.map((s, i) => <li key={i}>{s}</li>)}</ol>
            <p style={{ marginTop: 32 }}><Link href={localizedPath(l, "/partners")} className="btn btn--primary">{t.impact.cta}</Link></p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
