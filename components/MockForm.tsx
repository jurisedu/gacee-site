"use client";
import { useState } from "react";

export type Field = { name: string; label: string; type?: "text" | "email" | "textarea" | "select"; options?: string[]; required?: boolean; half?: boolean };

// 平台线索接口（公开 + CORS）。lead 传入时表单真实提交到平台 CRM；不传则保持演示行为。
const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";

export default function MockForm({ fields, submit, sent, note, lead }: { fields: Field[]; submit: string; sent: string; note: string; lead?: string }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (done) return <div className="form__sent">{sent}</div>;

  const render = (f: Field) => (
    <label key={f.name}>
      {f.label}
      {f.type === "textarea" ? (
        <textarea name={f.name} required={f.required} />
      ) : f.type === "select" ? (
        <select name={f.name} required={f.required} defaultValue="">
          <option value="" disabled>—</option>
          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input name={f.name} type={f.type ?? "text"} required={f.required} />
      )}
    </label>
  );
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (f.half && fields[i + 1]?.half) { rows.push(<div className="form__row" key={f.name + "-row"}>{render(f)}{render(fields[i + 1])}</div>); i++; }
    else rows.push(render(f));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lead) { setDone(true); return; } // 无平台线索接口配置时保持演示行为
    setBusy(true); setErr("");
    try {
      const fd = new FormData(e.currentTarget);
      const payload: Record<string, string> = { kind: lead };
      fd.forEach((v, k) => { payload[k] = String(v); });
      const r = await fetch(`${PLATFORM}/api/lead`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) { setErr("submit_failed"); setBusy(false); return; }
      setDone(true);
    } catch { setErr("network"); setBusy(false); }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {rows}
      {/* 蜜罐：隐藏字段，真人不填；机器人常自动填 → 平台侧静默丢弃 */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
      <div><button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "…" : submit}</button></div>
      {err ? <p className="form__note" style={{ color: "var(--red, #b23a3a)" }}>{err === "network" ? "网络异常，请稍后再试。" : "提交失败，请稍后再试或直接邮件联系。"}</p> : <p className="form__note">{note}</p>}
    </form>
  );
}
