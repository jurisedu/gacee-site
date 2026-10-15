import type { Metadata } from "next";
import { fontVars, CJK_FONTS_HREF } from "@/lib/fonts";
import { headers } from "next/headers";
import { detectLocale, htmlLang } from "@/lib/i18n";
import "./soon.css";


async function reqLocale() {
  const h = await headers();
  return detectLocale(h.get("accept-language") ?? ""); // 门控页忽略 Cookie,纯浏览器语言(默认英文)
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await reqLocale();
  const title = locale === "zh" ? "GACEE · 全球文化教育交流协会 —— 即将上线"
    : locale === "fr" ? "GACEE — Bientôt en ligne"
    : "GACEE — Coming Soon";
  const description = locale === "zh" ? "协会官网与 AI 服务平台正在准备上线。"
    : locale === "fr" ? "Le site et la plateforme de services IA de GACEE arrivent bientôt."
    : "The GACEE website and AI service platform are coming soon.";
  return {
    metadataBase: new URL("https://gacee.org"),
    title, description,
    robots: { index: false, follow: false },
    icons: { icon: [{ url: "/icon.png", sizes: "64x64", type: "image/png" }], apple: "/apple-touch-icon.png" },
  };
}

export default async function SoonLayout({ children }: { children: React.ReactNode }) {
  const locale = await reqLocale();
  return (
    <html lang={htmlLang[locale]} className={fontVars}>
      {locale === "zh" ? (
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href={CJK_FONTS_HREF} />
        </head>
      ) : null}
      <body className="soon-body">{children}</body>
    </html>
  );
}
