"use client";
import { useEffect, useRef } from "react";

type P = { x: number; y: number; z: number };

function spherePoints(n: number): P[] {
  const pts: P[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
  }
  return pts;
}

export default function HeroGlobe() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pts = spherePoints(900);
    const arcs: Array<[number, number]> = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 26; i++) arcs.push([Math.floor(rnd() * pts.length), Math.floor(rnd() * pts.length)]);

    let w = 0, h = 0, dpr = 1, raf = 0, t = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.62;
      const cx = w * 0.72, cy = h * 0.5;
      const rot = t * 0.00012;
      const tilt = 0.35;
      const proj = (p: P) => {
        const x1 = p.x * Math.cos(rot) - p.z * Math.sin(rot);
        const z1 = p.x * Math.sin(rot) + p.z * Math.cos(rot);
        const y1 = p.y * Math.cos(tilt) - z1 * Math.sin(tilt);
        const z2 = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);
        return { sx: cx + x1 * R, sy: cy + y1 * R, d: z2 };
      };
      // arcs
      for (const [a, b] of arcs) {
        const pa = proj(pts[a]), pb = proj(pts[b]);
        if (pa.d < -0.1 || pb.d < -0.1) continue;
        const mx = (pa.sx + pb.sx) / 2, my = (pa.sy + pb.sy) / 2;
        const dx = pb.sx - pa.sx, dy = pb.sy - pa.sy;
        const len = Math.hypot(dx, dy);
        const nx = -dy / (len || 1), ny = dx / (len || 1);
        const lift = Math.min(len * 0.35, R * 0.35);
        const alpha = 0.10 + 0.25 * Math.min(pa.d, pb.d);
        ctx.strokeStyle = `rgba(184,145,47,${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.quadraticCurveTo(mx + nx * lift, my + ny * lift, pb.sx, pb.sy);
        ctx.stroke();
      }
      // points
      for (const p of pts) {
        const q = proj(p);
        if (q.d < -0.15) continue;
        const a = 0.12 + 0.6 * Math.max(0, q.d);
        const r = 0.7 + 1.1 * Math.max(0, q.d);
        ctx.fillStyle = `rgba(200,210,255,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(q.sx, q.sy, r, 0, Math.PI * 2); ctx.fill();
      }
      // hubs
      for (const [a] of arcs) {
        const q = proj(pts[a]);
        if (q.d < 0) continue;
        ctx.fillStyle = `rgba(184,145,47,${(0.5 + 0.5 * q.d).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(q.sx, q.sy, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    };

    const loop = (now: number) => { t = now; draw(); raf = requestAnimationFrame(loop); };
    if (reduce) { t = 4000; draw(); } else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="hero__canvas" aria-hidden="true" />;
}
