// 门控页(即将上线 / 维护中)单语文案——不再中英混排。中文仅在手动切换(Cookie=zh)时呈现;默认英文。
import type { Locale } from "./i18n";

export type SplashVariant = "soon" | "maintenance";

export type SplashText = {
  org: string;        // 会徽下机构名(eyebrow)
  titleLead: string;  // 主标题前半
  titleEm: string;    // 主标题强调(金色)
  blurb: string;      // 一句说明
  tag: string;        // 协会格言
  enquiries: string;  // 联络标签
  foot: string;       // 页脚(地点·年份)
};

const COMMON: Record<Locale, { org: string; tag: string; enquiries: string; foot: string }> = {
  en: {
    org: "Global Association of Cultural and Educational Exchange · GACEE",
    tag: "Connecting the World · Cultivating the Future",
    enquiries: "For enquiries",
    foot: "Singapore · 2025",
  },
  zh: {
    org: "全球文化教育交流协会 · GACEE",
    tag: "连接世界 · 传承文明 · 共育未来",
    enquiries: "合作与事务联络",
    foot: "新加坡 · 2025",
  },
  fr: {
    org: "Association Mondiale d'Échange Culturel et Éducatif · GACEE",
    tag: "Connecter le monde · Cultiver l'avenir",
    enquiries: "Pour toute demande",
    foot: "Singapour · 2025",
  },
};

const TITLES: Record<SplashVariant, Record<Locale, { lead: string; em: string; blurb: string }>> = {
  soon: {
    en: { lead: "Our website & AI service platform", em: "are launching soon", blurb: "We're putting the finishing touches on the GACEE website and AI service platform." },
    zh: { lead: "协会官网与 AI 服务平台", em: "正在准备上线", blurb: "我们正在完善 GACEE 协会官网与 AI 服务平台。" },
    fr: { lead: "Notre site et notre plateforme de services IA", em: "arrivent bientôt", blurb: "Nous mettons la dernière main au site et à la plateforme de services IA de GACEE." },
  },
  maintenance: {
    en: { lead: "Our website is", em: "under maintenance", blurb: "We'll be back online shortly. Thank you for your patience." },
    zh: { lead: "官网正在", em: "系统维护中", blurb: "我们将尽快恢复上线,感谢你的耐心等待。" },
    fr: { lead: "Notre site est", em: "en maintenance", blurb: "Nous serons de retour en ligne très bientôt. Merci de votre patience." },
  },
};

export function splashText(locale: Locale, variant: SplashVariant): SplashText {
  const common = COMMON[locale] ?? COMMON.en;
  const title = (TITLES[variant][locale] ?? TITLES[variant].en);
  return { org: common.org, tag: common.tag, enquiries: common.enquiries, foot: common.foot, titleLead: title.lead, titleEm: title.em, blurb: title.blurb };
}
