import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { programmeSlugs } from "@/lib/programmes";

const SITE = "https://gacee.org";
const paths = ["", "/about", "/programmes", "/events", "/impact", "/news", "/partners", "/contact", ...programmeSlugs.map((s) => `/programmes/${s}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: `${SITE}/${l}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x === "zh" ? "zh-Hans" : x, `${SITE}/${x}${p}`])) },
    }))
  );
}
