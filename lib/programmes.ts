export const programmeSlugs = [
  "principals-tour",
  "composition-competition",
  "study-tours",
  "principals-forum",
  // "online-chinese"：全球中文在线培训，待山海同文正式发布后恢复（文案仍保留在 messages 中）
  "future-academy",
  "public-good",
] as const;

export type ProgrammeSlug = (typeof programmeSlugs)[number];
export const featuredSlugs: ProgrammeSlug[] = ["principals-tour", "composition-competition", "study-tours"];
