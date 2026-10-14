// 每页独立的 canonical / hreflang / Open Graph URL（审查：子页不能继承首页 canonical）。
import type { Metadata } from "next";
import { locales, htmlLang, type Locale } from "./i18n";

export function pageSeo(l: Locale, path: string, meta: Metadata = {}): Metadata {
  const p = path === "/" ? "" : path;
  const languages: Record<string, string> = Object.fromEntries(locales.map((x) => [htmlLang[x], `/${x}${p}`]));
  languages["x-default"] = `/en${p}`;
  const title = typeof meta.title === "string" ? meta.title : undefined;
  return {
    ...meta,
    alternates: { canonical: `/${l}${p}`, languages },
    openGraph: { type: "website", locale: htmlLang[l], url: `/${l}${p}`, ...(title ? { title } : {}), ...(typeof meta.description === "string" ? { description: meta.description } : {}) },
  };
}
