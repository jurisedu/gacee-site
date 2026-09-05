import { NextRequest, NextResponse } from "next/server";
import { sql, getEvent } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const rows = await sql`SELECT id, name, text, answer, answered_at, created_at FROM questions WHERE event_slug = ${slug} AND hidden = false ORDER BY created_at DESC LIMIT 200`;
  return NextResponse.json({ questions: rows });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const ev = await getEvent(slug);
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const t = String(b.token ?? "");
  const text = String(b.text ?? "").trim().slice(0, 600);
  if (text.length < 2) return NextResponse.json({ error: "empty" }, { status: 400 });
  const reg = (await sql`SELECT id, name FROM registrations WHERE event_slug = ${slug} AND token = ${t}`) as { id: number; name: string }[];
  if (!reg[0]) return NextResponse.json({ error: "invalid_token" }, { status: 403 });
  const recent = (await sql`SELECT count(*)::int AS n FROM questions WHERE registration_id = ${reg[0].id} AND created_at > now() - interval '10 minutes'`) as { n: number }[];
  if (recent[0].n >= 5) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const rows = await sql`INSERT INTO questions (event_slug, registration_id, name, text) VALUES (${slug}, ${reg[0].id}, ${reg[0].name}, ${text}) RETURNING id, name, text, answer, answered_at, created_at`;
  return NextResponse.json({ question: rows[0] });
}
