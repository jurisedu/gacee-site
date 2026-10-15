"use client";
// 订阅：提交到门户（双重确认）。成功只表示「确认邮件已发出」，点击邮件中的链接后才算订阅；失败时明确提示并可重试。
// tone=dark 用于页脚深色底，tone=light 用于首页浅色订阅区。按钮始终可点，未勾选同意时给出明确提示（而不是灰掉按钮）。
import { useState } from "react";

type Labels = { placeholder: string; label: string; done: string; consent?: string; error?: string; consentHint?: string; busy?: string };
const HUB = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";

export default function Newsletter({ placeholder, label, done, consent, error, consentHint, busy, locale = "en", tone = "dark", id = "nl" }: Labels & { locale?: string; tone?: "dark" | "light"; id?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "sent" | "err" | "consent">("idle");
  const [agree, setAgree] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "busy") return;
    if (consent && !agree) { setState("consent"); return; }
    const fd = new FormData(e.currentTarget);
    setState("busy");
    try {
      const r = await fetch(`${HUB}/api/newsletter/subscribe`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), locale, consent: agree, company_website: fd.get("company_website") }) });
      setState(r.ok ? "sent" : "err");
    } catch { setState("err"); }
  }
  if (state === "sent") return <p className={`newsletter__done newsletter__done--${tone}`} role="status">{done}</p>;
  return (
    <form className={`newsletter-form newsletter-form--${tone}`} onSubmit={submit} noValidate={false}>
      <div className="newsletter">
        <input id={`${id}-email`} type="email" name="email" required autoComplete="email" placeholder={placeholder} aria-label={placeholder} />
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
        <button type="submit" aria-busy={state === "busy"}>{state === "busy" ? busy || "…" : label}</button>
      </div>
      {consent ? (
        <label className="newsletter__consent">
          <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); if (state === "consent") setState("idle"); }} />
          <span>{consent}</span>
        </label>
      ) : null}
      {state === "consent" ? <p className="newsletter__msg" role="alert">{consentHint || "Please tick the box above to agree first."}</p> : null}
      {state === "err" ? <p className="newsletter__msg" role="alert">{error || "Subscription failed, please try again."}</p> : null}
    </form>
  );
}
