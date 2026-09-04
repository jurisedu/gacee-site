import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, isLocale, htmlLang, getDictionary, type Locale } from "@/lib/i18n";
import Footer from "@/components/Footer";
import "../globals.css";

const garamond = EB_Garamond({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });

export const SITE = "https://gacee.org";

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
    alternates: { canonical: `/${l}`, languages: { en: "/en", "zh-Hans": "/zh", fr: "/fr", "x-default": "/en" } },
    openGraph: { type: "website", siteName: t.org.name, title: t.meta.title, description: t.meta.description, locale: htmlLang[l], url: `/${l}` },
    icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <html lang={htmlLang[locale]} className={`${garamond.variable} ${manrope.variable}`}>
      <body>
        {children}
        <Footer locale={locale} t={t} />
      </body>
    </html>
  );
}
