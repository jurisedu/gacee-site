import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/internal/", "/api/", "/en/admin/", "/zh/admin/", "/fr/admin/"] }, sitemap: "https://gacee.org/sitemap.xml", host: "https://gacee.org" };
}
