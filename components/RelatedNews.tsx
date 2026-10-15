// 相关报道：项目页 / 公益页底部的图文卡片（数据来自内容中枢，按关键词自动归类）。
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { NewsItem } from "@/lib/news";

export default function RelatedNews({ l, items, title, more }: { l: Locale; items: NewsItem[]; title: string; more: string }) {
  if (!items.length) return null;
  return (
    <section className="section section--white section--line related">
      <div className="container">
        <div className="related__head">
          <h2 className="display h3">{title}</h2>
          <Link href={localizedPath(l, "/news")} className="link">{more} →</Link>
        </div>
        <div className="related__grid">
          {items.map((n, i) => {
            const wide = n.cover && (!n.cover.width || !n.cover.height || n.cover.width >= n.cover.height * 1.2);
            return (
              <Reveal as="article" key={n.id || i} className={"related__card" + (wide ? " has-img" : "")} delay={i * 60}>
                {wide ? <div className="related__img"><img src={n.cover!.url} alt={n.cover!.alt || n.title} loading="lazy" /></div> : null}
                <div className="related__body">
                  <time dateTime={n.date}>{n.date}</time>
                  <h3 lang={n.lang}>{n.id ? <Link href={localizedPath(l, `/news/${n.id}`)}>{n.title}</Link> : n.title}</h3>
                  {n.thirdParty ? <div className="related__src">{n.source}</div> : null}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
