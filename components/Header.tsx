"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, localeNames, localizedPath, swapLocale, type Locale } from "@/lib/i18n";
import Image from "next/image";

type NavDict = { about: string; programmes: string; events: string; impact: string; news: string; partners: string; contact: string; join: string; menu: string; close: string; language: string };

export default function Header({ locale, nav, dark = false }: { locale: Locale; nav: NavDict; dark?: boolean }) {
  const pathname = usePathname() || `/${locale}`;
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links: Array<[string, string]> = [
    [localizedPath(locale, "/about"), nav.about],
    [localizedPath(locale, "/programmes"), nav.programmes],
    [localizedPath(locale, "/events"), nav.events],
    [localizedPath(locale, "/impact"), nav.impact],
    [localizedPath(locale, "/news"), nav.news],
    [localizedPath(locale, "/partners"), nav.partners],
  ];
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const setLang = (l: Locale) => { document.cookie = `gacee_lang=${l};path=/;max-age=31536000;samesite=lax`; };

  const cls = ["header", dark && !solid ? "header--dark" : "", solid ? "header--solid" : ""].join(" ");

  return (
    <>
      <header className={cls}>
        <div className="container header__inner">
          <Link href={localizedPath(locale, "/")} className="brand" aria-label="GACEE home">
            <span className="brand__seal"><Image src="/seal.png" alt="" width={40} height={40} priority /></span>
            <span>GACEE</span>
          </Link>
          <nav className="nav" aria-label="Primary">
            {links.map(([href, label]) => (
              <Link key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined}>{label}</Link>
            ))}
          </nav>
          <div className="header__right">
            <div className="lang" aria-label={nav.language}>
              {locales.map((l) => (
                <Link key={l} href={swapLocale(pathname, l)} aria-current={l === locale ? "true" : undefined} onClick={() => setLang(l)} hrefLang={l}>
                  <span>{l === "zh" ? "中文" : l.toUpperCase()}</span>
                </Link>
              ))}
            </div>
            <Link href={localizedPath(locale, "/partners")} className="btn btn--ghost btn--sm">{nav.join}</Link>
            <button className="burger" aria-label={nav.menu} aria-expanded={open} onClick={() => setOpen(true)}><span /></button>
          </div>
        </div>
      </header>
      {open && (
        <div className="menu" role="dialog" aria-modal="true">
          <div className="menu__top">
            <span className="brand"><span className="brand__seal"><Image src="/seal.png" alt="" width={40} height={40} /></span><span>GACEE</span></span>
            <button className="btn btn--ghost btn--sm" onClick={() => setOpen(false)}>{nav.close}</button>
          </div>
          <div className="menu__links">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
            <Link href={localizedPath(locale, "/contact")} onClick={() => setOpen(false)}>{nav.contact}</Link>
          </div>
          <div className="menu__foot">
            <span>{nav.language}</span>
            <span>
              {locales.map((l) => (
                <Link key={l} href={swapLocale(pathname, l)} onClick={() => setLang(l)} style={{ marginLeft: 16, fontWeight: l === locale ? 700 : 400 }}>{localeNames[l]}</Link>
              ))}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
