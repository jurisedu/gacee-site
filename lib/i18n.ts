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
