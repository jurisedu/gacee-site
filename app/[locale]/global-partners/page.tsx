import type { Metadata } from "next";
import Link from "next/link";
import { pageSeo } from "@/lib/seo";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import { fetchSite, mergeSection } from "@/lib/site";

// 全球伙伴：协会伙伴网络（六类伙伴、覆盖地区）与项目历年覆盖情况。
// 文案与首页「全球网络」区块同源，门户「官网内容」修改后两处同步；统计数字附口径说明，不另造数字。
export const revalidate = 300;

const HUB = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const l = (isLocale(locale) ? locale : "en") as Locale; const t = getDictionary(l);
  return pageSeo(l, "/global-partners", { title: t.columns.globalPartners, description: t.network.body });
}

export default async function GlobalPartners({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const site = await fetchSite(l);
  const network = mergeSection(t.network, site?.sections?.network);
  const statsItems = site?.sections?.stats?.items;
  const stats = (Array.isArray(statsItems) ? statsItems : t.stats) as typeof t.stats;
  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <PageHead eyebrow={t.columns.globalPartners} title={network.title} lede={network.body} />

      <section className="stats">
        <div className="container stats__grid">
          {stats.map((s, i) => (
            <Reveal key={i} className="stat" delay={i * 80}>
              <div className="stat__value num">{s.value}</div>
              <div className="stat__label">{s.label}</div>
            </Reveal>
          ))}
        </div>
        <div className="container"><p className="small stats__note" style={{ opacity: 0.85, marginTop: 12 }}>{t.statsNote}</p></div>
      </section>

      <section className="section section--white section--line">
        <div className="container">
          <Reveal className="section__head">
            <div><div className="eyebrow">{t.columns.partnerNetwork}</div><h2 className="display h2">{t.columns.globalPartners}</h2></div>
          </Reveal>
          <div className="net">
            {network.items.map((it, i) => (
              <Reveal key={i} className="net__item" delay={i * 60}>
                <span className="net__n">0{i + 1}</span>
                <div><h3>{it.title}</h3><p>{it.body}</p></div>
              </Reveal>
            ))}
          </div>
          <ul className="regions">{network.regions.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section__head">
            <div><div className="eyebrow">{t.columns.participate}</div><h2 className="display h2">{t.partners.title}</h2></div>
            <p>{t.partners.lede}</p>
          </Reveal>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href={localizedPath(l, "/partners")} className="btn">{t.columns.apply}</Link>
            <a href={`${HUB}/login?lang=${l}`} className="btn btn--ghost">{t.columns.portal}</a>
          </div>
        </div>
      </section>
    </>
  );
}
