import type { Metadata } from "next";
import { EB_Garamond, Manrope, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { cookies, headers } from "next/headers";
import { detectLocale, htmlLang } from "@/lib/i18n";
import "./soon.css";

const garamond = EB_Garamond({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });
const notoSans = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-noto-sans", display: "swap", preload: false });
const notoSerif = Noto_Serif_SC({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-noto-serif", display: "swap", preload: false });

async function reqLocale() {
  const h = await headers();
  const c = await cookies();
  return detectLocale(h.get("accept-language") ?? "", c.get("gacee_lang")?.value);
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
    <html lang={htmlLang[locale]} className={`${garamond.variable} ${manrope.variable} ${notoSans.variable} ${notoSerif.variable}`}>
      <body className="soon-body">{children}</body>
    </html>
  );
}
