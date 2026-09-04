import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.impact, description: t.impact.lede };
}

export default async function Impact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={t.impact.eyebrow} title={t.impact.title} lede={t.impact.lede} />
      <section className="section">
        <div className="container card-grid">
          {t.impact.sections.map((s, i) => (
            <Reveal key={i} className={`card ${i === 1 ? "card--ink" : ""}`} delay={i * 80}><h3>{s.title}</h3><p>{s.body}</p></Reveal>
          ))}
        </div>
      </section>
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
