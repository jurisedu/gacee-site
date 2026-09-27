import type { Metadata } from "next";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import MockForm from "@/components/MockForm";
import { fetchSite, parsePairs } from "@/lib/site";

export const revalidate = 300; // ISR：平台「官网内容 · 合作」编辑后 5 分钟内生效

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.partners, description: t.partners.lede };
}

export default async function Partners({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const f = t.partners.form;
  // 平台可覆盖 eyebrow/title/lede + 六大类别(types)；未发布则回退静态六类
  const site = await fetchSite(l);
  const pp = site?.sections?.partners as Record<string, unknown> | undefined;
  const eyebrow = (pp?.eyebrow as string) || t.partners.eyebrow;
  const title = (pp?.title as string) || t.partners.title;
  const lede = (pp?.lede as string) || t.partners.lede;
  const types = (parsePairs(pp?.types) ?? t.partners.types) as { title: string; body: string }[];
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={eyebrow} title={title} lede={lede} />
      <section className="section">
        <div className="container card-grid">
          {types.map((s, i) => (
            <Reveal key={i} className={`card ${i === 0 ? "card--ink" : ""}`} delay={i * 60}><h3>{s.title}</h3><p>{s.body}</p></Reveal>
          ))}
        </div>
      </section>
      <section className="section section--white section--line">
        <div className="container two">
          <Reveal><div className="eyebrow">{t.partners.eyebrow}</div><h2 className="display h2" style={{ marginTop: 14 }}>{f.title}</h2></Reveal>
          <Reveal delay={100}>
            <MockForm
              fields={[
                { name: "name", label: f.name, required: true, half: true },
                { name: "org", label: f.org, required: true, half: true },
                { name: "email", label: f.email, type: "email", required: true, half: true },
                { name: "type", label: f.type, type: "select", options: types.map((x) => x.title), required: true, half: true },
                { name: "message", label: f.message, type: "textarea" },
              ]}
              submit={f.submit} sent={f.sent} note={f.note} lead="partner"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
