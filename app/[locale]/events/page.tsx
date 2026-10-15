import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import { listEvents } from "@/lib/db";
import { fetchSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return pageSeo(((isLocale(locale) ? locale : "en") as Locale), "/events", { title: t.nav.events, description: t.events.title });
}

export default async function Events({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const live = await listEvents().catch(() => []);
  const site = await fetchSite(l);
  const platEvents = (site?.events || []).filter((e) => e.title);
  const d = t.live;
  const fmt = (iso: string) => new Intl.DateTimeFormat(l === "zh" ? "zh-CN" : l === "fr" ? "fr-FR" : "en-GB", { timeZone: "Asia/Shanghai", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
  // 门户真实活动为主（可报名）；静态条目只保留门户中没有的（按标题去重）；门户不可用时回退完整静态列表
  const HUB = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";
  const norm = (x: string) => x.replace(/[\s·：:、，,（）()]/g, "");
  const platTitles = platEvents.map((e) => norm(String(e.title)));
  const dup = (title: string) => platTitles.some((pt) => pt.includes(norm(title)) || norm(title).includes(pt));
  const nowMs = Date.now();
  const platUp = platEvents.filter((e) => !e.time || new Date(String(e.time)).getTime() >= nowMs);
  const platPast = platEvents.filter((e) => e.time && new Date(String(e.time)).getTime() < nowMs).sort((a, b) => String(b.time).localeCompare(String(a.time)));
  const day = (iso: string) => new Intl.DateTimeFormat(l === "zh" ? "zh-CN" : l === "fr" ? "fr-FR" : "en-GB", { timeZone: "Asia/Singapore", year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
  const ev = t.events as typeof t.events & { tbd?: string; details?: string; planning?: string };
  const up = t.events.items.filter((e) => e.upcoming && !(platEvents.length && dup(e.title)));
  const past = t.events.items.filter((e) => !e.upcoming && !(platEvents.length && dup(e.title)));
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
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <PageHead eyebrow={t.events.eyebrow} title={t.events.title} />
      <section className="section">
        <div className="container">
          {live.length > 0 && <div className="evlist">
            {live.map((ev0) => { const ev = { ...ev0, status: ev0.status !== "closed" && new Date(ev0.starts_at).getTime() < Date.now() - 3 * 3600_000 ? "closed" : ev0.status }; /* 开始已逾 3 小时视为已结束 */ const title = l === "zh" ? ev.title_zh : l === "fr" ? ev.title_fr || ev.title_en : ev.title_en; const body = l === "zh" ? ev.body_zh : l === "fr" ? ev.body_fr || ev.body_en : ev.body_en; return (
              <Link key={ev.slug} href={localizedPath(l, `/events/${ev.slug}`)} className="evcard">
                <div><div className="eyebrow eyebrow--gold">{ev.status === "live" ? d.live : ev.status === "closed" ? d.closed : d.open} · {fmt(ev.starts_at)} ({d.tz.beijing}){!ev.time_confirmed && ` · ${d.timeTba}`}</div><h3>{title}</h3><p>{body}</p></div>
                <span className="btn btn--primary">{ev.status === "closed" ? d.replayTitle : d.register} →</span>
              </Link>); })}
          </div>}
          {platEvents.length > 0 ? (
            <>
              {platUp.length ? <div className="eyebrow eyebrow--gold" style={{ marginBottom: 8 }}>{t.events.upcoming}</div> : null}
              {platUp.map((e, i) => (
                <Reveal as="article" key={e.id} className="event" delay={i * 60}>
                  <time>{e.time ? day(String(e.time)) : ev.tbd || t.events.tba}</time>
                  <div><h3>{e.title}</h3>{e.mode || e.location ? <div className="place">{e.mode || e.location}</div> : null}{e.summary ? <p>{e.summary}</p> : null}</div>
                  <a href={`${HUB}/events/${e.id}?lang=${l}`} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">{t.events.register}</a>
                </Reveal>
              ))}
              {up.length ? <div className="eyebrow" style={{ margin: "48px 0 8px" }}>{ev.planning || t.events.upcoming}</div> : null}
              <List items={up} cta />
              {platPast.length || past.length ? <div className="eyebrow" style={{ margin: "64px 0 8px" }}>{t.events.past}</div> : null}
              {platPast.map((e, i) => (
                <Reveal as="article" key={e.id} className="event" delay={i * 60}>
                  <time>{day(String(e.time))}</time>
                  <div><h3>{e.title}</h3>{e.mode || e.location ? <div className="place">{e.mode || e.location}</div> : null}{e.summary ? <p>{e.summary}</p> : null}</div>
                  <a href={`${HUB}/events/${e.id}?lang=${l}`} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">{ev.details || "→"}</a>
                </Reveal>
              ))}
              <List items={past} />
            </>
          ) : (
            <>
          <div className="eyebrow eyebrow--gold" style={{ marginBottom: 8 }}>{t.events.upcoming}</div>
          <List items={up} cta />
          <div className="eyebrow" style={{ margin: "64px 0 8px" }}>{t.events.past}</div>
          <List items={past} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
