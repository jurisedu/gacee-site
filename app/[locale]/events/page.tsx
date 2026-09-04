import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.events, description: t.events.title };
}

export default async function Events({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const up = t.events.items.filter((e) => e.upcoming);
  const past = t.events.items.filter((e) => !e.upcoming);
  const List = ({ items, cta }: { items: typeof up; cta?: boolean }) => (
    <div>
      {items.map((e, i) => (
        <Reveal as="article" key={i} className="event" delay={i * 60}>
          <time>{e.date}</time>
          <div><h3>{e.title}</h3><div className="place">{e.place}</div><p>{e.body}</p></div>
          {cta ? <Link href={localizedPath(l, "/contact")} className="btn btn--ghost btn--sm">{t.events.register}</Link> : <span />}
        </Reveal>
      ))}
    </div>
  );
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={t.events.eyebrow} title={t.events.title} />
      <section className="section">
        <div className="container">
          <div className="eyebrow eyebrow--gold" style={{ marginBottom: 8 }}>{t.events.upcoming}</div>
          <List items={up} cta />
          <div className="eyebrow" style={{ margin: "64px 0 8px" }}>{t.events.past}</div>
          <List items={past} />
        </div>
      </section>
    </>
  );
}
