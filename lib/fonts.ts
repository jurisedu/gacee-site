// 字体：英文字体自托管（OFL，构建时不联网，避免 Vercel 拉取 Google 字体偶发失败）；
// 中文字体由浏览器按需从 Google Fonts 加载（见 ChineseFonts），不可达时回退系统中文字体（苹方 / 微软雅黑 / 宋体）。
import localFont from "next/font/local";

export const manrope = localFont({
  src: [{ path: "../app/fonts/manrope-latin-wght-normal.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
});

export const garamond = localFont({
  src: [
    { path: "../app/fonts/eb-garamond-latin-wght-normal.woff2", weight: "400 800", style: "normal" },
    { path: "../app/fonts/eb-garamond-latin-wght-italic.woff2", weight: "400 800", style: "italic" },
  ],
  variable: "--font-garamond",
  display: "swap",
});

export const fontVars = `${garamond.variable} ${manrope.variable}`;

// 中文：运行时样式表（仅中文页加载）；字体变量在 globals.css 中带系统回退
export const CJK_FONTS_HREF = "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;700&display=swap";
