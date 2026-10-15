import type { Metadata } from "next";
import { fontVars, CJK_FONTS_HREF } from "@/lib/fonts";
import { notFound } from "next/navigation";
import { locales, isLocale, htmlLang, getDictionary, type Locale } from "@/lib/i18n";
import Footer from "@/components/Footer";
import "../globals.css";


const SITE = "https://gacee.org";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return {
    metadataBase: new URL(SITE),
    title: { default: t.meta.title, template: `%s · ${t.org.short}` },
    description: t.meta.description,
    // canonical / hreflang / og:url 由各页面 generateMetadata（lib/seo.ts pageSeo）分别生成，布局不再统一指向首页
    openGraph: { type: "website", siteName: t.org.name, title: t.meta.title, description: t.meta.description, locale: htmlLang[l] },
    icons: { icon: [{ url: "/icon.png", sizes: "64x64", type: "image/png" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/apple-touch-icon.png" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <html lang={htmlLang[locale]} suppressHydrationWarning className={fontVars}>
      {locale === "zh" ? (
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href={CJK_FONTS_HREF} />
        </head>
      ) : null}
      <body>
        {/* 标记脚本可用；渐显动画仅在此之后启用。若 2.5 秒内未完成初始化，强制显示全部内容 */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');setTimeout(function(){document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in')})},2500);" }} />
        {children}
        <Footer locale={locale} t={t} />
      </body>
    </html>
  );
}
