"use client";

import { useEffect, useRef } from "react";

interface OdometerProps {
  value: string;
  className?: string;
}

export default function Odometer({ value, className = "" }: OdometerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const runAnimation = (instant: boolean) => {
      const strips = container.querySelectorAll<HTMLDivElement>(".odo-strip");
      strips.forEach((strip, i) => {
        const digit = parseInt(value[i]);
        if (isNaN(digit)) return;
        const firstSpan = strip.firstElementChild as HTMLElement | null;
        if (!firstSpan) return;
        const h = firstSpan.offsetHeight;
        if (instant) {
          strip.style.transition = "none";
        } else {
          strip.style.transitionDelay = `${i * 0.12}s`;
        }
        strip.style.transform = `translateY(-${digit * h}px)`;
      });
    };

    if (prefersReduced) {
      runAnimation(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return;
        triggered.current = true;
        runAnimation(false);
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`flex items-end ${className}`}
      aria-label={value}
      aria-live="off"
    >
      {value.split("").map((_, i) => (
        <div key={i} className="overflow-hidden" style={{ height: "1.15em" }}>
          <div
            className="odo-strip flex flex-col"
            style={{ transition: "transform 1.5s cubic-bezier(.16,1,.3,1)" }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} style={{ display: "block", height: "1.15em", lineHeight: 1.15 }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
