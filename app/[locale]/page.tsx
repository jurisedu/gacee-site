import Link from "next/link";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { programmeSlugs, featuredSlugs } from "@/lib/programmes";
import Header from "@/components/Header";
import HeroGlobe from "@/components/HeroGlobe";
import Reveal from "@/components/Reveal";
import Arrow from "@/components/Arrow";
import ProgrammeArt from "@/components/ProgrammeArt";
import LogoMark from "@/components/LogoMark";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const p = (path: string) => localizedPath(l, path);
  const items = t.programmes.items as Record<string, { title: string; tagline: string; summary: string }>;
  const rest = programmeSlugs.filter((s) => !featuredSlugs.includes(s));
  const news = t.news.items.slice(0, 3);

  return (
    <>
      <Header locale={l} nav={t.nav} dark />
      <section className="hero">
        <HeroGlobe />
        <div className="hero__grad" />
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="eyebrow eyebrow--gold">{t.hero.eyebrow}</div>
            <h1 className="display hero__title">{t.hero.title}</h1>
            <p className="hero__sub">{t.hero.subtitle}</p>
            <div className="hero__actions">
              <Link href={p("/programmes")} className="btn btn--light">{t.hero.cta1}</Link>
              <Link href={p("/partners")} className="btn btn--ghost">{t.hero.cta2}</Link>
            </div>
          </div>
          <div className="hero__scroll">{t.hero.scroll}</div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats__grid">
          {t.stats.map((s, i) => (
            <Reveal key={i} className="stat" delay={i * 80}>
              <div className="stat__value num">{s.value}</div>
              <div className="stat__label">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container two">
          <Reveal>
            <div className="eyebrow">{t.intro.eyebrow}</div>
            <h2 className="display h2" style={{ marginTop: 14 }}>{t.intro.title}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lede">{t.intro.body}</p>
            <p style={{ marginTop: 28 }}><Link href={p("/about")} className="link">{t.intro.link} <Arrow /></Link></p>
          </Reveal>
        </div>
      </section>

      <section className="section section--white section--line">
        <div className="container">
          <Reveal className="section__head">
            <div><div className="eyebrow">{t.pillars.eyebrow}</div><h2 className="display h2">{t.pillars.title}</h2></div>
          </Reveal>
          <ul className="pillars">
            {t.pillars.items.map((it, i) => (
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

      <section className="section section--white section--line">
        <div className="container">
          <Reveal className="section__head">
            <div><div className="eyebrow">{t.network.eyebrow}</div><h2 className="display h2">{t.network.title}</h2></div>
            <p>{t.network.body}</p>
          </Reveal>
          <div className="net">
            {t.network.items.map((it, i) => (
              <Reveal key={i} className="net__item" delay={i * 60}>
                <LogoMark className="net__ring" />
                <div><h3>{it.title}</h3><p>{it.body}</p></div>
              </Reveal>
            ))}
          </div>
          <ul className="regions">{t.network.regions.map((r) => <li key={r}>{r}</li>)}</ul>
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
              <Reveal as="article" key={i} className="news-item" delay={i * 80}>
                <time dateTime={n.date}>{n.date}</time>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <div className="src">{n.source}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta__inner">
          <div>
            <h2 className="display">{t.cta.title}</h2>
            <p>{t.cta.body}</p>
          </div>
          <Link href={p("/partners")} className="btn btn--light">{t.cta.button}</Link>
        </div>
      </section>
    </>
  );
}
