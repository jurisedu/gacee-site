import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { programmeSlugs } from "@/lib/programmes";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import Arrow from "@/components/Arrow";
import ProgrammeArt from "@/components/ProgrammeArt";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.programmes, description: t.programmes.body };
}

export default async function Programmes({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const items = t.programmes.items as Record<string, { title: string; tagline: string; summary: string }>;
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={t.programmes.eyebrow} title={t.programmes.title} lede={t.programmes.body} />
      <section className="section">
        <div className="container prog-feature">
          {programmeSlugs.map((slug, i) => (
            <Reveal key={slug} delay={(i % 3) * 80}>
              <Link href={localizedPath(l, `/programmes/${slug}`)} className={`prog-card ${i === 0 ? "prog-card--ink" : ""}`}>
                <div className="prog-card__tag">{items[slug].tagline}</div>
                <h3>{items[slug].title}</h3>
                <p className="prog-card__sum">{items[slug].summary}</p>
                <ProgrammeArt slug={slug} />
                <div className="prog-card__foot"><span className="link" style={{ color: "inherit" }}>{t.programmes.learnMore} <Arrow /></span></div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
