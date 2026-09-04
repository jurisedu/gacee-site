export default function LogoMark({ className = "brand__mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="18" cy="24" r="11.5" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="30" cy="24" r="11.5" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="24" cy="24" r="3.4" fill="currentColor" />
    </svg>
  );
}
