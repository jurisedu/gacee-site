import type { Metadata } from "next";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import Reveal from "@/components/Reveal";
import MockForm from "@/components/MockForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.contact, description: t.contact.lede };
}

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const c = t.contact;
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
      <section className="section">
        <div className="container contact-grid">
          <Reveal><div className="eyebrow" style={{ marginBottom: 10 }}>{c.generalTitle}</div><a href={`mailto:${c.general}`}>{c.general}</a></Reveal>
          <Reveal delay={60}><div className="eyebrow" style={{ marginBottom: 10 }}>{c.partnersTitle}</div><a href={`mailto:${c.partnersEmail}`}>{c.partnersEmail}</a></Reveal>
          <Reveal delay={120}><div className="eyebrow" style={{ marginBottom: 10 }}>{c.pressTitle}</div><a href={`mailto:${c.press}`}>{c.press}</a></Reveal>
          <Reveal delay={180}><div className="eyebrow" style={{ marginBottom: 10 }}>{c.officeTitle}</div><span className="display" style={{ fontSize: 22, color: "var(--blue-deep)" }}>{c.office}</span></Reveal>
        </div>
      </section>
      <section className="section section--white section--line">
        <div className="container two">
          <Reveal><h2 className="display h2">{c.form.title}</h2></Reveal>
          <Reveal delay={100}>
            <MockForm
              fields={[
                { name: "name", label: c.form.name, required: true, half: true },
                { name: "email", label: c.form.email, type: "email", required: true, half: true },
                { name: "subject", label: c.form.subject, required: true },
                { name: "message", label: c.form.message, type: "textarea", required: true },
              ]}
              submit={c.form.submit} sent={c.form.sent} note={c.form.note}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
