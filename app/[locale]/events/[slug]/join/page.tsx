import type { Metadata } from "next";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import JoinHub from "@/components/JoinHub";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.live.joinTitle, robots: { index: false, follow: false } };
}

export default async function JoinPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <section className="page-head" style={{ paddingBottom: 24 }}><div className="container"><div className="eyebrow">{t.nav.events}</div></div></section>
      <section className="section" style={{ paddingTop: 32 }}><div className="container"><JoinHub slug={slug} locale={l} d={t.live as never} registerPath={localizedPath(l, `/events/${slug}`)} /></div></section>
    </>
  );
}
