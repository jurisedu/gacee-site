import type { Metadata } from "next";
import Image from "next/image";
import { pageSeo } from "@/lib/seo";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import VerifyWidget from "@/components/VerifyWidget";

// 官网证书查验（方案验收：在官网输入证书编号可查到门户签发的证书）。数据来自门户公开验真接口，持证人姓名脱敏。
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const l = (isLocale(locale) ? locale : "en") as Locale; const t = getDictionary(l);
  return pageSeo(l, "/verify", { title: t.verify.title, description: t.verify.lede });
}

export default async function Verify({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  const v = t.verify;
  return (
    <>
      <Header locale={l} nav={t.nav} cand={t.columns} />
      <main className="verify-page">
        <section className="container verify-hero">
          <span className="verify-seal"><Image src="/seal.png" alt="" width={76} height={76} priority /></span>
          <div className="eyebrow">{v.eyebrow}</div>
          <h1 className="display h2">{v.title}</h1>
          <p className="lede">{v.lede}</p>
          <VerifyWidget locale={l} t={v as never} />
        </section>
        <section className="container">
          <ul className="verify-trust">
            {(v.trust as unknown as [string, string][]).map(([h, p], i) => (
              <li key={h}><span className="verify-trust__n">0{i + 1}</span><b>{h}</b><span>{p}</span></li>
            ))}
          </ul>
          <p className="verify-foot">{v.foot}</p>
        </section>
      </main>
    </>
  );
}
