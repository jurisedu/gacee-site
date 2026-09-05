import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { getEvent } from "@/lib/db";
import Header from "@/components/Header";
import EventRegister from "@/components/EventRegister";
import TimeZones from "@/components/TimeZones";
import Arrow from "@/components/Arrow";

export const dynamic = "force-dynamic";

function pick(ev: { title_zh: string; title_en: string; title_fr: string; body_zh: string; body_en: string; body_fr: string }, l: Locale) {
  return l === "zh" ? { title: ev.title_zh, body: ev.body_zh } : l === "fr" ? { title: ev.title_fr || ev.title_en, body: ev.body_fr || ev.body_en } : { title: ev.title_en, body: ev.body_en };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const ev = await getEvent(slug);
  if (!ev) return {};
  const p = pick(ev, (isLocale(locale) ? locale : "en") as Locale);
  return { title: p.title, description: p.body.slice(0, 160) };
}

export default async function EventPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const ev = await getEvent(slug);
  if (!ev || ev.status === "hidden") notFound();
  const p = pick(ev, l);
  const d = t.live;
  const status = ev.status === "live" ? d.live : ev.status === "closed" ? d.closed : d.open;
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <section className="page-head">
        <div className="container">
          <Link href={localizedPath(l, "/events")} className="link"><span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><Arrow /></span> {t.nav.events}</Link>
          <div className="eyebrow eyebrow--gold" style={{ marginTop: 24 }}>{status} · {ev.host}</div>
          <h1 className="display">{p.title}</h1>
          <p className="lede">{p.body}</p>
        </div>
      </section>
      <section className="section">
        <div className="container two" style={{ gridTemplateColumns: "5fr 6fr" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{d.startsAt}</div>
            <TimeZones iso={ev.starts_at} labels={d.tz} yourTime={d.yourTime} locale={l} />
            {!ev.time_confirmed && <p className="small mute" style={{ marginTop: 8 }}>{d.timeTba}</p>}
            <dl className="kv" style={{ marginTop: 16 }}><dt>{d.duration}</dt><dd>{ev.duration_min} {d.minutes}</dd><dt>{d.host}</dt><dd>{ev.host}</dd></dl>
            <div className="eyebrow" style={{ margin: "28px 0 8px" }}>{d.howTo}</div>
            <ol className="steps">{d.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{d.register}</div>
            {ev.status === "closed" ? <p className="mute">{d.closed}</p> : <EventRegister slug={slug} locale={l} d={d} />}
          </div>
        </div>
      </section>
    </>
  );
}
