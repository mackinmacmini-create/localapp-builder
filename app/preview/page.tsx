"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, type MotionValue } from "framer-motion";
import Link from "next/link";

// ─── Star field ───────────────────────────────────────────────────────────────
// Pre-seeded so positions are stable (no hydration mismatch)
const STARS = Array.from({ length: 80 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const r    = seed / 233280;
  const seed2 = (seed * 9301 + 49297) % 233280;
  const r2   = seed2 / 233280;
  const seed3 = (seed2 * 9301 + 49297) % 233280;
  const r3   = seed3 / 233280;
  const seed4 = (seed3 * 9301 + 49297) % 233280;
  const r4   = seed4 / 233280;
  return {
    x: r * 100,
    y: r2 * 100,
    size: 1 + r3 * 1.5,
    delay: r4 * 6,
    duration: 4 + r * 6,
  };
});

function StarField({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: i % 7 === 0 ? primaryColor : "white",
          }}
          animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.4, 1] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Scroll progress dots ────────────────────────────────────────────────────
const PROGRESS_STEPS = [0, 0.2, 0.4, 0.6, 0.8];
function ScrollDots({ progress, primaryColor }: { progress: number; primaryColor: string }) {
  return (
    <div className="absolute right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5 pointer-events-none">
      {PROGRESS_STEPS.map((step, i) => {
        const active = progress >= step && (i === PROGRESS_STEPS.length - 1 || progress < PROGRESS_STEPS[i + 1]);
        return (
          <motion.div
            key={i}
            animate={{ scale: active ? 1.4 : 1, opacity: active ? 1 : 0.25 }}
            transition={{ duration: 0.2 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: active ? primaryColor : "white" }}
          />
        );
      })}
    </div>
  );
}

import { type AppConfig, DEFAULT_CONFIG } from "@/lib/types";

// ─── Confetti particles (seeded — no hydration mismatch) ─────────────────────
const CONFETTI_COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#A78BFA", "#34D399", "#FFFFFF", "#F97316"];
const CONFETTI_DOTS = Array.from({ length: 22 }, (_, i) => {
  const s1 = (i * 9301 + 49297) % 233280;
  const s2 = (s1 * 9301 + 49297) % 233280;
  const s3 = (s2 * 9301 + 49297) % 233280;
  const s4 = (s3 * 9301 + 49297) % 233280;
  return {
    x: (s1 / 233280) * 200 - 100,
    vy: -50 - (s2 / 233280) * 100,
    rotate: (s3 / 233280) * 360,
    dur: 0.55 + (s4 / 233280) * 0.35,
    del: (s1 / 233280) * 0.18,
    sz: 4 + Math.round((s2 / 233280) * 4),
  };
});

// ─── Phone screen tabs ────────────────────────────────────────────────────────
type ScreenTab = "home" | "order" | "loyalty" | "profile";

function AppScreen({
  config, tab, demoStamps, onStampTap,
}: {
  config: AppConfig;
  tab: ScreenTab;
  demoStamps: number;
  onStampTap: () => void;
}) {
  const [hapticActive, setHapticActive] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const handleStampClick = () => {
    if (demoStamps >= config.loyaltyStampsRequired) return;
    onStampTap();
    setHapticActive(true);
    setTimeout(() => setHapticActive(false), 450);
    if (demoStamps + 1 >= config.loyaltyStampsRequired) {
      setTimeout(() => {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 1800);
      }, 150);
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      {tab === "home" && (
        <div className={`h-full overflow-y-auto pb-16 ${config.appTheme === "dark" ? "bg-[#0F172A]" : "bg-[#F9FAFB]"}`}>
          <div className="px-5 pt-4 pb-5" style={{ background: config.primaryColor }}>
            <div className="flex items-center gap-3">
              {config.logoDataUrl ? (
                <img src={config.logoDataUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover shrink-0 border-2 border-white/30" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-base">{(config.businessName || "A").charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                  {config.category}
                </p>
                <h1 className="text-white font-bold text-lg leading-tight truncate">
                  {config.businessName}
                </h1>
                {config.tagline && (
                  <p className="text-white/60 text-xs mt-0.5 truncate">{config.tagline}</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 pt-4 space-y-3">
            {config.welcomeMessage && (
              <div className="rounded-2xl px-4 py-3 text-sm font-medium border" style={{ background: config.primaryColor + "15", borderColor: config.primaryColor + "30", color: config.primaryColor }}>
                {config.welcomeMessage}
              </div>
            )}

            {config.loyaltyEnabled && (
              <button
                onClick={handleStampClick}
                className="w-full rounded-2xl p-4 text-white shadow-md text-left cursor-pointer active:scale-[0.98] transition-transform"
                style={{ background: config.accentColor }}
              >
                <div className="font-bold text-sm mb-2">Your Rewards</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Array.from({ length: Math.min(config.loyaltyStampsRequired, 8) }).map((_, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center text-[10px] font-bold ${i < demoStamps ? "bg-white/90" : "bg-white/20"}`}>
                      {i < demoStamps ? <span style={{ color: config.accentColor }}>✓</span> : null}
                    </div>
                  ))}
                </div>
                <div className="text-white/80 text-xs">{demoStamps} / {config.loyaltyStampsRequired} stamps — earn {config.loyaltyRewardName || "a reward"}</div>
              </button>
            )}

            {config.orderingEnabled && config.menuItems.length > 0 && (
              <div className={`rounded-2xl border p-4 shadow-sm ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-gray-100"}`}>
                <div className={`font-bold text-sm mb-3 ${config.appTheme === "dark" ? "text-white" : "text-gray-900"}`}>Order Ahead</div>
                <div className="space-y-2.5">
                  {config.menuItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${config.appTheme === "dark" ? "text-slate-200" : "text-gray-800"}`}>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{item.price}</span>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: config.primaryColor }}>+</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {config.pushEnabled && config.notificationTitle && (
              <div className={`rounded-2xl border p-4 shadow-sm ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-gray-100"}`}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: config.primaryColor }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                  </div>
                  <span className={`text-sm font-bold ${config.appTheme === "dark" ? "text-white" : "text-gray-900"}`}>{config.notificationTitle}</span>
                </div>
                <p className={`text-xs leading-relaxed pl-9 ${config.appTheme === "dark" ? "text-slate-400" : "text-gray-500"}`}>{config.notificationBody || "Tap to view"}</p>
              </div>
            )}

            {(config.hours || config.phone) && (
              <div className={`rounded-2xl border divide-y ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155] divide-[#334155]" : "bg-white border-gray-100 divide-gray-100"}`}>
                {config.hours && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={config.primaryColor} strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className={`text-xs ${config.appTheme === "dark" ? "text-slate-200" : "text-gray-800"}`}>{config.hours}</span>
                  </div>
                )}
                {config.phone && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={config.primaryColor} strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    <span className={`text-xs ${config.appTheme === "dark" ? "text-slate-200" : "text-gray-800"}`}>{config.phone}</span>
                  </div>
                )}
              </div>
            )}

            {!config.loyaltyEnabled && !config.orderingEnabled && !config.hours && !config.phone && (
              <div className={`text-center py-16 text-sm ${config.appTheme === "dark" ? "text-slate-600" : "text-gray-400"}`}>
                Nothing enabled yet
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "order" && (
        <div className={`h-full overflow-y-auto pb-16 ${config.appTheme === "dark" ? "bg-[#0F172A]" : "bg-[#F9FAFB]"}`}>
          <div className="px-5 pt-4 pb-4" style={{ background: config.primaryColor }}>
            <h2 className="text-white font-bold text-base">Order Ahead</h2>
            <p className="text-white/60 text-xs mt-0.5">Skip the line, pick up fresh</p>
          </div>
          <div className="px-4 pt-4 space-y-3">
            {config.orderingEnabled && config.menuItems.length > 0 ? config.menuItems.map((item) => (
              <div key={item.id} className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-gray-100"}`}>
                <div>
                  <div className={`font-semibold text-sm ${config.appTheme === "dark" ? "text-white" : "text-gray-900"}`}>{item.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.price}</div>
                </div>
                <button className="w-8 h-8 rounded-full text-white font-bold text-sm flex items-center justify-center shadow" style={{ background: config.primaryColor }}>+</button>
              </div>
            )) : (
              <div className={`text-center py-16 text-sm ${config.appTheme === "dark" ? "text-slate-600" : "text-gray-400"}`}>No menu items configured</div>
            )}
          </div>
        </div>
      )}

      {tab === "loyalty" && (
        <div className={`h-full overflow-y-auto pb-16 ${config.appTheme === "dark" ? "bg-[#0F172A]" : "bg-[#F9FAFB]"}`}>
          <div className="px-5 pt-4 pb-4" style={{ background: config.primaryColor }}>
            <h2 className="text-white font-bold text-base">Your Rewards</h2>
            <p className="text-white/60 text-xs mt-0.5">Earn stamps, get free stuff</p>
          </div>
          <div className="px-4 pt-5">
            {config.loyaltyEnabled ? (
              <div className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden" style={{ background: config.accentColor }}>
                {/* Confetti burst at reward earned */}
                <AnimatePresence>
                  {confettiActive && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      {CONFETTI_DOTS.map((p, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-sm"
                          initial={{ x: 120, y: 200, opacity: 1, rotate: 0 }}
                          animate={{ x: 120 + p.x, y: 200 + p.vy, opacity: 0, rotate: p.rotate }}
                          transition={{ duration: p.dur, delay: p.del, ease: "easeOut" }}
                          style={{ width: p.sz, height: p.sz, background: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                <div className="font-bold text-base mb-1">Punch Card</div>
                <div className="text-white/70 text-xs mb-4">Collect {config.loyaltyStampsRequired} stamps for {config.loyaltyRewardName || "a free reward"}</div>

                {/* Stamp grid with haptic ring overlay */}
                <div className="relative">
                  <div className={`grid gap-3 ${config.loyaltyStampsRequired <= 9 ? "grid-cols-3" : "grid-cols-4"}`}>
                    {Array.from({ length: config.loyaltyStampsRequired }).map((_, i) => (
                      <motion.button
                        key={i}
                        onClick={handleStampClick}
                        whileTap={{ scale: 0.88 }}
                        className={`aspect-square rounded-2xl border-2 border-white/40 flex items-center justify-center text-sm font-bold cursor-pointer ${i < demoStamps ? "bg-white/90" : "bg-white/15"}`}
                      >
                        <AnimatePresence mode="wait">
                          {i < demoStamps ? (
                            <motion.span key="filled" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ color: config.accentColor }}>✓</motion.span>
                          ) : (
                            <motion.span key="empty" className="text-white/50 text-xs">{i + 1}</motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </div>
                  {/* Haptic ring — expands outward on tap */}
                  <AnimatePresence>
                    {hapticActive && (
                      <motion.div
                        key="haptic"
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0.75, scale: 0.9 }}
                        animate={{ opacity: 0, scale: 1.14 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{ border: "2.5px solid rgba(255,255,255,0.9)" }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  key={demoStamps}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-white/80 text-xs text-center"
                >
                  {demoStamps >= config.loyaltyStampsRequired
                    ? `Reward earned! Claim your ${config.loyaltyRewardName || "free reward"}`
                    : `${demoStamps} of ${config.loyaltyStampsRequired} stamps collected — tap to add`}
                </motion.div>
              </div>
            ) : (
              <div className={`text-center py-16 text-sm ${config.appTheme === "dark" ? "text-slate-600" : "text-gray-400"}`}>Loyalty not enabled</div>
            )}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <div className="h-full overflow-y-auto pb-16 px-4 pt-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md" style={{ background: config.primaryColor }}>
              J
            </div>
            <div className="font-bold text-gray-900 text-base">James W.</div>
            <div className="text-xs text-gray-400 mt-0.5">Member since Jan 2025</div>
          </div>
          <div className="space-y-2">
            {["My Orders", "Saved Items", "Notifications", "Settings"].map((item) => (
              <div key={item} className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3.5 shadow-sm">
                <span className="text-sm font-medium text-gray-800">{item}</span>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Full phone mockup ────────────────────────────────────────────────────────
function BigPhone({ config, unlocked, mouseX, mouseY }: { config: AppConfig; unlocked: boolean; mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const [tab, setTab] = useState<ScreenTab>("home");
  const [demoStamps, setDemoStamps] = useState(3);
  const [showNotification, setShowNotification] = useState(false);
  const [glowActive, setGlowActive] = useState(false);

  const handleStampTap = () => {
    setDemoStamps((s) => Math.min(s + 1, config.loyaltyStampsRequired));
    setGlowActive(true);
    setTimeout(() => setGlowActive(false), 600);
  };

  const handleTabChange = (newTab: ScreenTab) => {
    setTab(newTab);
    setGlowActive(true);
    setTimeout(() => setGlowActive(false), 400);
  };

  // iOS notification drops in 2.5s after unlock, auto-dismisses after 3.5s
  useEffect(() => {
    if (!unlocked) { setShowNotification(false); return; }
    const t1 = setTimeout(() => setShowNotification(true), 2500);
    const t2 = setTimeout(() => setShowNotification(false), 6200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [unlocked]);

  const tabs: { id: ScreenTab; label: string; path: string }[] = [
    { id: "home", label: "Home", path: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
    { id: "order", label: "Order", path: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" },
    { id: "loyalty", label: "Loyalty", path: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" },
    { id: "profile", label: "Profile", path: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" },
  ];

  return (
    <div className="relative" style={{ width: 320 }}>
      {/* Screen glow bleed — emanates from screen face, pulses on interaction */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{ opacity: glowActive ? 0.55 : 0.2 }}
        transition={{ duration: 0.35 }}
        style={{
          width: 240, height: 380,
          top: 28, left: "50%", x: "-50%",
          background: `radial-gradient(ellipse at 50% 25%, ${config.primaryColor}80, transparent 65%)`,
          filter: "blur(22px)",
          zIndex: -1,
        }}
      />

      {/* Physical side buttons — mute, vol+, vol-, power */}
      <div className="absolute" style={{ left: -3, top: 136, width: 3, height: 24, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 5px rgba(0,0,0,0.8)" }} />
      <div className="absolute" style={{ left: -3, top: 172, width: 3, height: 56, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 5px rgba(0,0,0,0.8)" }} />
      <div className="absolute" style={{ left: -3, top: 240, width: 3, height: 56, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 5px rgba(0,0,0,0.8)" }} />
      <div className="absolute" style={{ right: -3, top: 206, width: 3, height: 82, borderRadius: "0 2px 2px 0", background: "linear-gradient(to right, #2e2e32, #1c1c1e)", boxShadow: "2px 0 5px rgba(0,0,0,0.8)" }} />

      {/* Titanium shell */}
      <div
        className="rounded-[52px]"
        style={{
          background: "linear-gradient(155deg, #2C2C30 0%, #1C1C20 40%, #0D0D11 70%, #080B14 100%)",
          padding: "3.5px",
          boxShadow: `0 0 0 0.5px rgba(255,255,255,0.07), 0 40px 100px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 80px ${config.primaryColor}1a`,
        }}
      >
      <div className="rounded-[49px]" style={{ background: "#090B0F", padding: "3px" }}>
        {/* Dynamic island */}
        <div
          className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 rounded-full z-10"
          style={{ background: "#06080C", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.04)" }}
        />

        {/* Screen */}
        <div className={`rounded-[46px] overflow-hidden flex flex-col ${config.appTheme === "dark" ? "bg-[#0F172A]" : "bg-[#F9FAFB]"}`} style={{ height: 640 }}>
          {/* Status bar */}
          <div className="h-10 flex items-end justify-between px-6 pb-1.5" style={{ background: config.primaryColor }}>
            <span className="text-white text-[11px] font-semibold">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 items-end h-3">
                {[3, 5, 7, 9].map((h, i) => <div key={i} className="w-1 bg-white/80 rounded-sm" style={{ height: h }} />)}
              </div>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <rect x="0.5" y="0.5" width="11" height="9" rx="2" stroke="white" strokeOpacity=".8" />
                <rect x="1.5" y="1.5" width="7" height="7" rx="1" fill="white" fillOpacity=".8" />
                <path d="M12.5 3.5v3a1.5 1.5 0 0 0 0-3Z" fill="white" fillOpacity=".6" />
              </svg>
            </div>
          </div>

          {/* iOS notification drop-in banner */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                key="notif"
                initial={{ y: -90, opacity: 0, scale: 0.94 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -90, opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="absolute top-10 left-3 right-3 z-30"
              >
                <div className="bg-white/92 backdrop-blur-xl rounded-2xl px-3.5 py-3 shadow-2xl border border-white/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden" style={{ background: config.primaryColor }}>
                    {config.logoDataUrl ? (
                      <img src={config.logoDataUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{(config.businessName || "A").charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-[11px] truncate">{config.businessName}</div>
                    <div className="text-gray-500 text-[11px] mt-0.5 truncate">
                      {config.notificationTitle || "New reward available!"}
                    </div>
                  </div>
                  <div className="text-gray-400 text-[10px] flex-shrink-0 font-medium">now</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lock overlay — visible before unlock */}
          <AnimatePresence>
            {!unlocked && (
              <motion.div
                key="lock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.06 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[40px] backdrop-blur-[2px]"
                style={{ background: "rgba(8,11,20,0.55)" }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <div className="text-white/60 text-[11px] tracking-widest uppercase font-medium">Scroll to unlock</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Screen content */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <AppScreen config={config} tab={tab} demoStamps={demoStamps} onStampTap={handleStampTap} />
          </motion.div>

          {/* Bottom tab bar */}
          <div className={`border-t px-2 py-2 flex items-center justify-around shrink-0 ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-gray-100"}`}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer focus:outline-none"
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${tab === t.id ? "text-white" : config.appTheme === "dark" ? "text-[#475569]" : "text-gray-300"}`} style={tab === t.id ? { background: config.primaryColor } : {}}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={tab === t.id ? 2 : 1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.path} />
                  </svg>
                </div>
                <span className={`text-[9px] font-semibold ${tab === t.id ? (config.appTheme === "dark" ? "text-white" : "text-gray-900") : config.appTheme === "dark" ? "text-[#475569]" : "text-gray-300"}`}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Glow */}
      <div
        className="absolute -inset-8 -z-10 rounded-full blur-3xl opacity-20"
        style={{ background: config.primaryColor }}
      />
    </div>
  );
}

// ─── Preview page ─────────────────────────────────────────────────────────────
export default function PreviewPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockFlash, setUnlockFlash] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Cinematic entrance
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  // Refs
  const containerRef  = useRef<HTMLDivElement>(null);
  const phoneOuterRef = useRef<HTMLDivElement>(null);
  const heroRef       = useRef<HTMLDivElement>(null);

  // Cursor tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX  = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 120, damping: 20 });
  const tiltY  = useSpring(useTransform(mouseX, [-300, 300], [-12, 12]), { stiffness: 120, damping: 20 });

  // Floating pill cursor drift
  const pillDX = useTransform(mouseX, (v) => v * 0.04);
  const pillDY = useTransform(mouseY, (v) => v * 0.035);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Start phone hidden and angled
      gsap.set(phoneOuterRef.current, { opacity: 0, rotateY: 42, rotateX: 14, scale: 0.34, y: 60 });

      // Scroll-driven 3D animation: float in → zoom → zoom into screen
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.4,
          onUpdate: (self) => setScrollProgress(self.progress),
        },
      });
      tl.to(phoneOuterRef.current, { opacity: 1, rotateY: 0, rotateX: 0, scale: 0.82, y: 0, duration: 0.3, ease: "power2.out" })
        .to(phoneOuterRef.current, { scale: 1.0, duration: 0.35, ease: "power1.inOut" })
        .to(phoneOuterRef.current, { scale: 1.22, duration: 0.17, ease: "power2.in" });

      // Hero text fades and lifts as user scrolls
      gsap.to(heroRef.current, {
        opacity: 0, y: -50, ease: "none",
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "32% top", scrub: true },
      });

      // Unlock threshold
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "80% top",
        onEnter: () => {
          setUnlocked(true);
          setUnlockFlash(true);
          setTimeout(() => setUnlockFlash(false), 900);
        },
        onLeaveBack: () => setUnlocked(false),
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("localapp_config");
      if (stored) setConfig(JSON.parse(stored) as AppConfig);
    } catch (_) {}
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div ref={containerRef} className="relative font-sans" style={{ minHeight: "280vh", background: "#080B14" }}>

      {/* ── Sticky viewport ── */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

        {/* Star field — entrance fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0.1 }}
          className="absolute inset-0"
        >
          <StarField primaryColor={config.primaryColor} />
        </motion.div>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px]"
            style={{ background: config.primaryColor, opacity: 0.05 + scrollProgress * 0.08 }}
          />
        </div>

        {/* Scroll progress dots */}
        <ScrollDots progress={scrollProgress} primaryColor={config.primaryColor} />

        {/* Top bar — entrance */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -12 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-20 flex items-center justify-between px-6 py-4 shrink-0"
        >
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to builder
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-white/40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              <span className="text-white/50 text-xs font-mono">localapp.co/{config.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-app"}</span>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {copied ? (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                  </svg>
                  Share
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Hero text — stagger entrance */}
        <div
          ref={heroRef}
          className="relative z-10 flex flex-col items-center pt-10 shrink-0 pointer-events-none select-none"
        >
          {/* Category badge — slides in on first scroll tick */}
          <AnimatePresence>
            {scrollProgress > 0.03 && (
              <motion.div
                key="badge"
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mb-4 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest border"
                style={{ background: config.primaryColor + "20", borderColor: config.primaryColor + "50", color: config.primaryColor }}
              >
                {config.category || "Restaurant"}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/30 text-xs font-semibold tracking-[0.25em] uppercase mb-3"
          >
            Your app, live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-white font-bold text-4xl sm:text-5xl tracking-tight text-center leading-none"
          >
            {config.businessName || "Your Business"}
          </motion.h1>

          {config.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 16 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/40 text-base mt-3 text-center"
            >
              {config.tagline}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-8 flex items-center gap-2 text-white/25 text-sm animate-bounce"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
            Scroll to explore
          </motion.div>
        </div>

        {/* 3D phone stage */}
        <div className="flex-1 flex items-center justify-center" style={{ perspective: "1200px" }}>
          {/* Outer: GSAP-driven scroll transforms */}
          <div
            ref={phoneOuterRef}
            style={{ transformStyle: "preserve-3d" as const, position: "relative" as const }}
          >
          {/* Inner: Framer Motion cursor tilt (only when unlocked) */}
          <motion.div
            style={{
              rotateX: unlocked ? tiltX : 0,
              rotateY: unlocked ? tiltY : 0,
              transformStyle: "preserve-3d",
              position: "relative",
            }}
          >
            {/* Dynamic shadow — grows as phone approaches */}
            <div
              className="absolute left-1/2 -bottom-8 -translate-x-1/2 rounded-full"
              style={{
                width: 260,
                height: 40,
                background: config.primaryColor,
                filter: `blur(${20 + scrollProgress * 70}px)`,
                opacity: 0.15 + scrollProgress * 0.5,
              }}
            />

            {/* Ring unlock flash */}
            <AnimatePresence>
              {unlockFlash && (
                <motion.div
                  key="ring"
                  className="absolute inset-0 rounded-[52px] pointer-events-none z-30"
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.18 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.0, 0.6, 0.4, 1] }}
                  style={{ border: `2px solid ${config.primaryColor}`, boxShadow: `0 0 40px 12px ${config.primaryColor}55` }}
                />
              )}
            </AnimatePresence>

            {/* Floating feature pills — appear at unlock, drift with cursor */}
            <AnimatePresence>
              {unlocked && (
                <>
                  {[
                    { label: "Loyalty", icon: "★", left: -215, top: 160 },
                    { label: "Order Ahead", icon: "↑", left: 332, top: 210 },
                    { label: "Push Alerts", icon: "◆", left: -200, top: 370 },
                  ].map((pill, i) => (
                    <motion.div
                      key={pill.label}
                      initial={{ opacity: 0, y: 12, scale: 0.75 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 220, damping: 22, delay: i * 0.12 + 0.15 }}
                      style={{ position: "absolute", left: pill.left, top: pill.top, x: pillDX, y: pillDY, zIndex: 40 }}
                      className="pointer-events-none"
                    >
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2.8 + i * 0.6, repeat: Infinity, ease: "easeInOut" }}
                        className="whitespace-nowrap bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg"
                      >
                        <span className="opacity-70">{pill.icon}</span>
                        <span>{pill.label}</span>
                      </motion.div>
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Phone — pointer events only when unlocked */}
            <div style={{ pointerEvents: unlocked ? "auto" : "none" }}>
              <BigPhone config={config} unlocked={unlocked} mouseX={mouseX} mouseY={mouseY} />
            </div>

            {/* Hints + Install CTA */}
            <AnimatePresence mode="wait">
              {!unlocked ? (
                <motion.div
                  key="scroll-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/30 text-xs tracking-widest uppercase"
                >
                  Keep scrolling
                </motion.div>
              ) : (
                <motion.div
                  key="unlocked-block"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                >
                  <div className="whitespace-nowrap text-white/40 text-xs tracking-widest uppercase">
                    Tap the tabs to explore
                  </div>
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-semibold shadow-lg transition-all hover:brightness-110 active:scale-95 cursor-pointer focus:outline-none"
                    style={{ background: config.primaryColor }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Install App
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
