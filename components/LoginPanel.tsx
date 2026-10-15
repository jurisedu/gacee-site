"use client";
import Link from "next/link";
import { useState } from "react";

type Login = {
  tabs: { key: string; label: string }[];
  members: { title: string; body: string; email: string; password: string; submit: string; forgot: string; apply: string; note: string };
  events: { title: string; body: string; email: string; submit: string; sent: string; note: string };
};

export default function LoginPanel({ t, partnersHref }: { t: Login; partnersHref: string }) {
  const [tab, setTab] = useState(t.tabs[0].key);
  const [sent, setSent] = useState(false);
  return (
    <div className="login">
      <div className="login__tabs" role="tablist">
        {t.tabs.map((x) => (
          <button key={x.key} role="tab" aria-selected={tab === x.key} className={`login__tab ${tab === x.key ? "is-active" : ""}`} onClick={() => setTab(x.key)}>{x.label}</button>
        ))}
      </div>
      <div className="login__panel" role="tabpanel">
        {tab === "members" && (
          <>
            <h2 className="display h3">{t.members.title}</h2>
            <p className="mute">{t.members.body}</p>
            <p><a href="https://hub.gacee.org/login" className="btn btn--primary" rel="noopener">{t.members.submit} →</a></p>
            <p className="form__note">{t.members.note}</p>
            <p style={{ marginTop: 24 }}><Link href={partnersHref} className="link">{t.members.apply} →</Link></p>
          </>
        )}
        {tab === "events" && (
          <>
            <h2 className="display h3">{t.events.title}</h2>
            <p className="mute">{t.events.body}</p>
            {sent ? <div className="form__sent">{t.events.sent}</div> : (
              <form className="form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <label>{t.events.email}<input type="email" name="email" required /></label>
                <div><button type="submit" className="btn btn--primary">{t.events.submit}</button></div>
                <p className="form__note">{t.events.note}</p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
