"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Dict = { name: string; email: string; org: string; role: string; roles: Record<string, string>; region: string; regionCn: string; regionIntl: string; guardian: string; recording: string; submit: string; submitting: string; consentRequired: string; invalid: string; failed: string; registered: string; keepLink: string; copy: string; copied: string; mailSent: string; mailSkipped: string; joinTitle: string };

export default function EventRegister({ slug, locale, d }: { slug: string; locale: Locale; d: Dict }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ joinUrl: string; mail: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); setBusy(true);
    const f = new FormData(e.currentTarget);
    const body = { name: f.get("name"), email: f.get("email"), org: f.get("org"), role: f.get("role"), region: f.get("region"), guardian_consent: f.get("guardian") === "on", recording_consent: f.get("recording") === "on", lang: locale };
    try {
      const r = await fetch(`/api/events/${slug}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error === "consent_required" ? d.consentRequired : j.error === "invalid" ? d.invalid : d.failed); return; }
      setDone({ joinUrl: j.joinUrl, mail: j.mail });
    } catch { setErr(d.failed); } finally { setBusy(false); }
  }

  if (done) {
    const local = done.joinUrl.replace(/^https?:\/\/[^/]+/, "");
    return (
      <div className="form__sent" style={{ textAlign: "left" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{d.registered}</div>
        <p style={{ margin: "8px 0", fontWeight: 400 }}>{d.keepLink}</p>
        <p style={{ margin: "8px 0", wordBreak: "break-all" }}><a href={local} style={{ color: "var(--blue)", fontWeight: 600 }}>{done.joinUrl}</a></p>
        <div className="row" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn--primary btn--sm" onClick={async () => { try { await navigator.clipboard.writeText(done.joinUrl); setCopied(true); } catch {} }}>{copied ? d.copied : d.copy}</button>
          <a href={local} className="btn btn--ghost btn--sm">{d.joinTitle} →</a>
        </div>
        <p className="small" style={{ marginTop: 10, fontWeight: 400, color: "var(--slate)" }}>{done.mail === "sent" ? d.mailSent : d.mailSkipped}</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form__row">
        <label>{d.name}<input name="name" required maxLength={80} autoComplete="name" /></label>
        <label>{d.email}<input name="email" type="email" required maxLength={160} autoComplete="email" /></label>
      </div>
      <div className="form__row">
        <label>{d.org}<input name="org" maxLength={120} autoComplete="organization" /></label>
        <label>{d.role}<select name="role" defaultValue="parent">{Object.entries(d.roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      </div>
      <fieldset className="choice"><legend>{d.region}</legend>
        <label className="choice__opt"><input type="radio" name="region" value="intl" defaultChecked /> {d.regionIntl}</label>
        <label className="choice__opt"><input type="radio" name="region" value="cn" /> {d.regionCn}</label>
      </fieldset>
      <label className="check"><input type="checkbox" name="guardian" /> <span>{d.guardian}</span></label>
      <label className="check"><input type="checkbox" name="recording" required /> <span>{d.recording}</span></label>
      {err && <div className="form__err">{err}</div>}
      <div><button type="submit" className="btn btn--primary" disabled={busy}>{busy ? d.submitting : d.submit}</button></div>
    </form>
  );
}
