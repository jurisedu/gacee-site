"use client";
// 全站兜底：任何指向其它域名的链接（含后台富文本里的链接）点击时都在新窗口打开，当前官网页面保持不变。
// 已显式设置 target 的链接、带修饰键的点击（用户自行选择打开方式）不干预。
import { useEffect } from "react";

export default function ExternalLinks() {
  useEffect(() => {
    const host = window.location.hostname;
    const mark = (a: HTMLAnchorElement) => {
      if (a.target || !/^https?:$/.test(a.protocol) || a.hostname === host) return;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    };
    const scan = (root: ParentNode) => root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(mark);
    scan(document);
    const mo = new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => {
      if (n instanceof HTMLAnchorElement) mark(n); else if (n instanceof Element) scan(n);
    })));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  return null;
}
