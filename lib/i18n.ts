export const locales = ["en", "zh", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  fr: "Français",
};

export const htmlLang: Record<Locale, string> = {
  en: "en",
  zh: "zh-Hans",
  fr: "fr",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * 站点语言判定(纯函数,中间件与服务端组件共用同一规则):
 *   ① 手动选择优先:gacee_lang Cookie(持久,覆盖以下自动判定)。
 *   ② 浏览器 Accept-Language 按 q 权重择优(而非出现顺序)。
 *   ③ 默认强制英文 —— ★中文不参与自动识别:中文浏览器默认呈现英文,中文仅经手动切换(Cookie)呈现;
 *      其它语言(目前 fr)按浏览器语言;不支持的语言回退英文。
 */
export function detectLocale(acceptLanguage: string, cookieValue?: string | null): Locale {
  if (cookieValue && isLocale(cookieValue)) return cookieValue;
  const ranked = (acceptLanguage || "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? parseFloat(qParam.split("=")[1]) : 1; // 无 q 视为 1(最高优先)
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    // ★不含 zh:中文浏览器落到默认英文;仅 fr / en 参与自动识别。
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("en")) return "en";
  }
  return defaultLocale; // 默认英文(含中文浏览器与其它不支持语言)
}

import en from "@/messages/en.json";
import zh from "@/messages/zh.json";
import fr from "@/messages/fr.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, zh: zh as Dictionary, fr: fr as Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function localizedPath(locale: Locale, path: string) {
  return `/${locale}${path === "/" ? "" : path}`;
}

export function swapLocale(pathname: string, target: Locale) {
  const parts = pathname.split("/");
  if (parts.length > 1 && isLocale(parts[1])) parts[1] = target;
  else parts.splice(1, 0, target);
  return parts.join("/") || `/${target}`;
}
