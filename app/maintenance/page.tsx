// 系统维护门控页——单语呈现,语言按 detectLocale(默认英文;中文浏览器→英文;fr→法文;手动 Cookie 优先)。
import { cookies, headers } from "next/headers";
import { detectLocale } from "@/lib/i18n";
import Splash from "@/components/Splash";

export const dynamic = "force-dynamic"; // 依请求头判定语言,按请求渲染

export default async function Maintenance() {
  const h = await headers();
  const c = await cookies();
  const locale = detectLocale(h.get("accept-language") ?? "", c.get("gacee_lang")?.value);
  return <Splash locale={locale} variant="maintenance" />;
}
