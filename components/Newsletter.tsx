"use client";
import { useState } from "react";

export default function Newsletter({ placeholder, label, done }: { placeholder: string; label: string; done: string }) {
  const [sent, setSent] = useState(false);
  if (sent) return <p className="small" style={{ marginTop: 16, opacity: 1 }}>{done}</p>;
  return (
    <form className="newsletter" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      <input type="email" required placeholder={placeholder} aria-label={placeholder} />
      <button type="submit">{label}</button>
    </form>
  );
}
