"use client";
// 官网页眉：五个一级栏目（关于协会／项目与活动／全球伙伴／资源中心／参与合作）＋公益专题，必要工具（查验证书、会员登录、语言）。
// 二级菜单只列已有真实内容的页面（宁缺不空）；桌面端悬停或键盘聚焦展开，手机端菜单按栏目分组。语言以各自语言书写，不拆行。
import Link from "next/link";
import { extProps } from "@/lib/links";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { locales, localeNames, localizedPath, swapLocale, type Locale } from "@/lib/i18n";
import Image from "next/image";

type NavDict = { about: string; programmes: string; events: string; impact: string; news: string; partners: string; contact: string; join: string; menu: string; close: string; language: string; signin: string; verify?: string };
export type Columns = {
  aboutGov: string; programmesEvents: string; globalPartners: string; resources: string; participate: string; welfare: string;
  intro: string; contactUs: string; milestones: string; trust: string; library: string; matching: string; apply: string; portal: string; partnerNetwork: string; flagship: string;
  short?: Partial<Record<"aboutGov" | "programmesEvents" | "globalPartners" | "resources" | "participate" | "welfare", string>>; // 桌面一级栏目短名（法文），完整名用于提示与菜单
};

const HUB = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://hub.gacee.org";

type Leaf = { href: string; label: string };

// 站内用 Link，门户等外部地址用 a（组件定义在外层，避免每次渲染重建导致子树重挂载）。
function A({ href, children, className, onClick, current, title }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void; current?: boolean; title?: string }) {
  return href.startsWith("http")
    ? <a href={href} className={className} onClick={onClick} title={title} {...extProps(href)}>{children}</a>
    : <Link href={href} className={className} onClick={onClick} title={title} aria-current={current ? "page" : undefined}>{children}</Link>;
}
type Column = { href: string; label: string; short?: string; items: Leaf[] };

export default function Header({ locale, nav, dark = false, cand }: { locale: Locale; nav: NavDict; dark?: boolean; cand: Columns }) {
  const pathname = usePathname() || `/${locale}`;
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  // 页眉按实际文字宽度适配：0 完整；1 「查验证书」收入菜单与页脚；2 导航收为菜单按钮。三种语言、任意宽度都不挤压、不越界。
  const [fit, setFit] = useState<0 | 1 | 2 | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const brandRef = useRef<HTMLAnchorElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const verifyRef = useRef<HTMLAnchorElement | null>(null);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const calc = () => {
      const gap = parseFloat(getComputedStyle(inner).columnGap) || 24;
      const rgap = parseFloat(getComputedStyle(rightRef.current!).columnGap) || 18;
      const others = [...rightRef.current!.children].filter((e) => e !== verifyRef.current && e !== burgerRef.current && getComputedStyle(e).display !== "none");
      const othersW = others.reduce((sum, e) => sum + (e as HTMLElement).offsetWidth, 0) + rgap * Math.max(0, others.length - 1);
      const verifyW = verifyRef.current ? verifyRef.current.offsetWidth + rgap : 0;
      const base = (brandRef.current?.offsetWidth || 0) + (navRef.current?.scrollWidth || 0) + othersW + gap * 2 + 8;
      const avail = inner.clientWidth;
      setFit(base + verifyW <= avail ? 0 : base <= avail ? 1 : 2);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(inner);
    document.fonts?.ready.then(calc).catch(() => {});
    return () => ro.disconnect();
  }, [locale]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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
  const hubLogin = `${HUB}/login?lang=${locale}`;
  const hubVerify = L("/verify"); // 官网证书查验页（数据来自门户公开验真接口）
  const hubLibrary = `${HUB}/library?lang=${locale}`;

  const columns: Column[] = [
    { href: L("/about"), label: cand.aboutGov, short: cand.short?.aboutGov, items: [{ href: L("/about"), label: cand.intro }, { href: L("/milestones"), label: cand.milestones }, { href: `${HUB}/trust?lang=${locale}`, label: cand.trust }, { href: L("/contact"), label: cand.contactUs }] },
    { href: L("/programmes"), label: cand.programmesEvents, short: cand.short?.programmesEvents, items: [{ href: L("/programmes"), label: cand.flagship }, { href: L("/events"), label: nav.events }, { href: L("/news"), label: nav.news }] },
    { href: L("/global-partners"), label: cand.globalPartners, short: cand.short?.globalPartners, items: [{ href: L("/global-partners"), label: cand.partnerNetwork }, { href: L("/partners"), label: cand.apply }] },
    { href: hubLibrary, label: cand.resources, short: cand.short?.resources, items: [{ href: hubLibrary, label: cand.library }, { href: `${HUB}/market?lang=${locale}`, label: cand.matching }] },
    { href: L("/partners"), label: cand.participate, items: [{ href: L("/partners"), label: cand.apply }, { href: L("/contact"), label: cand.contactUs }, { href: hubLogin, label: cand.portal }] },
  ];

  const ext = (href: string) => href.startsWith("http");
  const isCurrent = (href: string) => !ext(href) && (pathname === href || pathname.startsWith(href + "/"));
  const colCurrent = (c: Column) => c.items.some((i) => isCurrent(i.href)) || isCurrent(c.href);
  const setLang = (l: Locale) => { document.cookie = `gacee_lang=${l};path=/;max-age=31536000;samesite=lax`; };
  const cls = ["header", dark && !solid ? "header--dark" : "", solid ? "header--solid" : "", fit === null ? "" : `is-measured header--fit${fit}`].join(" ");

  return (
    <>
      <header className={cls}>
        <div className="container header__inner" ref={innerRef}>
          <Link href={L("/")} className="brand" aria-label="GACEE home" ref={brandRef}>
            <span className="brand__seal"><Image src="/seal.svg" alt="" width={40} height={40} unoptimized priority /></span>
            <span>GACEE</span>
          </Link>
          <nav className="nav" aria-label="Primary" ref={navRef} aria-hidden={fit === 2 ? true : undefined}>
            {columns.map((c) => (
              <div className="nav__item" key={c.label}>
                <A href={c.href} current={colCurrent(c)} title={c.short ? c.label : undefined}>{c.short || c.label}</A>
                {c.items.length > 1 ? (
                  <div className="nav__sub">
                    {c.items.map((i) => <A key={i.href + i.label} href={i.href} current={isCurrent(i.href)}>{i.label}</A>)}
                  </div>
                ) : null}
              </div>
            ))}
            <Link href={L("/impact")} className="nav__aside" aria-current={isCurrent(L("/impact")) ? "page" : undefined}>{cand.welfare}</Link>
          </nav>
          <div className="header__right" ref={rightRef}>
            {nav.verify ? <a href={hubVerify} {...extProps(hubVerify)} className="signin tool-verify" ref={verifyRef}>{nav.verify}</a> : null}
            <a href={hubLogin} {...extProps(hubLogin)} className="signin">
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
            <span className="brand"><span className="brand__seal"><Image src="/seal.svg" alt="" width={40} height={40} unoptimized /></span><span>GACEE</span></span>
            <button ref={closeRef} className="btn btn--ghost btn--sm" onClick={() => { setOpen(false); burgerRef.current?.focus(); }}>{nav.close}</button>
          </div>
          <div className="menu__links">
            {columns.map((c) => (
              <div className="menu__group" key={c.label}>
                <A href={c.href} onClick={() => setOpen(false)}>{c.label}</A>
                {c.items.length > 1 ? (
                  <div className="menu__sub">
                    {c.items.map((i) => <A key={i.href + i.label} href={i.href} onClick={() => setOpen(false)}>{i.label}</A>)}
                  </div>
                ) : null}
              </div>
            ))}
            <Link href={L("/impact")} onClick={() => setOpen(false)}>{cand.welfare}</Link>
            {nav.verify ? <a href={hubVerify} {...extProps(hubVerify)} onClick={() => setOpen(false)} className="menu__signin">{nav.verify}</a> : null}
            <a href={hubLogin} {...extProps(hubLogin)} onClick={() => setOpen(false)} className="menu__signin">{nav.signin}</a>
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
