import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import { fetchSite } from "@/lib/site";

// 实时数字标签（zh/en；fr 回退 en）
const LIVE_LABELS: Record<string, { zh: string; en: string }> = {
  members: { zh: "协会会员", en: "Members" },
  organizations: { zh: "成员机构", en: "Organizations" },
  certificates: { zh: "已签发证书", en: "Certificates issued" },
  eventsHeld: { zh: "已举办活动", en: "Events held" },
  studyTours: { zh: "研学线路", en: "Study tours" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.impact, description: t.impact.lede };
}

export default async function Impact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  // 平台真实数据实时数字（不可达则不显示这一条，其余静态内容照常）
  const site = await fetchSite(l);
  const live = site?.impact
    ? Object.keys(LIVE_LABELS).map((k) => ({ k, v: Number(site.impact![k] ?? 0), label: l === "zh" ? LIVE_LABELS[k].zh : LIVE_LABELS[k].en })).filter((x) => x.v > 0)
    : [];
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={t.impact.eyebrow} title={t.impact.title} lede={t.impact.lede} />
      {live.length ? (
        <section className="stats">
          <div className="container stats__grid">
            {live.map((s, i) => (
              <Reveal key={s.k} className="stat" delay={i * 80}>
                <div className="stat__value num">{s.v.toLocaleString()}</div>
                <div className="stat__label">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
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
