"use client";
// 官网页眉：主导航 + 必要工具（查验证书、会员登录、语言）。语言以各自语言书写（English / 中文 / Français），不拆行。
// 导航候选：访问任意页面带 ?ia=candidate 可预览五栏目候选（仅预览，未经批准，不改变默认导航与原有路由）。
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, localeNames, localizedPath, swapLocale, type Locale } from "@/lib/i18n";
import Image from "next/image";

type NavDict = { about: string; programmes: string; events: string; impact: string; news: string; partners: string; contact: string; join: string; menu: string; close: string; language: string; signin: string; verify?: string; candidatePreview?: string };
type Cand = { aboutGov: string; programmesEvents: string; network: string; resources: string; participate: string; welfare: string };

const HUB = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";

export default function Header({ locale, nav, dark = false, cand }: { locale: Locale; nav: NavDict; dark?: boolean; cand?: Cand }) {
  const pathname = usePathname() || `/${locale}`;
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [candidate, setCandidate] = useState(false);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const qs = new URLSearchParams(window.location.search).get("ia");
    if (qs === "candidate") document.cookie = "gacee_ia=candidate;path=/;max-age=86400;samesite=lax";
    if (qs === "current") document.cookie = "gacee_ia=;path=/;max-age=0";
    setCandidate(qs === "candidate" || (qs !== "current" && /(?:^|; )gacee_ia=candidate/.test(document.cookie)));
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) { setOpen(false); burgerRef.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [open]);

  const L = (p: string) => localizedPath(locale, p);
  const current: Array<[string, string]> = [
    [L("/about"), nav.about], [L("/programmes"), nav.programmes], [L("/events"), nav.events],
    [L("/impact"), nav.impact], [L("/news"), nav.news], [L("/partners"), nav.partners],
  ];
  const candidateLinks: Array<[string, string]> = cand ? [
    [L("/about"), cand.aboutGov], [L("/programmes"), cand.programmesEvents], [L("/partners"), cand.network],
    [`${HUB}/library?lang=${locale}`, cand.resources], [L("/contact"), cand.participate],
  ] : current;
  const links = candidate && cand ? candidateLinks : current;
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const setLang = (l: Locale) => { document.cookie = `gacee_lang=${l};path=/;max-age=31536000;samesite=lax`; };
  const hubLogin = `${HUB}/login?lang=${locale}`;
  const hubVerify = `${HUB}/verify?lang=${locale}`;
  const cls = ["header", dark && !solid ? "header--dark" : "", solid ? "header--solid" : ""].join(" ");
  const ext = (href: string) => href.startsWith("http");

  return (
    <>
      {candidate && nav.candidatePreview ? <div className="ia-banner" role="note">{nav.candidatePreview} · <a href="?ia=current">{locale === "zh" ? "恢复当前导航" : locale === "fr" ? "Revenir à la navigation actuelle" : "Back to current navigation"}</a></div> : null}
      <header className={cls}>
        <div className="container header__inner">
          <Link href={L("/")} className="brand" aria-label="GACEE home">
            <span className="brand__seal"><Image src="/seal.png" alt="" width={40} height={40} priority /></span>
            <span>GACEE</span>
          </Link>
          <nav className="nav" aria-label="Primary">
            {links.map(([href, label]) => ext(href)
              ? <a key={href} href={href}>{label}</a>
              : <Link key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined}>{label}</Link>)}
            {candidate && cand ? <Link href={L("/impact")} className="nav__aside">{cand.welfare}</Link> : null}
          </nav>
          <div className="header__right">
            {nav.verify ? <a href={hubVerify} className="signin tool-verify">{nav.verify}</a> : null}
            <a href={hubLogin} className="signin">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4" /><path d="M2.5 14c.6-3 3-4.5 5.5-4.5s4.9 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              {nav.signin}
            </a>
            <div className="lang" role="group" aria-label={nav.language}>
              {locales.map((l) => (
                <Link key={l} href={swapLocale(pathname, l)} aria-current={l === locale ? "true" : undefined} onClick={() => setLang(l)} hrefLang={l} lang={l === "zh" ? "zh-Hans" : l}>
                  <span>{localeNames[l]}</span>
                </Link>
              ))}
            </div>
            <button ref={burgerRef} className="burger" aria-label={nav.menu} aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(true)}><span /></button>
          </div>
        </div>
      </header>
      {open && (
        <div className="menu" id="site-menu" role="dialog" aria-modal="true" aria-label={nav.menu}>
          <div className="menu__top">
            <span className="brand"><span className="brand__seal"><Image src="/seal.png" alt="" width={40} height={40} /></span><span>GACEE</span></span>
            <button ref={closeRef} className="btn btn--ghost btn--sm" onClick={() => { setOpen(false); burgerRef.current?.focus(); }}>{nav.close}</button>
          </div>
          <div className="menu__links">
            {links.map(([href, label]) => ext(href)
              ? <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
              : <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
            <Link href={L("/contact")} onClick={() => setOpen(false)}>{nav.contact}</Link>
            {nav.verify ? <a href={hubVerify} onClick={() => setOpen(false)} className="menu__signin">{nav.verify}</a> : null}
            <a href={hubLogin} onClick={() => setOpen(false)} className="menu__signin">{nav.signin}</a>
          </div>
          <div className="menu__foot">
            <span>{nav.language}</span>
            <span>
              {locales.map((l) => (
                <Link key={l} href={swapLocale(pathname, l)} onClick={() => setLang(l)} lang={l === "zh" ? "zh-Hans" : l} style={{ marginLeft: 16, fontWeight: l === locale ? 700 : 400 }}>{localeNames[l]}</Link>
              ))}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
