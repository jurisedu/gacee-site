"use client";
import { useEffect, useState } from "react";

const ZONES: [string, string][] = [["beijing", "Asia/Shanghai"], ["sydney", "Australia/Sydney"], ["singapore", "Asia/Singapore"], ["lagos", "Africa/Lagos"]];

export default function TimeZones({ iso, labels, yourTime, locale }: { iso: string; labels: Record<string, string>; yourTime: string; locale: string }) {
  const [local, setLocal] = useState("");
  const d = new Date(iso);
  const fmt = (tz?: string) => new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale === "fr" ? "fr-FR" : "en-GB", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  useEffect(() => { try { setLocal(fmt(undefined) + " · " + Intl.DateTimeFormat().resolvedOptions().timeZone); } catch {} }, [iso]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="tz">
      {ZONES.map(([k, tz]) => <div key={k}><span className="tz__k">{labels[k]}</span><span className="tz__v">{fmt(tz)}</span></div>)}
      {local && <div className="tz__local"><span className="tz__k">{yourTime}</span><span className="tz__v">{local}</span></div>}
    </div>
  );
}
