import type { Metadata } from "next";
import { fontVars, CJK_FONTS_HREF } from "@/lib/fonts";
import { headers } from "next/headers";
import { detectLocale, htmlLang } from "@/lib/i18n";
import "../coming-soon/soon.css";


async function reqLocale() {
  const h = await headers();
  return detectLocale(h.get("accept-language") ?? ""); // 门控页忽略 Cookie,纯浏览器语言(默认英文)
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await reqLocale();
  const title = locale === "zh" ? "GACEE · 全球文化教育交流协会 —— 系统维护中"
    : locale === "fr" ? "GACEE — En maintenance"
    : "GACEE — Under Maintenance";
  const description = locale === "zh" ? "协会官网正在进行系统维护,稍后恢复。"
    : locale === "fr" ? "Le site de GACEE est en maintenance et sera bientôt de retour."
    : "The GACEE website is under maintenance and will be back shortly.";
  return {
    metadataBase: new URL("https://gacee.org"),
    title, description,
    robots: { index: false, follow: false },
    icons: { icon: [{ url: "/icon.png", sizes: "64x64", type: "image/png" }], apple: "/apple-touch-icon.png" },
  };
}

export default async function MaintenanceLayout({ children }: { children: React.ReactNode }) {
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
