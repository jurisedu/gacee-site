/* Abstract line art per programme: one motif each, drawn in the current text colour. */
export default function ProgrammeArt({ slug, className = "prog-card__art" }: { slug: string; className?: string }) {
  const stroke = "currentColor";
  const common = { fill: "none", stroke, strokeWidth: 1.2, vectorEffect: "non-scaling-stroke" as const };
  switch (slug) {
    case "principals-tour":
      return (
        <svg className={className} viewBox="0 0 300 120" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={30 + i * 40} cy={60} r={6 + (i % 3) * 3} {...common} />)}
          <path d="M30 60 C 90 10, 210 110, 270 60" {...common} />
        </svg>
      );
    case "composition-competition":
      return (
        <svg className={className} viewBox="0 0 300 120" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={20} y1={24 + i * 18} x2={280 - i * 40} y2={24 + i * 18} {...common} />)}
          <circle cx={262} cy={96} r={10} {...common} />
        </svg>
      );
    case "study-tours":
      return (
        <svg className={className} viewBox="0 0 300 120" aria-hidden="true">
          <path d="M10 100 L 70 40 L 120 80 L 180 20 L 230 70 L 290 30" {...common} />
          {[70, 120, 180, 230].map((x, i) => <circle key={i} cx={x} cy={[40, 80, 20, 70][i]} r={4} fill={stroke} />)}
        </svg>
      );
    case "online-chinese":
      return (
        <svg className={className} viewBox="0 0 300 120" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${30 + i * 20} 60 a ${30 + i * 20} ${30 + i * 20} 0 0 1 ${240 - i * 40} 0`} {...common} />)}
          <circle cx={150} cy={60} r={5} fill={stroke} />
        </svg>
      );
    case "future-academy":
      return (
        <svg className={className} viewBox="0 0 300 120" aria-hidden="true">
          <rect x={40} y={20} width={220} height={80} {...common} />
          <line x1={150} y1={20} x2={150} y2={100} {...common} />
          <line x1={40} y1={60} x2={260} y2={60} {...common} />
          <circle cx={150} cy={60} r={14} {...common} />
        </svg>
      );
    case "public-good":
      return (
        <svg className={className} viewBox="0 0 300 120" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={150} cy={60} r={10 + i * 9} {...common} opacity={1 - i * 0.14} />)}
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 300 120" aria-hidden="true">
          <circle cx={120} cy={60} r={40} {...common} /><circle cx={180} cy={60} r={40} {...common} />
        </svg>
      );
  }
}
