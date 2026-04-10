"use client";

// ─── Design tokens ───────────────────────────────────────────────────────────
// Primary:   #4F46E5  Secondary: #7C3AED  CTA: #F97316
// BG:        #F8FAFC  Surface:   #FFFFFF  Text: #0F172A
// Muted:     #64748B  Border:    #E2E8F0  Success: #10B981
// Font: Plus Jakarta Sans
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const features = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    title: "Loyalty Rewards",
    description: "Keep customers coming back with punch cards, points, and custom rewards — all tracked automatically inside your app.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    ),
    title: "Online Ordering",
    description: "Let customers order ahead for pickup or delivery directly from your app. Menu management takes minutes, not hours.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
    title: "Push Notifications",
    description: "Reach every customer instantly with promotions, updates, and reminders — no social algorithm standing in the way.",
    color: "bg-orange-50 text-orange-500",
  },
];

const steps = [
  {
    number: "01",
    title: "Pick your business type",
    body: "Restaurant, salon, barbershop, retail — choose your category and we pre-fill the right features.",
  },
  {
    number: "02",
    title: "Add your brand",
    body: "Upload your logo, set your colors, and write your menu or service list. Takes under 10 minutes.",
  },
  {
    number: "03",
    title: "Launch to customers",
    body: "We publish your app to the App Store and Google Play. Share your link and customers download it instantly.",
  },
];

const testimonials = [
  {
    quote: "My regulars now order ahead every week. I went from $4k to $11k a month in just 3 months after launching the app.",
    name: "Marcus T.",
    role: "Owner, Smoke & Fire BBQ",
    initials: "MT",
    color: "#C2410C",
  },
  {
    quote: "I send a push notification on slow Tuesday afternoons and my chairs fill up within the hour. Nothing else comes close.",
    name: "Keisha R.",
    role: "Owner, Luxe Hair Studio",
    initials: "KR",
    color: "#7C3AED",
  },
  {
    quote: "We had zero tech experience. The setup took one afternoon. Now our loyalty program has 600 active members.",
    name: "David & Ana P.",
    role: "Owners, Panadería Los Olivos",
    initials: "DP",
    color: "#059669",
  },
  {
    quote: "LocalApp replaced our third-party delivery platform. We kept 30% more per order and our customers prefer it.",
    name: "Jenny L.",
    role: "Owner, Pho Garden",
    initials: "JL",
    color: "#0369A1",
  },
  {
    quote: "We built our app on a Friday. By Monday we had 80 customers on the loyalty program. It practically sells itself.",
    name: "Darius M.",
    role: "Owner, CutRight Barbershop",
    initials: "DM",
    color: "#B45309",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Get a branded app live with no upfront cost.",
    features: ["Branded mobile app", "Loyalty punch cards", "Up to 500 customers", "Email support"],
    cta: "Start building free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$29",
    period: "/mo",
    description: "Everything you need to drive repeat visits and revenue.",
    features: ["Everything in Free", "Online ordering", "Push notifications", "Up to 5,000 customers", "Priority support"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    description: "For high-volume businesses with multiple locations.",
    features: ["Everything in Growth", "Unlimited customers", "Multiple locations", "Custom domain", "Dedicated onboarding"],
    cta: "Start free trial",
    highlighted: false,
  },
];

const stats = [
  { value: "4,200+", label: "Local businesses" },
  { value: "2.1M", label: "App downloads" },
  { value: "38%", label: "Avg. revenue lift" },
  { value: "4.8★", label: "App Store rating" },
];

// ─── App screens shown during immersion ──────────────────────────────────────
const APP_SCREENS = [
  {
    label: "Home",
    bg: "#0D0D11",
    render: () => (
      <div className="flex flex-col h-full" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="px-6 pt-8 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[#C2410C] text-xs font-semibold tracking-widest uppercase">Smoke & Fire BBQ</p>
            <h2 className="text-white text-xl font-bold leading-tight mt-0.5">Welcome back</h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#C2410C]/20 border border-[#C2410C]/40 flex items-center justify-center">
            <svg width="20" height="20" fill="none" stroke="#C2410C" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" /></svg>
          </div>
        </div>
        <div className="mx-5 rounded-2xl p-5 mb-4" style={{ background: "linear-gradient(135deg, #C2410C, #9A3412)" }}>
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-2">Loyalty Card</p>
          <div className="flex gap-2 flex-wrap mb-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${i < 5 ? "bg-white border-white" : "border-white/40"}`}>
                {i < 5 && <svg width="12" height="12" fill="#C2410C" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>}
              </div>
            ))}
          </div>
          <p className="text-orange-100 text-xs">3 more stamps for a <span className="text-white font-bold">Free Brisket Plate</span></p>
        </div>
        <div className="mx-5">
          <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-3">Today's Special</p>
          <div className="rounded-xl bg-[#1A1A1E] border border-white/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Weekend Brisket Drop</p>
              <p className="text-[#9CA3AF] text-xs mt-0.5">First 20 plates only · Sat & Sun</p>
            </div>
            <span className="text-[#F59E0B] text-sm font-bold">$18</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Order",
    bg: "#0D0D11",
    render: () => (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-8 pb-4">
          <h2 className="text-white text-xl font-bold">Order Ahead</h2>
          <p className="text-[#9CA3AF] text-xs mt-1">Pickup · Est. 15 min</p>
        </div>
        <div className="flex-1 overflow-hidden px-5 space-y-3">
          {[
            { name: "Brisket Plate", desc: "Hickory-smoked 14hr", price: "$18" },
            { name: "Pulled Pork Sandwich", desc: "Oak-smoked · jalapeño slaw", price: "$12" },
            { name: "Smoked Ribs (Half Rack)", desc: "Fall-off-the-bone", price: "$22" },
            { name: "Loaded Fries", desc: "Brisket bits + queso", price: "$8" },
          ].map((item) => (
            <div key={item.name} className="rounded-xl bg-[#1A1A1E] border border-white/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold">{item.name}</p>
                <p className="text-[#6B7280] text-xs mt-0.5">{item.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#F59E0B] font-bold text-sm">{item.price}</span>
                <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#C2410C" }}>
                  <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} stroke="white" fill="none" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Loyalty",
    bg: "#0D0D11",
    render: () => (
      <div className="flex flex-col h-full items-center">
        <div className="px-6 pt-8 pb-6 text-center w-full">
          <h2 className="text-white text-xl font-bold">Your Rewards</h2>
          <p className="text-[#9CA3AF] text-xs mt-1">Smoke & Fire BBQ</p>
        </div>
        <div className="w-52 h-52 rounded-full flex items-center justify-center relative" style={{ background: "conic-gradient(#C2410C 0deg 225deg, #1A1A1E 225deg 360deg)" }}>
          <div className="w-40 h-40 rounded-full bg-[#0D0D11] flex flex-col items-center justify-center">
            <span className="text-white text-4xl font-black">5</span>
            <span className="text-[#9CA3AF] text-xs">of 8 stamps</span>
          </div>
        </div>
        <div className="mt-8 mx-5 w-full px-5">
          <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, #C2410C22, #9A341222)", border: "1px solid #C2410C44" }}>
            <p className="text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-1">Next Reward</p>
            <p className="text-white font-bold">Free Brisket Plate</p>
            <p className="text-[#9CA3AF] text-xs mt-1">3 more visits away</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Notify",
    bg: "#0D0D11",
    render: () => (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-8 pb-4">
          <h2 className="text-white text-xl font-bold">Notifications</h2>
        </div>
        <div className="flex-1 px-5 space-y-3">
          {[
            { icon: "🔥", title: "Weekend Special", body: "Smoked brisket just came off the pit. First 20 plates only.", time: "2m ago", unread: true },
            { icon: "⭐", title: "Stamp earned!", body: "You earned a stamp on your last visit. 3 more to go!", time: "3d ago", unread: false },
            { icon: "🎉", title: "Welcome to the app", body: "Thanks for joining! Earn your first stamp on your next visit.", time: "1w ago", unread: false },
          ].map((n) => (
            <div key={n.title} className={`rounded-xl p-4 border ${n.unread ? "bg-[#C2410C]/10 border-[#C2410C]/30" : "bg-[#1A1A1E] border-white/5"}`}>
              <div className="flex items-start gap-3">
                <span className="text-lg">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">{n.title}</p>
                  <p className="text-[#9CA3AF] text-xs mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[#6B7280] text-xs mt-1.5">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

// ─── Spotlight Card (cursor border fx from cinematic-modules) ────────────────
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mx", "-500px");
    e.currentTarget.style.setProperty("--my", "-500px");
  };
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group ${className}`}
      style={{ "--mx": "-500px", "--my": "-500px" } as React.CSSProperties}
    >
      {/* Spotlight fill */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(350px circle at var(--mx) var(--my), rgba(99,102,241,0.08), transparent 70%)" }}
      />
      {/* Spotlight border */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "radial-gradient(240px circle at var(--mx) var(--my), rgba(99,102,241,0.55), transparent 70%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />
      {children}
    </div>
  );
}

// ─── Immersion Section ────────────────────────────────────────────────────────
function ImmersionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth spring wrapper for buttery scroll feel
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  // Phone transform: 3D tilted small → flat full screen
  const rawScale = useTransform(progress, [0.08, 0.55], [0.3, 1]);
  const rawRotateY = useTransform(progress, [0.08, 0.45], [-22, 0]);
  const rawRotateX = useTransform(progress, [0.08, 0.45], [8, 0]);
  const rawRotateZ = useTransform(progress, [0.08, 0.45], [-4, 0]);
  const borderRadius = 44;
  const bezelOpacity = 1;
  const overlayOpacity = useTransform(progress, [0.5, 0.65], [0, 1]);
  const bgProgress = useTransform(progress, [0.35, 0.6], [0, 1]);

  const [isImmersed, setIsImmersed] = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);
  const navDir = useRef(1); // 1 = forward, -1 = back
  const [hintVisible, setHintVisible] = useState(false);
  const [resumeCountdown, setResumeCountdown] = useState(0);
  const [showScrollNudge, setShowScrollNudge] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SSR-safe viewport dimensions — initialized after mount, updates on resize
  const [vw, setVw] = useState(1440);
  const [vh, setVh] = useState(900);
  const [isTouch, setIsTouch] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setVw(window.innerWidth);
    setVh(window.innerHeight);
    setIsTouch(window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    return progress.on("change", (v) => {
      const nowImmersed = v > 0.62;
      setIsImmersed(nowImmersed);
      if (nowImmersed) setHintVisible(true);
    });
  }, [progress]);

  // Auto-advance: cycles every 3s when immersed, pauses on interaction, resumes after 10s idle
  const [autoAdvancePaused, setAutoAdvancePaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseAutoAdvance = useCallback(() => {
    setAutoAdvancePaused(true);
    // Clear any existing timers
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    // Start countdown display
    setResumeCountdown(10);
    countdownIntervalRef.current = setInterval(() => {
      setResumeCountdown((n) => {
        if (n <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    // Resume after 10s
    resumeTimerRef.current = setTimeout(() => {
      setAutoAdvancePaused(false);
      setResumeCountdown(0);
    }, 10000);
  }, []);

  // Reset idle timer on every navigation action
  const resetIdleTimer = useCallback(() => {
    setShowScrollNudge(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!reducedMotion) {
      idleTimerRef.current = setTimeout(() => setShowScrollNudge(true), 20000);
    }
  }, [reducedMotion]);

  // Start idle timer when immersion begins, clear when leaving
  useEffect(() => {
    if (!isImmersed) { setShowScrollNudge(false); return; }
    resetIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [isImmersed, resetIdleTimer]);

  // Arrow key navigation
  useEffect(() => {
    if (!isImmersed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        pauseAutoAdvance(); resetIdleTimer();
        navDir.current = 1;
        setActiveScreen((s) => (s + 1) % APP_SCREENS.length);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        pauseAutoAdvance(); resetIdleTimer();
        navDir.current = -1;
        setActiveScreen((s) => (s - 1 + APP_SCREENS.length) % APP_SCREENS.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isImmersed, pauseAutoAdvance, resetIdleTimer]);
  useEffect(() => {
    if (!isImmersed || autoAdvancePaused || reducedMotion) return;
    const t = setInterval(() => {
      navDir.current = 1;
      setActiveScreen((s) => (s + 1) % APP_SCREENS.length);
    }, 3000);
    return () => clearInterval(t);
  }, [isImmersed, autoAdvancePaused, reducedMotion]);

  // Touch swipe navigation with velocity skip
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const elapsed = Math.max(Date.now() - touchStartTime.current, 1);
    const velocity = Math.abs(delta) / elapsed; // px/ms
    const skip = velocity > 0.8 ? 2 : 1; // fast flick skips 2
    if (Math.abs(delta) > 44) {
      pauseAutoAdvance(); resetIdleTimer();
      if (delta < 0) {
        navDir.current = 1;
        setActiveScreen((s) => (s + skip) % APP_SCREENS.length);
      } else {
        navDir.current = -1;
        setActiveScreen((s) => (s - skip + APP_SCREENS.length) % APP_SCREENS.length);
      }
    }
  };

  // Dismiss hint after 4s
  useEffect(() => {
    if (!hintVisible) return;
    const t = setTimeout(() => setHintVisible(false), 4000);
    return () => clearTimeout(t);
  }, [hintVisible, activeScreen]);

  const bgColor = useMotionTemplate`rgba(13, 13, 17, ${bgProgress})`;

  // Header text crossfade: dark → white as background darkens
  const headerColor = useTransform(progress, [0.2, 0.42], ["#0F172A", "#FFFFFF"]);
  const subtitleColor = useTransform(progress, [0.2, 0.42], ["#64748B", "#94A3B8"]);
  const headerOpacity = useTransform(progress, [0.3, 0.52], [1, 0]);

  return (
    <section ref={containerRef} className="relative" style={{ height: "280vh" }}>
      {/* Background darkens as phone immerses */}
      <motion.div
        className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {/* Grain overlay — matches testimonials section depth */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-50"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />
        {/* Section header — color crossfades dark→white, then fades out */}
        <motion.div
          className="absolute top-16 left-0 right-0 text-center px-6 pointer-events-none"
          style={{ opacity: reducedMotion ? 1 : headerOpacity }}
        >
          <motion.h2
            className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3"
            style={{ color: reducedMotion ? "#0F172A" : headerColor }}
          >
            See your app before you build it
          </motion.h2>
          <motion.p
            className="text-base md:text-lg"
            style={{ color: reducedMotion ? "#64748B" : subtitleColor }}
          >
            Scroll to step inside the experience
          </motion.p>
        </motion.div>

        {/* Scroll cue arrow */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ opacity: useTransform(progress, [0.0, 0.2], [1, 0]) }}
        >
          <span className="text-xs text-[#94A3B8] font-medium tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 2, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: [0.33, 1, 0.68, 1], times: [0, 0.35, 0.55, 0.75, 1] }}
          >
            <svg width="20" height="20" fill="none" stroke="#94A3B8" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Perspective wrapper — phoneScale prevents bezel overflow on narrow viewports */}
        <div style={{ perspective: 900, transform: `scale(${Math.min(vw / 450, 1)})`, transformOrigin: "center center" }} className="relative flex items-center justify-center w-full h-full">
          <motion.div
            style={{
              scale: reducedMotion ? 1 : rawScale,
              rotateY: reducedMotion ? 0 : rawRotateY,
              rotateX: reducedMotion ? 0 : rawRotateX,
              rotateZ: reducedMotion ? 0 : rawRotateZ,
              transformStyle: "preserve-3d",
              width: "100vw",
              height: "100vh",
              maxWidth: "100vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Phone bezel frame — fades as screen expands */}
            <motion.div
              className="absolute pointer-events-none z-10"
              style={{
                opacity: bezelOpacity,
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* This is purely visual framing — the bezel dims away */}
              <div
                style={{
                  width: 414,
                  height: 870,
                  borderRadius: 54,
                  background: "linear-gradient(155deg, #2C2C30 0%, #1C1C20 40%, #0D0D11 100%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.12)",
                  padding: 10,
                }}
              >
                <div style={{ width: "100%", height: "100%", borderRadius: 40, overflow: "hidden", background: "#0D0D11" }} />
              </div>
            </motion.div>

            {/* The actual screen content — expands to fill viewport */}
            <motion.div
              className="relative overflow-hidden"
              style={{
                borderRadius: reducedMotion ? 44 : borderRadius,
                width: 390,
                height: 844,
                background: "#0D0D11",
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Peek ghost — next screen at reduced opacity, offset to the incoming edge */}
              {!reducedMotion && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    transform: `translateX(${navDir.current * 88}%)`,
                    opacity: 0.07,
                    filter: "blur(2px)",
                  }}
                >
                  {APP_SCREENS[(activeScreen + navDir.current + APP_SCREENS.length) % APP_SCREENS.length].render()}
                </div>
              )}
              {/* App screens — directional slide based on navDir */}
              <AnimatePresence mode="wait" custom={navDir.current}>
                <motion.div
                  key={activeScreen}
                  custom={navDir.current}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                    center: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: d * -40 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
                  className="absolute inset-0"
                >
                  {APP_SCREENS[activeScreen].render()}
                </motion.div>
              </AnimatePresence>

              {/* Fake status bar */}
              <div className="absolute top-0 left-0 right-0 h-11 flex items-start pt-3 px-5 justify-between pointer-events-none z-20">
                <span className="text-white text-xs font-semibold">9:41</span>
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="10" fill="white" viewBox="0 0 14 10"><rect x="0" y="3" width="2.5" height="7" rx="0.5" /><rect x="3.5" y="2" width="2.5" height="8" rx="0.5" /><rect x="7" y="0.5" width="2.5" height="9.5" rx="0.5" /><rect x="10.5" y="0" width="3" height="10" rx="0.5" /></svg>
                  <svg width="14" height="10" fill="white" viewBox="0 0 20 16"><path d="M10 3.5a9.5 9.5 0 0 1 6.3 2.4l1.5-1.5A11.5 11.5 0 0 0 10 1 11.5 11.5 0 0 0 2.2 4.4l1.5 1.5A9.5 9.5 0 0 1 10 3.5zm0 4a5.5 5.5 0 0 1 3.6 1.3l1.5-1.5A7.5 7.5 0 0 0 10 5.5a7.5 7.5 0 0 0-5.1 1.8l1.5 1.5A5.5 5.5 0 0 1 10 7.5zm0 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" /></svg>
                  <svg width="24" height="12" fill="none" viewBox="0 0 24 12"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.4" /><rect x="2" y="2" width="16" height="8" rx="2" fill="white" /><path d="M22 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity="0.4" /></svg>
                </div>
              </div>

              {/* Tab bar */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 border-t"
                style={{
                  background: "rgba(13,13,17,0.95)",
                  borderColor: "rgba(255,255,255,0.07)",
                  opacity: overlayOpacity,
                }}
              >
                {APP_SCREENS.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => { navDir.current = i > activeScreen ? 1 : -1; pauseAutoAdvance(); resetIdleTimer(); setActiveScreen(i); }}
                    className="flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center w-4 h-4">
                      {i === activeScreen && (
                        <motion.div
                          key={`ring-${activeScreen}`}
                          className="absolute rounded-full border border-[#C2410C]"
                          initial={{ width: 6, height: 6, opacity: 0.9 }}
                          animate={{ width: 16, height: 16, opacity: 0 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      )}
                      <div
                        className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                        style={{ background: i === activeScreen ? "#C2410C" : "rgba(255,255,255,0.2)" }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-semibold transition-colors duration-200"
                      style={{ color: i === activeScreen ? "#C2410C" : "#6B7280" }}
                    >
                      {s.label}
                    </span>
                  </button>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Navigation hint — arrow keys on desktop, swipe on touch */}
        <AnimatePresence>
          {hintVisible && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 pointer-events-none"
            >
              {isTouch ? (
                <>
                  <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <span className="text-white/60 text-xs font-medium">Swipe to navigate</span>
                  <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </>
              ) : (
                <>
                  <kbd className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 text-white text-xs font-mono border border-white/20">←</kbd>
                  <span className="text-white/60 text-xs font-medium">Navigate screens</span>
                  <kbd className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 text-white text-xs font-mono border border-white/20">→</kbd>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen label + position chip */}
        <motion.div
          className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-3"
          style={{ opacity: overlayOpacity }}
        >
          {/* Active screen name + counter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22 }}
              className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5"
            >
              <span className="text-white text-xs font-semibold">{APP_SCREENS[activeScreen].label}</span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-white/50 text-xs font-mono">{activeScreen + 1}/{APP_SCREENS.length}</span>
            </motion.div>
          </AnimatePresence>
          {/* Resume countdown ghost */}
          <AnimatePresence>
            {autoAdvancePaused && resumeCountdown > 0 && !reducedMotion && (
              <motion.span
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-white/25 text-[10px] font-mono tabular-nums"
              >
                resuming in {resumeCountdown}s
              </motion.span>
            )}
          </AnimatePresence>
          {/* Dot track — tap to jump, active dot has drain bar */}
          <div className="flex gap-1.5 pointer-events-auto">
            {APP_SCREENS.map((_, i) => (
              <button
                key={i}
                onClick={() => { navDir.current = i > activeScreen ? 1 : -1; pauseAutoAdvance(); resetIdleTimer(); setActiveScreen(i); }}
                aria-label={`Go to screen ${i + 1}`}
                className="relative cursor-pointer overflow-hidden rounded-full"
                style={{
                  width: i === activeScreen ? 16 : 4,
                  height: 4,
                  background: i === activeScreen ? "rgba(194,65,12,0.3)" : "rgba(255,255,255,0.2)",
                  border: "none",
                  padding: 0,
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              >
                {i === activeScreen && !autoAdvancePaused && !reducedMotion && (
                  <motion.div
                    key={`drain-${activeScreen}`}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: "#C2410C" }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                )}
                {i === activeScreen && (autoAdvancePaused || reducedMotion) && (
                  <div className="absolute inset-0 rounded-full" style={{ background: "#C2410C" }} />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Try on your phone — appears when immersed */}
        <AnimatePresence>
          {isImmersed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute top-[4.5rem] right-6 pointer-events-auto"
            >
              <a
                href="#"
                className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white/80 transition-colors duration-200 border border-white/10 hover:border-white/25 rounded-full px-3 py-1.5 bg-black/40 backdrop-blur-sm"
                onClick={(e) => e.preventDefault()}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" strokeLinecap="round" strokeWidth={2.5} />
                </svg>
                Try on your phone
              </a>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Scroll-to-continue nudge — appears after 20s idle while immersed */}
        <AnimatePresence>
          {showScrollNudge && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2"
            >
              <span className="text-white/30 text-xs font-medium tracking-widest uppercase">scroll to continue</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

// ─── Testimonials Carousel ────────────────────────────────────────────────────
function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dir = useRef(1);

  const advance = useCallback((next: number) => {
    dir.current = next > active ? 1 : -1;
    setActive(next);
  }, [active]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      dir.current = 1;
      setActive((s) => (s + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return (
    <section
      className="relative overflow-hidden py-28"
      style={{ background: "linear-gradient(160deg, #0F0F1A 0%, #1A0D2E 50%, #0D1117 100%)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #4F46E5, transparent)" }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }} />

      {/* Grain overlay — SVG turbulence noise for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">Social Proof</p>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Real businesses, real results
          </h2>
          <p className="text-slate-400 text-lg">
            Join 4,200+ local businesses already running their own app.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative min-h-[13rem] overflow-hidden" style={{ perspective: 800 }}>
          <AnimatePresence custom={dir.current} mode="wait">
            <motion.figure
              key={active}
              custom={dir.current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 flex flex-col items-center text-center px-4"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black mb-5 shadow-lg"
                style={{ background: testimonials[active].color }}
              >
                {testimonials[active].initials}
              </div>
              <blockquote className="text-white text-base md:text-xl font-medium leading-relaxed mb-5 max-w-2xl">
                &ldquo;{testimonials[active].quote}&rdquo;
              </blockquote>
              <figcaption>
                <div className="text-white font-semibold text-sm">{testimonials[active].name}</div>
                <div className="text-slate-400 text-xs mt-0.5">{testimonials[active].role}</div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Dot + arrow controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => advance((active - 1 + testimonials.length) % testimonials.length)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => advance(i)}
                className="cursor-pointer transition-all duration-300"
                aria-label={`Go to testimonial ${i + 1}`}
                style={{
                  width: i === active ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === active ? "#4F46E5" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => advance((active + 1) % testimonials.length)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer"
            aria-label="Next testimonial"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Sticky Parallax Stack (GSAP ScrollTrigger) ──────────────────────────────
// ─── Split Scroll: Features (left ↓) + Process (right ↑) ────────────────────
function SplitScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (prefersReduced || isMobile) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const count = 3;
      const itemH = window.innerHeight;
      const trigger = {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      };

      gsap.to(leftColRef.current, { y: -(count - 1) * itemH, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(rightColRef.current, { y: -(count - 1) * itemH }, { y: 0, ease: "none", scrollTrigger: trigger });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative md:h-[300vh]" id="features">
      {/* Desktop sticky container */}
      <div className="flex flex-col md:flex-row md:sticky md:top-0 md:h-dvh md:overflow-hidden">

        {/* ── Left: Core Features (scrolls down on desktop) ────────── */}
        <div className="flex-1 relative" style={{ background: "#070C16" }}>
          <p className="hidden md:block absolute top-7 left-8 z-10 text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-400 pointer-events-none">
            Core Features
          </p>
          <div ref={leftColRef} className="md:absolute md:inset-x-0 md:[will-change:transform]">
            {features.map((f) => {
              const iconColor =
                f.color === "bg-indigo-50 text-indigo-600"
                  ? "bg-indigo-900/25 text-indigo-400"
                  : f.color === "bg-violet-50 text-violet-600"
                  ? "bg-violet-900/25 text-violet-400"
                  : "bg-orange-900/25 text-orange-400";
              return (
                <div key={f.title} className="flex items-center justify-center px-10 py-20 md:h-screen">
                  <div className="max-w-xs w-full">
                    <div className={`w-14 h-14 rounded-xl ${iconColor} flex items-center justify-center mb-7`}>
                      {f.icon}
                    </div>
                    <h3 className="text-2xl md:text-[1.75rem] font-bold text-white tracking-tight mb-3">{f.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Ambient */}
          <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #4F46E5, transparent)" }} />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px flex-shrink-0 bg-white/10" />
        <div className="block md:hidden h-px w-full bg-white/10" />

        {/* ── Right: How It Works (scrolls up on desktop) ───────────── */}
        <div className="flex-1 relative" id="how-it-works" style={{ background: "#0A1020" }}>
          <p className="hidden md:block absolute top-7 right-8 z-10 text-[10px] font-bold tracking-[0.22em] uppercase text-violet-400 pointer-events-none">
            How It Works
          </p>
          <div ref={rightColRef} className="md:absolute md:inset-x-0 md:[will-change:transform]">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center justify-center px-10 py-20 md:h-screen">
                <div className="max-w-xs w-full">
                  <div className="text-[4.5rem] font-extrabold leading-none mb-5 tabular-nums" style={{ color: "rgba(124,58,237,0.18)" }}>
                    {step.number}
                  </div>
                  <h3 className="text-2xl md:text-[1.75rem] font-bold text-white tracking-tight mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Ambient */}
          <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }} />
        </div>

      </div>
    </section>
  );
}

function StickyParallaxStack() {
  return (
    <div className="relative md:pb-16">
      <div
        className="overflow-hidden md:mx-6 md:rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
      >
        <TestimonialsCarousel />
      </div>
    </div>
  );
}

// ─── Custom button primitives ────────────────────────────────────────────────
/** Primary CTA — gradient fill with shimmer sweep on hover */
function PrimaryButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 cursor-pointer ${className}`}
      style={{
        background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
        borderRadius: 14,
        padding: "14px 32px",
        fontSize: 17,
        boxShadow: "0 4px 24px rgba(249,115,22,0.35), 0 1px 0 rgba(255,255,255,0.15) inset",
      }}
    >
      {/* shimmer */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
          borderRadius: 14,
        }}
        aria-hidden="true"
      />
      {children}
    </a>
  );
}

/** Ghost button — outlined with gradient border and fill-on-hover */
function GhostButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`group relative inline-flex items-center justify-center gap-2 font-semibold text-[#0F172A] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 cursor-pointer overflow-hidden transition-colors duration-200 ${className}`}
      style={{
        borderRadius: 14,
        padding: "14px 32px",
        fontSize: 17,
        background: "white",
        border: "1.5px solid #E2E8F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
        aria-hidden="true"
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </a>
  );
}

/** Small nav CTA */
function NavCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative inline-flex items-center gap-1.5 font-semibold text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 cursor-pointer overflow-hidden group"
      style={{
        background: "linear-gradient(135deg, #F97316, #EA580C)",
        borderRadius: 10,
        padding: "9px 20px",
        boxShadow: "0 2px 12px rgba(249,115,22,0.3)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "linear-gradient(135deg, #EA580C, #C2410C)" }}
        aria-hidden="true"
      />
      <span className="relative z-10">{children}</span>
    </a>
  );
}

/** Plan card CTA */
function PlanButton({ href, highlighted, children }: { href: string; highlighted: boolean; children: React.ReactNode }) {
  if (highlighted) {
    return (
      <a
        href={href}
        className="group relative block w-full text-center font-bold text-white overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 focus:ring-offset-[#4F46E5] cursor-pointer"
        style={{ borderRadius: 12, padding: "13px 0", background: "linear-gradient(135deg, #F97316, #EA580C)", boxShadow: "0 3px 16px rgba(249,115,22,0.4)" }}
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-600" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} aria-hidden="true" />
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      className="block w-full text-center font-semibold text-[#4F46E5] hover:text-white transition-colors duration-200 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 cursor-pointer"
      style={{ borderRadius: 12, padding: "13px 0", background: "#F1F0FE", border: "1.5px solid #C7D2FE" }}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }} aria-hidden="true" />
      <span className="relative z-10">{children}</span>
    </a>
  );
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(phrases: string[], typingSpeed = 60, deletingSpeed = 30, pauseMs = 1800) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx];

    if (!deleting && displayed === phrase) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }

    if (deleting && displayed === "") {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
      return;
    }

    const t = setTimeout(
      () => setDisplayed(deleting ? displayed.slice(0, -1) : phrase.slice(0, displayed.length + 1)),
      deleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(t);
  }, [displayed, deleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const heroTyped = useTypewriter([
    "its own app",
    "loyal customers",
    "online ordering",
    "push notifications",
  ]);

  return (
    <>
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#E2E8F0]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center" aria-hidden="true">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" />
              </svg>
            </div>
            <span className="text-[#0F172A] font-bold text-lg tracking-tight">LocalApp</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <a href="#features" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">Features</a>
            <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">How it works</a>
            <a href="#pricing" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">Pricing</a>
          </div>

          <NavCTA href="#pricing">Start free trial</NavCTA>
        </nav>
      </header>

      <main>
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" aria-hidden="true" />
            No code. No agency. No waiting.
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0F172A] leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
            Your business deserves{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent whitespace-nowrap">
              {heroTyped}
              <motion.span
                aria-hidden="true"
                className="inline-block w-[3px] h-[0.8em] bg-[#4F46E5] ml-[2px] align-middle rounded-[1px]"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.45, 0.45, 1], ease: "linear" }}
              />
            </span>
          </h1>

          <p className="text-xl text-[#64748B] leading-relaxed max-w-2xl mx-auto mb-10">
            Give your restaurant, salon, or shop a branded mobile app with loyalty rewards,
            online ordering, and push notifications — set up in one afternoon.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <PrimaryButton href="#pricing" className="w-full sm:w-auto">
              Build your app free
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </PrimaryButton>
            <GhostButton href="/dashboard?demo=true" className="w-full sm:w-auto">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Try a live demo
            </GhostButton>
          </div>

          <p className="text-sm text-[#64748B]">
            14-day free trial. No credit card required.{" "}
            <a href="#how-it-works" className="text-[#4F46E5] hover:underline focus:outline-none focus:underline">See how it works.</a>
          </p>
        </section>

        {/* ── Stats bar ───────────────────────────────────────────────────── */}
        <section className="border-y border-[#E2E8F0] bg-white" aria-label="Key metrics">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-[#4F46E5] leading-none mb-1">{s.value}</div>
                <div className="text-sm text-[#64748B] font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Phone Immersion ─────────────────────────────────────────────── */}
        <ImmersionSection />

        {/* ── Split Scroll: Features ↓ / Process ↑ ───────────────────────── */}
        <SplitScrollSection />

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <StickyParallaxStack />

        {/* ── Pricing ─────────────────────────────────────────────────────── */}
        <section id="pricing" className="bg-white border-t border-[#E2E8F0]">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
                Simple, honest pricing
              </h2>
              <p className="text-lg text-[#64748B]">
                No setup fees. No contracts. Cancel any time.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-5 md:p-8 border transition-shadow duration-200 ${
                    plan.highlighted
                      ? "bg-gradient-to-b from-[#4F46E5] to-[#4338CA] border-[#4F46E5] shadow-xl shadow-indigo-200 text-white relative"
                      : "bg-white border-[#E2E8F0] shadow-[0_2px_12px_rgba(79,70,229,0.06)]"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap" style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", boxShadow: "0 2px 12px rgba(249,115,22,0.4)" }}>
                      Most popular
                    </div>
                  )}

                  <div className={`text-sm font-semibold mb-2 ${plan.highlighted ? "text-indigo-200" : "text-[#64748B]"}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-5xl font-extrabold leading-none ${plan.highlighted ? "text-white" : "text-[#0F172A]"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg font-medium mb-1 ${plan.highlighted ? "text-indigo-200" : "text-[#64748B]"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed mb-8 ${plan.highlighted ? "text-indigo-100" : "text-[#64748B]"}`}>
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={plan.highlighted ? "text-indigo-200 shrink-0" : "text-[#10B981] shrink-0"} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className={plan.highlighted ? "text-indigo-50" : "text-[#0F172A]"}>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <PlanButton href="#" highlighted={plan.highlighted}>{plan.cta}</PlanButton>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-3xl px-6 py-12 md:px-8 md:py-16 shadow-xl shadow-indigo-200">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ready to launch your app?
            </h2>
            <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-10">
              Join 4,200+ local businesses that already have their own branded app. Start your 14-day free trial today.
            </p>
            <a
              href="#pricing"
              className="group relative inline-flex items-center gap-2 font-bold text-white text-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", borderRadius: 14, padding: "16px 40px", boxShadow: "0 4px 24px rgba(249,115,22,0.45)" }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} aria-hidden="true" />
              Build your app free
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <p className="text-indigo-200 text-sm mt-4">No credit card required. Cancel any time.</p>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center" aria-hidden="true">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" />
              </svg>
            </div>
            <span className="font-bold text-[#0F172A]">LocalApp</span>
          </div>
          <p className="text-sm text-[#64748B]">© {new Date().getFullYear()} LocalApp. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[#64748B]">
            <a href="#" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">Privacy</a>
            <a href="#" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">Terms</a>
            <a href="#" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
