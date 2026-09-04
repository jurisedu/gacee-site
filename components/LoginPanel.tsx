"use client";
import Link from "next/link";
import { useState } from "react";

type Login = {
  tabs: { key: string; label: string }[];
  members: { title: string; body: string; email: string; password: string; submit: string; forgot: string; apply: string; note: string };
  learn: { title: string; body: string; button: string; status: string; teacher: string; learner: string; school: string };
  events: { title: string; body: string; email: string; submit: string; sent: string; note: string };
};

export default function LoginPanel({ t, partnersHref }: { t: Login; partnersHref: string }) {
  const [tab, setTab] = useState(t.tabs[0].key);
  const [sent, setSent] = useState(false);
  const [signed, setSigned] = useState(false);
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
            {signed ? <div className="form__sent">{t.members.note}</div> : (
              <form className="form" onSubmit={(e) => { e.preventDefault(); setSigned(true); }}>
                <label>{t.members.email}<input type="email" name="email" required autoComplete="username" /></label>
                <label>{t.members.password}<input type="password" name="password" required autoComplete="current-password" /></label>
                <div className="login__row">
                  <button type="submit" className="btn btn--primary">{t.members.submit}</button>
                  <a href="#" className="link" onClick={(e) => e.preventDefault()}>{t.members.forgot}</a>
                </div>
                <p className="form__note">{t.members.note}</p>
              </form>
            )}
            <p style={{ marginTop: 24 }}><Link href={partnersHref} className="link">{t.members.apply} →</Link></p>
          </>
        )}
        {tab === "learn" && (
          <>
            <h2 className="display h3">{t.learn.title}</h2>
            <p className="mute">{t.learn.body}</p>
            <div className="login__roles">
              <span>{t.learn.teacher}</span><span>{t.learn.learner}</span><span>{t.learn.school}</span>
            </div>
            <p><a href="https://learn.gacee.org" className="btn btn--primary" rel="noopener">{t.learn.button}</a></p>
            <p className="form__note">{t.learn.status}</p>
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
