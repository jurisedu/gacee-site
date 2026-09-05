"use client";
import { useEffect, useState } from "react";

type Data = { event: Record<string, unknown> & { slug: string; zoom_url: string; tencent_url: string; replay_url: string; replay_note: string; host: string; status: string; starts_at: string; duration_min: number; time_confirmed: boolean }; stats: Record<string, number>; registrations: Record<string, unknown>[]; joins: Record<string, unknown>[]; questions: { id: number; name: string; text: string; answer: string; hidden: boolean; created_at: string }[] };

export default function AdminConsole({ slug }: { slug: string }) {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const h = () => ({ "Content-Type": "application/json", "x-admin-token": token });

  async function load(tok = token) {
    setErr("");
    const r = await fetch(`/api/admin/events/${slug}`, { headers: { "x-admin-token": tok } });
    if (!r.ok) { setErr(r.status === 401 ? "令牌无效 / invalid token" : "加载失败"); setData(null); return; }
    setData(await r.json());
    try { localStorage.setItem("gacee_admin", tok); } catch {}
  }
  useEffect(() => { try { const t = localStorage.getItem("gacee_admin"); if (t) { setToken(t); load(t); } } catch {} }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const f = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(["zoom_url", "tencent_url", "replay_url", "replay_note", "host", "status"].map((k) => [k, f.get(k)]));
    const local = String(f.get("starts_local") ?? "");
    if (local) body.starts_at = new Date(local).toISOString();
    body.duration_min = Number(f.get("duration_min"));
    body.time_confirmed = f.get("time_confirmed") === "on";
    const r = await fetch(`/api/admin/events/${slug}`, { method: "PATCH", headers: h(), body: JSON.stringify(body) });
    setSaving(false);
    if (r.ok) load(); else setErr("保存失败");
  }
  async function answer(id: number, a: string) { await fetch(`/api/admin/questions/${id}`, { method: "PATCH", headers: h(), body: JSON.stringify({ answer: a }) }); load(); }
  async function hide(id: number, hidden: boolean) { await fetch(`/api/admin/questions/${id}`, { method: "PATCH", headers: h(), body: JSON.stringify({ hidden }) }); load(); }

  if (!data) return (
    <div className="form" style={{ maxWidth: 520 }}>
      <label>管理令牌 · Admin token<input value={token} onChange={(e) => setToken(e.target.value)} type="password" /></label>
      <div><button className="btn btn--primary" onClick={() => load()}>进入 · Open</button></div>
      {err && <div className="form__err">{err}</div>}
    </div>
  );
  const ev = data.event; const s = data.stats;
  const startsLocal = new Date(ev.starts_at).toISOString().slice(0, 16);
  return (
    <div className="admin">
      <div className="admin__stats">
        {[["报名", s.registrations], ["已进入", s.attended], ["Zoom 点击", s.zoom], ["腾讯会议点击", s.tencent], ["留言", s.questions]].map(([k, v]) => <div key={k as string} className="admin__stat"><b>{v as number}</b><span>{k}</span></div>)}
        <a className="btn btn--ghost btn--sm" href={`/api/admin/events/${slug}?format=csv&token=${encodeURIComponent(token)}`}>导出 CSV</a>
        <button className="btn btn--ghost btn--sm" onClick={() => load()}>刷新</button>
      </div>
      <form className="form admin__form" onSubmit={save}>
        <div className="form__row"><label>Zoom 加入链接<input name="zoom_url" defaultValue={ev.zoom_url} placeholder="https://zoom.us/j/…" /></label><label>腾讯会议加入链接<input name="tencent_url" defaultValue={ev.tencent_url} placeholder="https://meeting.tencent.com/dm/…" /></label></div>
        <div className="form__row"><label>回放链接（MP4 直链或视频页）<input name="replay_url" defaultValue={ev.replay_url} /></label><label>回放说明<input name="replay_note" defaultValue={ev.replay_note} /></label></div>
        <div className="form__row"><label>主讲<input name="host" defaultValue={ev.host} /></label><label>状态<select name="status" defaultValue={ev.status}><option value="open">open · 报名中</option><option value="live">live · 直播中</option><option value="closed">closed · 已结束</option><option value="hidden">hidden · 隐藏</option></select></label></div>
        <div className="form__row"><label>开始时间（UTC）<input name="starts_local" type="datetime-local" defaultValue={startsLocal} /></label><label>时长（分钟）<input name="duration_min" type="number" defaultValue={ev.duration_min} /></label></div>
        <label className="check"><input type="checkbox" name="time_confirmed" defaultChecked={ev.time_confirmed} /> <span>时间已确认（取消勾选会在页面显示「待确认」）</span></label>
        <div><button className="btn btn--primary" type="submit" disabled={saving}>{saving ? "保存中…" : "保存"}</button> {err && <span className="form__err">{err}</span>}</div>
      </form>
      <h3 style={{ margin: "28px 0 10px" }}>留言与提问</h3>
      <ul className="qlist">
        {data.questions.map((q) => (
          <li key={q.id} style={{ opacity: q.hidden ? .5 : 1 }}>
            <div className="qlist__meta">{q.name} · {new Date(q.created_at).toLocaleString()} {q.hidden && "· 已隐藏"}</div>
            <div>{q.text}</div>
            <form onSubmit={(e) => { e.preventDefault(); answer(q.id, String(new FormData(e.currentTarget).get("a") ?? "")); }} className="ask"><textarea name="a" defaultValue={q.answer} rows={2} placeholder="老师回复…" /><div className="row" style={{ display: "flex", gap: 8 }}><button className="btn btn--primary btn--sm" type="submit">回复</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => hide(q.id, !q.hidden)}>{q.hidden ? "显示" : "隐藏"}</button></div></form>
          </li>
        ))}
      </ul>
      <h3 style={{ margin: "28px 0 10px" }}>报名名单</h3>
      <div className="tbl-wrap"><table className="tbl-admin"><thead><tr><th>姓名</th><th>邮箱</th><th>机构</th><th>身份</th><th>地区</th><th>国家</th><th>监护同意</th><th>录制知悉</th><th>报名时间</th><th>进入</th><th>工具</th></tr></thead><tbody>
        {data.registrations.map((r) => <tr key={String(r.id)}><td>{String(r.name)}</td><td>{String(r.email)}</td><td>{String(r.org)}</td><td>{String(r.role)}</td><td>{String(r.region)}</td><td>{String(r.country)}</td><td>{r.guardian_consent ? "✓" : ""}</td><td>{r.recording_consent ? "✓" : ""}</td><td>{new Date(String(r.created_at)).toLocaleString()}</td><td>{String(r.joins)}</td><td>{String(r.tools ?? "")}</td></tr>)}
      </tbody></table></div>
      <h3 style={{ margin: "28px 0 10px" }}>进入记录</h3>
      <div className="tbl-wrap"><table className="tbl-admin"><thead><tr><th>时间</th><th>姓名</th><th>工具</th><th>国家</th></tr></thead><tbody>{data.joins.map((j) => <tr key={String(j.id)}><td>{new Date(String(j.at)).toLocaleString()}</td><td>{String(j.name)}</td><td>{String(j.tool)}</td><td>{String(j.country)}</td></tr>)}</tbody></table></div>
    </div>
  );
}
