import type { Metadata } from "next";
import { EB_Garamond, Manrope, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./soon.css";

const garamond = EB_Garamond({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });
const notoSans = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-noto-sans", display: "swap", preload: false });
const notoSerif = Noto_Serif_SC({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-noto-serif", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://gacee.org"),
  title: "GACEE · 全球文化教育交流协会 —— 即将上线 Coming Soon",
  description:
    "协会官网与 AI 服务平台正在准备上线。The website and AI service platform of the Global Association of Cultural and Educational Exchange are coming soon.",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/icon.png", sizes: "64x64", type: "image/png" }], apple: "/apple-touch-icon.png" },
};

export default function SoonLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans" className={`${garamond.variable} ${manrope.variable} ${notoSans.variable} ${notoSerif.variable}`}>
      <body className="soon-body">{children}</body>
    </html>
  );
}
