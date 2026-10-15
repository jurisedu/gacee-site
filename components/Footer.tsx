import Link from "next/link";
import Image from "next/image";
import { localizedPath, type Locale, type Dictionary } from "@/lib/i18n";
import Newsletter from "./Newsletter";

export default function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const p = (path: string) => localizedPath(locale, path);
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              <Image src="/seal.svg" alt="GACEE seal" width={56} height={56} unoptimized />
              <div>
                <div className="footer__name">{t.org.name}</div>
                <div className="footer__tag">{t.org.tagline}</div>
              </div>
            </div>
            <p className="small">{t.footer.registered}</p>
          </div>
          <div>
            <h4>{t.footer.explore}</h4>
            <ul>
              <li><Link href={p("/programmes")}>{t.nav.programmes}</Link></li>
              <li><Link href={p("/events")}>{t.nav.events}</Link></li>
              <li><Link href={p("/impact")}>{t.nav.impact}</Link></li>
              <li><Link href={p("/news")}>{t.nav.news}</Link></li>
              <li><Link href={p("/global-partners")}>{t.columns.globalPartners}</Link></li>
              <li><a href={`https://hub.gacee.org/library?lang=${locale}`}>{t.columns.resources}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t.footer.association}</h4>
            <ul>
              <li><Link href={p("/about")}>{t.nav.about}</Link></li>
              <li><Link href={p("/partners")}>{t.nav.partners}</Link></li>
              <li><Link href={p("/contact")}>{t.nav.contact}</Link></li>
              <li><a href="mailto:info@gacee.org">info@gacee.org</a></li>
            </ul>
          </div>
          <div>
            <h4>{t.footer.newsletter}</h4>
            <p className="small">{t.footer.newsletterBody}</p>
            <Newsletter id="nl-footer" placeholder={t.footer.email} label={t.footer.subscribe} done={t.footer.subscribed} consent={t.footer.subscribeConsent} error={t.footer.subscribeError} consentHint={t.footer.subscribeConsentHint} busy={t.footer.subscribeBusy} locale={locale} />
          </div>
        </div>
        <div className="footer__portals" style={{ display: "flex", flexWrap: "wrap", gap: "10px 26px", alignItems: "center", padding: "26px 0 2px", marginTop: 20, borderTop: "1px solid rgba(148,163,184,0.18)" }}>
          <span style={{ fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.55 }}>{locale === "zh" ? "协会数字平台" : locale === "fr" ? "Plateformes GACEE" : "GACEE Platforms"}</span>
          <a href="https://gacee.org" style={{ fontSize: 14 }}>{locale === "zh" ? "官网" : locale === "fr" ? "Site web" : "Website"} · gacee.org</a>
          <a href="https://hub.gacee.org" style={{ fontSize: 14 }}>{t.columns.portal} · hub.gacee.org</a>
          <Link href={p("/verify")} style={{ fontSize: 14 }}>{t.nav.verify}</Link>
        </div>
        <div className="footer__bottom">
          <span>© {year} {t.org.name}. {t.footer.rights}</span>
          <span>
            {t.footer.tech}: Juris&amp;Edu AI Technology
            <Link href={p("/privacy")}>{t.footer.privacy}</Link>
            <Link href={p("/terms")}>{t.footer.terms}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
