"use client";
// 订阅：提交到门户（双重确认）。成功只表示「确认邮件已发出」，点击邮件中的链接后才算订阅；失败时明确提示并可重试。
import { useState } from "react";

type Labels = { placeholder: string; label: string; done: string; consent?: string; error?: string };
const HUB = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";

export default function Newsletter({ placeholder, label, done, consent, error, locale = "en" }: Labels & { locale?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "sent" | "err">("idle");
  const [agree, setAgree] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("busy");
    try {
      const r = await fetch(`${HUB}/api/newsletter/subscribe`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), locale, consent: agree, company_website: fd.get("company_website") }) });
      setState(r.ok ? "sent" : "err");
    } catch { setState("err"); }
  }
  if (state === "sent") return <p className="small" role="status" style={{ marginTop: 16, opacity: 1 }}>{done}</p>;
  return (
    <form className="newsletter" onSubmit={submit}>
      <input type="email" name="email" required placeholder={placeholder} aria-label={placeholder} />
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <button type="submit" disabled={state === "busy" || !agree}>{label}</button>
      {consent ? <label className="small newsletter__consent" style={{ display: "flex", gap: 8, width: "100%", marginTop: 8, opacity: 1 }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />{consent}</label> : null}
      {state === "err" ? <p className="small" role="alert" style={{ width: "100%", marginTop: 8, opacity: 1 }}>{error || "Subscription failed, please try again."}</p> : null}
    </form>
  );
}
