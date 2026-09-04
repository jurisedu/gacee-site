export const programmeSlugs = [
  "principals-tour",
  "composition-competition",
  "study-tours",
  "principals-forum",
  "online-chinese",
  "future-academy",
  "public-good",
] as const;

export type ProgrammeSlug = (typeof programmeSlugs)[number];
export const featuredSlugs: ProgrammeSlug[] = ["principals-tour", "composition-competition", "online-chinese"];
