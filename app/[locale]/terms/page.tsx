import type { Metadata } from "next";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.legal.termsTitle, robots: { index: false } };
}

export default async function Terms({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={`${t.legal.updated} 2026-09-05`} title={t.legal.termsTitle} />
      <section className="section"><div className="container prose">{t.legal.terms.map((p, i) => <p key={i}>{p}</p>)}</div></section>
    </>
  );
}
