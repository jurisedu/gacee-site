"use client";
import { useEffect, useRef, type ReactNode } from "react";

export default function Reveal({ children, className = "", as: Tag = "div", delay = 0 }: { children: ReactNode; className?: string; as?: "div" | "section" | "li" | "article"; delay?: number }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.classList.add("in"); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Comp = Tag as unknown as "div";
  return <Comp ref={ref as never} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</Comp>;
}
