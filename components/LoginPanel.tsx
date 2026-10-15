"use client";
import Link from "next/link";
import { useState } from "react";

const HUB = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";

type Login = {
  tabs: { key: string; label: string }[];
  members: { title: string; body: string; email: string; password: string; submit: string; forgot: string; apply: string; note: string };
  events: { title: string; body: string; submit: string; note: string };
};

export default function LoginPanel({ t, partnersHref, locale }: { t: Login; partnersHref: string; locale: string }) {
  const [tab, setTab] = useState(t.tabs[0].key);
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
            <p><a href={`${HUB}/login?lang=${locale}`} className="btn btn--primary" target="_blank" rel="noopener noreferrer">{t.members.submit} →</a></p>
            <p className="form__note">{t.members.note}</p>
            <p style={{ marginTop: 24 }}><Link href={partnersHref} className="link">{t.members.apply} →</Link></p>
          </>
        )}
        {tab === "events" && (
          <>
            <h2 className="display h3">{t.events.title}</h2>
            <p className="mute">{t.events.body}</p>
            {/* 报名记录在协会数字门户：用报名邮箱以验证码登录后直达「我的报名」 */}
            <p><a href={`${HUB}/login?lang=${locale}&next=${encodeURIComponent("/registrations")}`} className="btn btn--primary" target="_blank" rel="noopener noreferrer">{t.events.submit} →</a></p>
            <p className="form__note">{t.events.note}</p>
          </>
        )}
      </div>
    </div>
  );
}
