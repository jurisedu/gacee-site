import { NextRequest, NextResponse } from "next/server";
import { sql, getEvent, newToken } from "@/lib/db";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const ev = await getEvent(slug);
  if (!ev || ev.status === "closed" || ev.status === "hidden") return NextResponse.json({ error: "closed" }, { status: 404 });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }
  const name = String(b.name ?? "").trim().slice(0, 80);
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 160);
  const org = String(b.org ?? "").trim().slice(0, 120);
  const role = ["parent", "teacher", "student", "other"].includes(String(b.role)) ? String(b.role) : "other";
  const region = ["cn", "intl"].includes(String(b.region)) ? String(b.region) : "";
  const lang = ["zh", "en", "fr"].includes(String(b.lang)) ? String(b.lang) : "zh";
  const guardian = b.guardian_consent === true;
  const recording = b.recording_consent === true;
  if (name.length < 1 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (!recording) return NextResponse.json({ error: "consent_required" }, { status: 400 });
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  const token = newToken();
  const rows = (await sql`
    INSERT INTO registrations (event_slug, token, name, email, org, role, region, guardian_consent, recording_consent, lang, country)
    VALUES (${slug}, ${token}, ${name}, ${email}, ${org}, ${role}, ${region}, ${guardian}, ${recording}, ${lang}, ${country})
    ON CONFLICT (event_slug, email) DO UPDATE SET name = EXCLUDED.name, org = EXCLUDED.org, role = EXCLUDED.role, region = EXCLUDED.region, guardian_consent = EXCLUDED.guardian_consent, recording_consent = EXCLUDED.recording_consent, lang = EXCLUDED.lang
    RETURNING id, token`) as { id: number; token: string }[];
  const reg = rows[0];
  const base = process.env.SITE_URL ?? "https://gacee.org";
  const joinUrl = `${base}/${lang}/events/${slug}/join?t=${reg.token}`;
  const title = lang === "zh" ? ev.title_zh : lang === "fr" ? ev.title_fr || ev.title_en : ev.title_en;
  const mail = await sendMail(email, `GACEE · ${title}`, `<p>${name}，</p><p>${lang === "zh" ? "您已报名成功。开课时请点击下面的链接进入：" : "Your registration is confirmed. Use the link below to join when the session starts:"}</p><p><a href="${joinUrl}">${joinUrl}</a></p><p>${lang === "zh" ? "课后回放与提问也在同一页面。" : "The replay and Q&A will appear on the same page after the session."}</p><p>— Global Association of Cultural and Educational Exchange</p>`);
  return NextResponse.json({ ok: true, token: reg.token, joinUrl, mail });
}
