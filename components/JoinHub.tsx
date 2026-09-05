"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import TimeZones from "./TimeZones";

type Info = { name: string; region: string; country: string; suggested: "zoom" | "tencent"; event: { slug: string; title_zh: string; title_en: string; title_fr: string; host: string; starts_at: string; duration_min: number; ends_at: string | null; time_confirmed: boolean; status: string; hasZoom: boolean; hasTencent: boolean; replay_url: string; replay_note: string } };
type Q = { id: number; name: string; text: string; answer: string; answered_at: string | null; created_at: string };
type Dict = Record<string, string> & { tz: Record<string, string>; steps: string[] };

export default function JoinHub({ slug, locale, d, registerPath }: { slug: string; locale: Locale; d: Dict; registerPath: string }) {
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<Info | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "invalid">("loading");
  const [msg, setMsg] = useState("");
  const [qs, setQs] = useState<Q[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t") ?? "";
    setToken(t);
    fetch(`/api/events/${slug}/join?t=${encodeURIComponent(t)}`).then(async (r) => { if (!r.ok) { setState("invalid"); return; } setInfo(await r.json()); setState("ok"); }).catch(() => setState("invalid"));
    fetch(`/api/events/${slug}/questions`).then((r) => r.json()).then((j) => setQs(j.questions ?? [])).catch(() => {});
  }, [slug]);

  async function join(tool: "zoom" | "tencent") {
    setMsg("");
    const r = await fetch(`/api/events/${slug}/join`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, tool }) });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error === "link_not_ready" ? d.linkNotReady : d.invalidToken); return; }
    window.open(j.url, "_blank", "noopener");
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 2) return;
    const r = await fetch(`/api/events/${slug}/questions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, text }) });
    const j = await r.json();
    if (r.ok) { setQs([j.question, ...qs]); setText(""); }
  }

  if (state === "loading") return <div className="panel-lite">…</div>;
  if (state === "invalid" || !info) return <div className="form__err">{d.invalidToken} <a href={registerPath} style={{ fontWeight: 700 }}>→ {d.register}</a></div>;
  const ev = info.event;
  const title = locale === "zh" ? ev.title_zh : locale === "fr" ? ev.title_fr || ev.title_en : ev.title_en;
  const primary = info.suggested;
  const Btn = ({ tool }: { tool: "zoom" | "tencent" }) => (
    <button type="button" onClick={() => join(tool)} className={`joinbtn ${tool === primary ? "joinbtn--primary" : ""}`}>
      <b>{tool === "zoom" ? d.zoom : d.tencent}</b><span>{tool === "zoom" ? d.zoomHint : d.tencentHint}</span>
    </button>
  );
  return (
    <div className="join">
      <div className="join__card">
        <div className="eyebrow eyebrow--gold">{ev.status === "live" ? d.live : ev.status === "closed" ? d.closed : d.joinTitle}</div>
        <h2 className="display" style={{ fontSize: 28, marginTop: 8 }}>{title}</h2>
        <p className="mute" style={{ marginTop: 6 }}>{d.hello}, {info.name}. {d.suggested} <b>{primary === "zoom" ? "Zoom" : locale === "zh" ? "腾讯会议" : "Tencent Meeting"}</b>.</p>
        <div className="join__btns">{primary === "zoom" ? <><Btn tool="zoom" /><Btn tool="tencent" /></> : <><Btn tool="tencent" /><Btn tool="zoom" /></>}</div>
        {msg && <div className="form__err" style={{ marginTop: 12 }}>{msg}</div>}
        {!ev.hasZoom && !ev.hasTencent && <p className="small mute" style={{ marginTop: 10 }}>{d.linkNotReady}</p>}
        <dl className="kv" style={{ marginTop: 20 }}>
          <dt>{d.host}</dt><dd>{ev.host}</dd>
          <dt>{d.startsAt}</dt><dd><TimeZones iso={ev.starts_at} labels={d.tz} yourTime={d.yourTime} locale={locale} />{!ev.time_confirmed && <span className="small mute">{d.timeTba}</span>}</dd>
          <dt>{d.duration}</dt><dd>{ev.duration_min} {d.minutes}</dd>
        </dl>
        <ol className="steps small" style={{ marginTop: 10 }}>{d.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </div>
      <div className="join__side">
        <div className="join__card">
          <h3 style={{ fontSize: 18 }}>{d.replayTitle}</h3>
          {ev.replay_url ? <><p className="small mute" style={{ margin: "6px 0 10px" }}>{ev.replay_note}</p>{/\.(mp4|webm|m3u8)(\?|$)/i.test(ev.replay_url) ? <video controls preload="metadata" src={ev.replay_url} style={{ width: "100%", borderRadius: 6, background: "#000" }} /> : <a className="btn btn--primary" href={ev.replay_url} target="_blank" rel="noopener">{d.watch} →</a>}</> : <p className="small mute" style={{ marginTop: 6 }}>{d.replayPending}</p>}
        </div>
        <div className="join__card">
          <h3 style={{ fontSize: 18 }}>{d.questions}</h3>
          <form onSubmit={ask} className="ask"><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={d.ask} maxLength={600} rows={3} /><button className="btn btn--primary btn--sm" type="submit">{d.send}</button></form>
          <ul className="qlist">
            {qs.length === 0 && <li className="small mute">{d.noQuestions}</li>}
            {qs.map((q) => <li key={q.id}><div className="qlist__meta">{q.name} · {new Date(q.created_at).toLocaleString()}</div><div>{q.text}</div>{q.answer && <div className="qlist__ans"><b>{d.answered}</b> {q.answer}</div>}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
