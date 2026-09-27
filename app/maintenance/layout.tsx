import type { Metadata } from "next";
import { EB_Garamond, Manrope, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "../coming-soon/soon.css";

const garamond = EB_Garamond({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });
const notoSans = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-noto-sans", display: "swap", preload: false });
const notoSerif = Noto_Serif_SC({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-noto-serif", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://gacee.org"),
  title: "GACEE · 全球文化教育交流协会 —— 系统维护中 Under Maintenance",
  description:
    "协会官网正在进行系统维护，稍后恢复。The GACEE website is under maintenance and will be back shortly.",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/icon.png", sizes: "64x64", type: "image/png" }], apple: "/apple-touch-icon.png" },
};

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans" className={`${garamond.variable} ${manrope.variable} ${notoSans.variable} ${notoSerif.variable}`}>
      <body className="soon-body">{children}</body>
    </html>
  );
}
