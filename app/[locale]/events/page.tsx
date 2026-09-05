import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import { listEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.events, description: t.events.title };
}

export default async function Events({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const live = await listEvents().catch(() => []);
  const d = t.live;
  const fmt = (iso: string) => new Intl.DateTimeFormat(l === "zh" ? "zh-CN" : l === "fr" ? "fr-FR" : "en-GB", { timeZone: "Asia/Shanghai", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
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
          {live.length > 0 && <div className="evlist">
            {live.map((ev) => { const title = l === "zh" ? ev.title_zh : l === "fr" ? ev.title_fr || ev.title_en : ev.title_en; const body = l === "zh" ? ev.body_zh : l === "fr" ? ev.body_fr || ev.body_en : ev.body_en; return (
              <Link key={ev.slug} href={localizedPath(l, `/events/${ev.slug}`)} className="evcard">
                <div><div className="eyebrow eyebrow--gold">{ev.status === "live" ? d.live : ev.status === "closed" ? d.closed : d.open} · {fmt(ev.starts_at)} ({d.tz.beijing}){!ev.time_confirmed && ` · ${d.timeTba}`}</div><h3>{title}</h3><p>{body}</p></div>
                <span className="btn btn--primary">{ev.status === "closed" ? d.replayTitle : d.register} →</span>
              </Link>); })}
          </div>}
          <div className="eyebrow eyebrow--gold" style={{ marginBottom: 8 }}>{t.events.upcoming}</div>
          <List items={up} cta />
          <div className="eyebrow" style={{ margin: "64px 0 8px" }}>{t.events.past}</div>
          <List items={past} />
        </div>
      </section>
    </>
  );
}
