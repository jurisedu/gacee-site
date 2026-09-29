// 即将上线门控页——单语呈现,语言按 detectLocale(默认英文;中文浏览器→英文;fr→法文;手动 Cookie 优先)。
import { headers } from "next/headers";
import { detectLocale } from "@/lib/i18n";
import Splash from "@/components/Splash";

export const dynamic = "force-dynamic"; // 依请求头判定语言,按请求渲染

export default async function ComingSoon() {
  const h = await headers();
  // ★门控页无语言切换器 → 忽略 gacee_lang Cookie,纯按浏览器语言(默认英文),避免主站残留的旧 Cookie 强制中文。
  const locale = detectLocale(h.get("accept-language") ?? "");
  return <Splash locale={locale} variant="soon" />;
}
