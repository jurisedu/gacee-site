"use client";
import { useState } from "react";

export type Field = { name: string; label: string; type?: "text" | "email" | "textarea" | "select"; options?: string[]; required?: boolean; half?: boolean };

export default function MockForm({ fields, submit, sent, note }: { fields: Field[]; submit: string; sent: string; note: string }) {
  const [done, setDone] = useState(false);
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
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      {rows}
      <div><button type="submit" className="btn btn--primary">{submit}</button></div>
      <p className="form__note">{note}</p>
    </form>
  );
}
