import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { getEvent } from "@/lib/db";
import Header from "@/components/Header";
import EventRegister from "@/components/EventRegister";
import TimeZones from "@/components/TimeZones";
import Arrow from "@/components/Arrow";
import JsonLd, { SITE, ORG_ID } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

function pick(ev: { title_zh: string; title_en: string; title_fr: string; body_zh: string; body_en: string; body_fr: string }, l: Locale) {
  return l === "zh" ? { title: ev.title_zh, body: ev.body_zh } : l === "fr" ? { title: ev.title_fr || ev.title_en, body: ev.body_fr || ev.body_en } : { title: ev.title_en, body: ev.body_en };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const ev = await getEvent(slug);
  if (!ev) return {};
  const p = pick(ev, (isLocale(locale) ? locale : "en") as Locale);
  return pageSeo(((isLocale(locale) ? locale : "en") as Locale), `/events/${slug}`, { title: p.title, description: p.body.slice(0, 160) });
}

export default async function EventPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const ev = await getEvent(slug);
  if (!ev || ev.status === "hidden") notFound();
  // 开始已逾 3 小时仍未手动关闭的活动，按已结束处理（停止报名，显示回放）
  if (ev.status !== "closed" && new Date(ev.starts_at).getTime() < Date.now() - 3 * 3600_000) ev.status = "closed";
  const p = pick(ev, l);
  const d = t.live;
  const status = ev.status === "live" ? d.live : ev.status === "closed" ? d.closed : d.open;
  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Event", name: p.title, description: p.body, startDate: ev.starts_at,
        ...(ev.ends_at ? { endDate: ev.ends_at } : {}), eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode", eventStatus: "https://schema.org/EventScheduled",
        location: { "@type": "VirtualLocation", url: `${SITE}${localizedPath(l, `/events/${slug}`)}` }, organizer: { "@id": ORG_ID }, inLanguage: l === "zh" ? "zh-Hans" : l,
      }} />
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
            {!ev.time_confirmed && ev.status !== "closed" && <p className="small mute" style={{ marginTop: 8 }}>{d.timeTba}</p>}
            <dl className="kv" style={{ marginTop: 16 }}><dt>{d.duration}</dt><dd>{ev.duration_min} {d.minutes}</dd><dt>{d.host}</dt><dd>{ev.host}</dd></dl>
            {ev.status !== "closed" ? (<>
              <div className="eyebrow" style={{ margin: "28px 0 8px" }}>{d.howTo}</div>
              <ol className="steps">{d.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </>) : null}
          </div>
          <div>
            {ev.status === "closed" ? (
              /* 已结束：不再出现进入指引；回放只对报名者开放，经各自专属链接观看 */
              <div className="ended-note">
                <div className="eyebrow" style={{ marginBottom: 12 }}>{d.closed}</div>
                <p>{d.endedNote}</p>
                <p style={{ marginTop: 20 }}><Link href={localizedPath(l, "/events")} className="btn btn--ghost btn--sm">{d.moreEvents} →</Link></p>
              </div>
            ) : (<>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{d.register}</div>
              <EventRegister slug={slug} locale={l} d={d} />
            </>)}
          </div>
        </div>
      </section>
    </>
  );
}
