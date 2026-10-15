import Link from "next/link";
import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { programmeSlugs, featuredSlugs } from "@/lib/programmes";
import Header from "@/components/Header";
import HeroGlobe from "@/components/HeroGlobe";
import Reveal from "@/components/Reveal";
import Arrow from "@/components/Arrow";
import ProgrammeArt from "@/components/ProgrammeArt";
import { fetchSite, mergeSection, mergeProgrammes } from "@/lib/site";
import { newsItems } from "@/lib/news";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return pageSeo(l, "", { title: { absolute: t.meta.title } as never, description: t.meta.description });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const p = (path: string) => localizedPath(l, path);
  const rest = programmeSlugs.filter((s) => !featuredSlugs.includes(s));
  const { items: news } = await newsItems(l, 3);

  // 平台已发布板块覆盖静态字典（未发布/不可达则用静态，官网永远可用）。
  const site = await fetchSite(l);
  const hero = mergeSection(t.hero, site?.sections?.hero);
  const intro = mergeSection(t.intro, site?.sections?.intro);
  const cta = mergeSection(t.cta, site?.sections?.cta);
  const pillars = mergeSection(t.pillars, site?.sections?.pillars);
  const network = mergeSection(t.network, site?.sections?.network);
  // 图片展示：只在内容中枢「首页 · 图片展示」已发布且有图片时显示（宁缺不空；署名随图）
  type GalleryItem = { image?: string; caption?: string; credit?: string; link?: string };
  const gallerySec = site?.sections?.gallery as { eyebrow?: string; title?: string; body?: string; items?: GalleryItem[] } | undefined;
  const gallery = (Array.isArray(gallerySec?.items) ? gallerySec!.items! : []).filter((g) => g.image && /^(https:\/\/|http:\/\/localhost[:/])/.test(g.image));
  const items = mergeProgrammes(t.programmes.items as Record<string, { title: string; tagline: string; summary: string }>, site?.sections?.programmes);
  const statsItems = site?.sections?.stats?.items;
  const stats = (Array.isArray(statsItems) ? statsItems : t.stats) as typeof t.stats;

  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} dark />
      <section className="hero">
        <HeroGlobe />
        <div className="hero__grad" />
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="eyebrow eyebrow--gold">{hero.eyebrow}</div>
            <h1 className="display hero__title">{String(hero.title).replace(/ · /g, "\u00a0· ")}</h1>
            <p className="hero__sub">{hero.subtitle}</p>
            <div className="hero__actions">
              <Link href={p("/programmes")} className="btn btn--light">{hero.cta1}</Link>
              <Link href={p("/partners")} className="btn btn--ghost">{hero.cta2}</Link>
            </div>
          </div>
          <div className="hero__scroll">{hero.scroll}</div>
        </div>
      </section>

      <section className="section section--line roles" aria-labelledby="roles-title">
        <div className="container">
          <div className="eyebrow">{t.roles.eyebrow}</div>
          <h2 id="roles-title" className="display h2">{t.roles.title}</h2>
          <div className="roles__grid">
            {t.roles.items.map((r) => (
              <Link key={r.href} href={p(r.href)} className="roles__item">
                <h3>{r.title}</h3>
                <p>{r.body}</p>
                <span className="link">{t.programmes.learnMore} <Arrow /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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

      <section className="section">
        <div className="container two">
          <Reveal>
            <div className="eyebrow">{intro.eyebrow}</div>
            <h2 className="display h2" style={{ marginTop: 14 }}>{intro.title}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lede">{intro.body}</p>
            <p style={{ marginTop: 28 }}><Link href={p("/about")} className="link">{intro.link} <Arrow /></Link></p>
          </Reveal>
        </div>
      </section>

      <section className="section section--white section--line">
        <div className="container">
          <Reveal className="section__head">
            <div><div className="eyebrow">{pillars.eyebrow}</div><h2 className="display h2">{pillars.title}</h2></div>
          </Reveal>
          <ul className="pillars">
            {pillars.items.map((it, i) => (
              <Reveal as="li" key={i} className="pillar" delay={i * 70}>
                <div className="pillar__n">0{i + 1}</div>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section__head">
            <div><div className="eyebrow">{t.programmes.eyebrow}</div><h2 className="display h2">{t.programmes.title}</h2></div>
            <p>{t.programmes.body}</p>
          </Reveal>
          <div className="prog-feature">
            {featuredSlugs.map((slug, i) => (
              <Reveal key={slug} delay={i * 90}>
                <Link href={p(`/programmes/${slug}`)} className={`prog-card ${i === 0 ? "prog-card--ink" : ""}`}>
                  <div className="prog-card__tag">{items[slug].tagline}</div>
                  <h3>{items[slug].title}</h3>
                  <p className="prog-card__sum">{items[slug].summary}</p>
                  <ProgrammeArt slug={slug} />
                  <div className="prog-card__foot"><span className="link" style={{ color: "inherit" }}>{t.programmes.learnMore} <Arrow /></span></div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="prog-list">
            {rest.map((slug, i) => (
              <Link key={slug} href={p(`/programmes/${slug}`)} className="prog-row">
                <span className="prog-row__n">0{i + featuredSlugs.length + 1}</span>
                <h3>{items[slug].title}</h3>
                <p>{items[slug].tagline}</p>
                <Arrow />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {gallery.length ? (
        <section className="section gallery-sec" aria-labelledby="gallery-title">
          <div className="container">
            <Reveal className="section__head">
              <div><div className="eyebrow">{gallerySec?.eyebrow}</div><h2 id="gallery-title" className="display h2">{gallerySec?.title}</h2></div>
              {gallerySec?.body ? <p>{gallerySec.body}</p> : null}
            </Reveal>
            <div className="gallery">
              {gallery.slice(0, 9).map((g, i) => (
                <Reveal as="figure" key={i} className={"gallery__item" + (i === 0 ? " gallery__item--lead" : "")} delay={i * 50}>
                  <img src={g.image} alt={g.caption || ""} loading={i < 3 ? "eager" : "lazy"} />
                  <figcaption>
                    {g.caption ? <span>{g.link ? <a href={g.link}>{g.caption}</a> : g.caption}</span> : null}
                    {g.credit ? <small>{g.credit}</small> : null}
                  </figcaption>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--white section--line">
        <div className="container">
          <Reveal className="section__head">
            <div><div className="eyebrow">{network.eyebrow}</div><h2 className="display h2">{network.title}</h2></div>
            <p>{network.body}</p>
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
            <div><div className="eyebrow">{t.newsHome.eyebrow}</div><h2 className="display h2">{t.newsHome.title}</h2></div>
            <p><Link href={p("/news")} className="link">{t.newsHome.all} <Arrow /></Link></p>
          </Reveal>
          <div className="news-grid">
            {news.map((n, i) => (
              <Reveal as="article" key={n.id || i} className="news-item" delay={i * 80}>
                {n.cover ? <img className="news-item__img" src={n.cover.url} alt={n.cover.alt || n.title} loading="lazy" /> : null}
                <time dateTime={n.date}>{n.date}</time>
                <h3 lang={n.lang}>{n.id ? <Link href={p(`/news/${n.id}`)}>{n.title}</Link> : n.title}</h3>
                <p lang={n.lang}>{n.excerpt || (n.body.length > 160 ? n.body.slice(0, 160) + "…" : n.body)}</p>
                <div className="src">{n.source}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta__inner">
          <div>
            <h2 className="display">{cta.title}</h2>
            <p>{cta.body}</p>
          </div>
          <Link href={p("/partners")} className="btn btn--light">{cta.button}</Link>
        </div>
      </section>
    </>
  );
}
