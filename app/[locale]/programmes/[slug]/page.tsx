import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, locales, localizedPath, type Locale } from "@/lib/i18n";
import { programmeSlugs, type ProgrammeSlug } from "@/lib/programmes";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";
import Arrow from "@/components/Arrow";
import ProgrammeArt from "@/components/ProgrammeArt";

type Item = { title: string; tagline: string; summary: string; body: string[]; facts: { label: string; value: string }[] };

export function generateStaticParams() {
  return locales.flatMap((locale) => programmeSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  const item = (t.programmes.items as Record<string, Item>)[slug];
  return item ? { title: item.title, description: item.summary } : {};
}

export default async function Programme({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  if (!(programmeSlugs as readonly string[]).includes(slug)) notFound();
  const t = getDictionary(l);
  const items = t.programmes.items as Record<string, Item>;
  const item = items[slug];
  const idx = programmeSlugs.indexOf(slug as ProgrammeSlug);
  const next = programmeSlugs[(idx + 1) % programmeSlugs.length];
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <section className="page-head">
        <div className="container">
          <Link href={localizedPath(l, "/programmes")} className="link" style={{ marginBottom: 28 }}><span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><Arrow /></span> {t.programmes.backToAll}</Link>
          <div className="eyebrow eyebrow--gold" style={{ marginTop: 24 }}>{item.tagline}</div>
          <h1 className="display">{item.title}</h1>
          <p className="lede">{item.summary}</p>
        </div>
      </section>
      <section className="section">
        <div className="container two" style={{ gridTemplateColumns: "7fr 4fr" }}>
          <Reveal className="prose">{item.body.map((para, i) => <p key={i}>{para}</p>)}</Reveal>
          <Reveal delay={100}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>{t.programmes.factsTitle}</div>
            <div className="facts"><dl>{item.facts.map((f, i) => <div key={i}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl></div>
            <div style={{ color: "var(--blue)", marginTop: 40 }}><ProgrammeArt slug={slug} className="" /></div>
            <p style={{ marginTop: 32 }}><Link href={localizedPath(l, "/partners")} className="btn btn--primary">{t.hero.cta2}</Link></p>
          </Reveal>
        </div>
      </section>
      <section className="section--tight section--white section--line">
        <div className="container">
          <Link href={localizedPath(l, `/programmes/${next}`)} className="prog-row" style={{ borderBottom: 0 }}>
            <span className="prog-row__n">→</span>
            <h3>{items[next].title}</h3>
            <p>{items[next].tagline}</p>
            <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
