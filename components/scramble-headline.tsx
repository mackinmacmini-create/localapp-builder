"use client";

import { useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&";
const LINES = ["Movement", "on your", "terms."];

function scrambleLine(el: HTMLElement, text: string, duration: number): () => void {
  let rafId: number;
  let startTime: number | null = null;

  const frame = (ts: number) => {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    let html = "";

    for (let i = 0; i < text.length; i++) {
      if (text[i] === " ") {
        html += "&nbsp;";
        continue;
      }
      const threshold = (i / text.length) * 0.7 + 0.15;
      if (progress >= threshold) {
        html += `<span style="color:inherit">${text[i]}</span>`;
      } else {
        html += `<span style="color:#d4d4d8">${CHARS[Math.floor(Math.random() * CHARS.length)]}</span>`;
      }
    }

    el.innerHTML = html;

    if (progress < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      el.textContent = text;
    }
  };

  rafId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(rafId);
}

export default function ScrambleHeadline() {
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    LINES.forEach((text, i) => {
      const el = lineRefs.current[i];
      if (!el) return;

      if (prefersReduced) {
        el.textContent = text;
        return;
      }

      const t = setTimeout(() => {
        cleanups.push(scrambleLine(el, text, 1000));
      }, i * 160);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[0.95] text-zinc-900 mb-8">
      {LINES.map((text, i) => (
        <span
          key={text}
          ref={(el) => {
            lineRefs.current[i] = el;
          }}
          className="block"
        >
          {text}
        </span>
      ))}
    </h1>
  );
}
