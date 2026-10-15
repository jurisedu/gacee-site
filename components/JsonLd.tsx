// 结构化数据（schema.org JSON-LD），帮助搜索引擎正确识别协会、文章与活动。
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const SITE = "https://gacee.org";
export const ORG_ID = `${SITE}/#organization`;
