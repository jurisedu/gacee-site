import type { Metadata } from "next";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.about, description: t.about.lede };
}

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={t.about.eyebrow} title={t.about.title} lede={t.about.lede} />
      <section className="section">
        <div className="container two">
          <Reveal>
            <div className="eyebrow">{t.about.missionTitle}</div>
            <p className="lede" style={{ marginTop: 14 }}>{t.about.mission}</p>
            <div className="eyebrow" style={{ marginTop: 40 }}>{t.about.visionTitle}</div>
            <p className="lede" style={{ marginTop: 14 }}>{t.about.vision}</p>
          </Reveal>
          <Reveal delay={100}>
            <div className="eyebrow" style={{ marginBottom: 20 }}>{t.about.valuesTitle}</div>
            <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {t.about.values.map((v, i) => (
                <div className={`card ${i === 0 ? "card--ink" : ""}`} key={i}><h3>{v.title}</h3><p>{v.body}</p></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section section--white section--line">
        <div className="container two">
          <Reveal><div className="eyebrow">{t.about.strategyTitle}</div><h2 className="display h2" style={{ marginTop: 14 }}>2026 – 2029</h2></Reveal>
          <Reveal delay={100}><ol className="steps">{t.about.strategy.map((s, i) => <li key={i}>{s}</li>)}</ol></Reveal>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal className="section__head"><div><div className="eyebrow">{t.about.structureTitle}</div></div></Reveal>
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {t.about.structure.map((s, i) => (
              <Reveal key={i} className={`card ${i === 3 ? "card--ink" : ""}`} delay={i * 80}><h3>{s.title}</h3><p>{s.body}</p></Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
