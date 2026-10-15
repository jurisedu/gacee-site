"use client";
// 官网证书查验：由访客浏览器直接请求门户公开接口（按访客限流），结果在本页以核验文书样式显示。
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const HUB = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";
type Dict = Record<string, string> & { tips: string[] };
type Result =
  | { found: false; code: string; checkedAt?: string }
  | { found: true; code: string; status: "valid" | "revoked"; kind: string; holder: string; issuedAt?: string; reviewedAt?: string; revokedAt?: string; issuer: string; batch?: string; project?: { zh?: string; en?: string }; checkedAt?: string };

const KIND: Record<string, Record<Locale, string>> = {
  composition: { zh: "世界中文作文大赛", en: "World Chinese Writing Competition", fr: "Concours mondial d'écriture en chinois" },
  study: { zh: "研学结业", en: "Study Tour Completion", fr: "Fin de séjour d'étude" },
  forum: { zh: "论坛 / 校长行", en: "Forum / Principals' Tour", fr: "Forum / Tournée des directeurs" },
  training: { zh: "培训", en: "Training", fr: "Formation" },
  "hanyu-course": { zh: "中文课程结业", en: "Chinese Language Course Completion", fr: "Fin de cours de chinois" },
};
const valid = (c: string) => /^[A-Z0-9-]{6,40}$/.test(c);

export default function VerifyWidget({ locale, t }: { locale: Locale; t: Dict }) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "done" | "busy" | "down" | "bad">("idle");
  const [res, setRes] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const fmt = (iso?: string, time = false) => {
    if (!iso) return "—";
    const d = new Date(iso); if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale === "fr" ? "fr-FR" : "en-GB", { timeZone: "Asia/Singapore", year: "numeric", month: time ? "2-digit" : "long", day: "numeric", ...(time ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}) }).format(d) + (time ? " SGT" : "");
  };

  const check = useCallback(async (raw: string, push = true) => {
    const c = raw.trim().toUpperCase();
    if (!valid(c)) { setState("bad"); setRes(null); return; }
    setState("checking");
    if (push) { const u = new URL(window.location.href); u.searchParams.set("code", c); window.history.replaceState(null, "", u.toString()); }
    try {
      const r = await fetch(`${HUB}/api/public/verify?code=${encodeURIComponent(c)}`, { cache: "no-store" });
      if (r.status === 429) { setState("busy"); return; }
      if (!r.ok) { setState("down"); return; }
      setRes(await r.json()); setState("done");
    } catch { setState("down"); }
  }, []);

  useEffect(() => {
    const c = new URL(window.location.href).searchParams.get("code");
    if (c) { setCode(c.toUpperCase()); check(c, false); }
  }, [check]);

  const cls = state === "done" && res ? (res.found ? (res.status === "valid" ? "is-valid" : "is-revoked") : "is-missing") : "";

  return (
    <div className="vw">
      <form className="vw-form" role="search" onSubmit={(e) => { e.preventDefault(); check(code); }}>
        <label htmlFor="vw-code" className="sr-only">{t.label}</label>
        <input id="vw-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t.placeholder} autoComplete="off" spellCheck={false} maxLength={40} required />
        <button type="submit" disabled={state === "checking"}>{state === "checking" ? t.checking : t.submit}</button>
      </form>
      <p className={"vw-hint" + (state === "bad" ? " is-err" : "")} role={state === "bad" ? "alert" : undefined}>{state === "bad" ? t.badFormat : state === "busy" ? t.busy : state === "down" ? t.down : t.hint}</p>

      {state === "done" && res ? (
        <article className={"vw-doc " + cls} aria-live="polite">
          <header className="vw-doc__head">
            <img src="/seal.svg" alt="" width={44} height={44} />
            <div><div className="vw-doc__org">{t.org}</div><div className="vw-doc__sub">{t.resultTitle} · GACEE</div></div>
          </header>
          <div className="vw-status">
            <span className="vw-status__mark" aria-hidden>{res.found ? (res.status === "valid" ? "✓" : "✕") : "?"}</span>
            <div>
              <h2 className="vw-status__title">{res.found ? (res.status === "valid" ? t.valid : t.revoked) : t.missing}</h2>
              <p>{res.found ? (res.status === "valid" ? t.validDesc : t.revokedDesc) : t.missingDesc}</p>
            </div>
          </div>
          {res.found ? (
            <dl className="vw-fields">
              <div className="vw-wide"><dt>{t.code}</dt><dd className="vw-code"><span>{res.code}</span><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(res.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* 忽略 */ } }}>{copied ? t.copied : t.copy}</button></dd></div>
              <div><dt>{t.holder}</dt><dd>{res.holder}<small>{t.masked}</small></dd></div>
              <div><dt>{t.type}</dt><dd>{KIND[res.kind]?.[locale] || "—"}</dd></div>
              {res.project ? <div><dt>{t.programme}</dt><dd>{locale === "zh" ? res.project.zh : res.project.en || res.project.zh}</dd></div> : null}
              {res.batch ? <div><dt>{t.batch}</dt><dd>{res.batch}</dd></div> : null}
              <div><dt>{t.issued}</dt><dd>{fmt(res.issuedAt)}</dd></div>
              <div><dt>{t.issuer}</dt><dd>{t.issuerGacee}</dd></div>
              {res.reviewedAt ? <div><dt>{t.approved}</dt><dd>{fmt(res.reviewedAt)}</dd></div> : null}
              {res.status === "revoked" ? <div><dt>{t.revokedAt}</dt><dd className="vw-red">{fmt(res.revokedAt)}</dd></div> : null}
            </dl>
          ) : (
            <div className="vw-missing"><div className="vw-code"><span>{res.code}</span></div><ul>{t.tips.map((x) => <li key={x}>{x}</li>)}</ul></div>
          )}
          <footer className="vw-doc__foot"><span>{t.checkedAt} {fmt(res.checkedAt || new Date().toISOString(), true)}</span><span>gacee.org/verify</span></footer>
        </article>
      ) : null}
    </div>
  );
}
