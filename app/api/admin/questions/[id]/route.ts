import { NextRequest, NextResponse } from "next/server";
import { sql, isAdmin } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const n = Number(id);
  if (!Number.isInteger(n)) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  if (typeof b.answer === "string") await sql`UPDATE questions SET answer = ${String(b.answer).trim().slice(0, 2000)}, answered_at = CASE WHEN ${String(b.answer).trim()} = '' THEN NULL ELSE now() END WHERE id = ${n}`;
  if (typeof b.hidden === "boolean") await sql`UPDATE questions SET hidden = ${b.hidden} WHERE id = ${n}`;
  return NextResponse.json({ ok: true });
}
