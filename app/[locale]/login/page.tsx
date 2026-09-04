import type { Metadata } from "next";
import { getDictionary, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import PageHead from "@/components/PageHead";
import LoginPanel from "@/components/LoginPanel";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const t = getDictionary((isLocale(locale) ? locale : "en") as Locale);
  return { title: t.nav.signin, robots: { index: false } };
}

export default async function Login({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <PageHead eyebrow={t.login.eyebrow} title={t.login.title} lede={t.login.lede} />
      <section className="section">
        <div className="container">
          <LoginPanel t={t.login} partnersHref={localizedPath(l, "/partners")} />
        </div>
      </section>
    </>
  );
}
