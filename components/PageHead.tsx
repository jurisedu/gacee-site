export default function PageHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <section className="page-head">
      <div className="container">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="display">{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
    </section>
  );
}
