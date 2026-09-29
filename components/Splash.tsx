// 门控页共用外观(即将上线 / 维护中)——单语呈现,由调用方按 detectLocale 传入 locale。
import type { Locale } from "@/lib/i18n";
import { splashText, type SplashVariant } from "@/lib/splash";

const STARS: [number, number, number][] = [
  [10, 18, 0], [17, 41, 1.4], [8, 63, 0.6], [14, 83, 2.1], [27, 27, 1.0],
  [31, 72, 2.6], [43, 12, 0.4], [57, 91, 1.8], [70, 30, 3.0], [72, 85, 0.9],
  [83, 20, 2.3], [90, 45, 1.2], [78, 64, 3.3], [87, 80, 0.2],
];

function Orbit() {
  return (
    <svg viewBox="0 0 900 900" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="soonGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7f97e6" />
          <stop offset="0.55" stopColor="#9fb0ea" />
          <stop offset="1" stopColor="#c9a24a" />
        </linearGradient>
      </defs>
      <g stroke="url(#soonGrad)" strokeWidth="1" opacity="0.9">
        <circle cx="450" cy="450" r="300" />
        <ellipse cx="450" cy="450" rx="300" ry="112" />
        <ellipse cx="450" cy="450" rx="300" ry="224" />
        <ellipse cx="450" cy="450" rx="118" ry="300" />
        <ellipse cx="450" cy="450" rx="236" ry="300" />
        <line x1="150" y1="450" x2="750" y2="450" />
      </g>
      <g stroke="url(#soonGrad)" strokeWidth="1.6">
        <circle cx="362" cy="450" r="96" />
        <circle cx="538" cy="450" r="96" />
      </g>
      <circle cx="450" cy="450" r="362" stroke="#c9a24a" strokeWidth="0.85" strokeDasharray="1.5 12" opacity="0.7" />
      <circle cx="450" cy="450" r="410" stroke="#3a5bd0" strokeWidth="0.6" strokeDasharray="1 22" opacity="0.5" />
    </svg>
  );
}

export default function Splash({ locale, variant }: { locale: Locale; variant: SplashVariant }) {
  const s = splashText(locale, variant);
  return (
    <main className="soon">
      <div className="soon__bg" aria-hidden="true">
        <div className="soon__orbit"><Orbit /></div>
        <div className="soon__stars">
          {STARS.map(([x, y, d], i) => (
            <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
          ))}
        </div>
      </div>
      <div className="soon__grain" aria-hidden="true" />
      <span className="soon__frame soon__frame--top" aria-hidden="true" />
      <span className="soon__frame soon__frame--bottom" aria-hidden="true" />

      <div className="soon__inner">
        <div className="soon__seal">
          <img src="/seal.png" alt={s.org} width={116} height={116} />
        </div>

        <div className="soon__eyebrow">{s.org}</div>

        <h1 className="soon__title">
          {s.titleLead}
          <em>{s.titleEm}</em>
        </h1>

        <p className="soon__title-en">{s.blurb}</p>

        <div className="soon__rule" />

        <p className="soon__tag">{s.tag}</p>

        <div className="soon__contact">
          <span className="soon__contact-label">{s.enquiries}</span>
          <a className="soon__mail" href="mailto:info@gacee.org">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            info@gacee.org
          </a>
        </div>

        <div className="soon__foot">{s.foot}</div>
      </div>
    </main>
  );
}
