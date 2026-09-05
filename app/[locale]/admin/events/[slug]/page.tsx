import type { Metadata } from "next";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import AdminConsole from "@/components/AdminConsole";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Event admin", robots: { index: false, follow: false } };

export default async function AdminEvent({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return (
    <>
      <Header locale={l} nav={t.nav} />
      <section className="page-head" style={{ paddingBottom: 24 }}><div className="container"><div className="eyebrow">Admin · {slug}</div><h1 className="display" style={{ fontSize: 32 }}>活动管理台</h1><p className="mute small">主持人在此填写 Zoom 与腾讯会议链接、回放地址，查看报名与进入记录，回复留言。</p></div></section>
      <section className="section" style={{ paddingTop: 32 }}><div className="container"><AdminConsole slug={slug} /></div></section>
    </>
  );
}
