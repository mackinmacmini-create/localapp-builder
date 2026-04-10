"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type AppConfig, DEMO_CONFIG } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────
type PlanTier = "free" | "growth" | "pro" | "agency";
type NavItem = { id: string; label: string; icon: React.ReactNode };

// ─── Plan Tiers ───────────────────────────────────────────────────────────────
const TIER_RANK: Record<PlanTier, number> = { free: 0, growth: 1, pro: 2, agency: 3 };
const TIER_LABELS: Record<PlanTier, string> = { free: "Free", growth: "Growth", pro: "Pro", agency: "Agency" };
const TIER_PRICES: Record<PlanTier, string> = { free: "$0", growth: "$29", pro: "$79", agency: "$149" };
const TIER_COLOR: Record<PlanTier, string> = {
  free: "#64748B",
  growth: "#10B981",
  pro: "#4F46E5",
  agency: "#7C3AED",
};

type TierFeature = { label: string; free: boolean | string; growth: boolean | string; pro: boolean | string; agency: boolean | string };
const TIER_FEATURES: TierFeature[] = [
  { label: "Apps",                  free: "1 app",       growth: "1 app",         pro: "3 apps",     agency: "10 apps" },
  { label: "Templates",             free: "1 (default)", growth: "4 templates",   pro: "All 8",      agency: "All 8" },
  { label: "UX layouts",            free: false,         growth: false,           pro: "6 layouts",  agency: "6 layouts" },
  { label: "Animation styles",      free: false,         growth: false,           pro: true,         agency: true },
  { label: "Custom fonts",          free: false,         growth: "5 choices",     pro: true,         agency: true },
  { label: "Gradient/glass themes", free: false,         growth: false,           pro: true,         agency: true },
  { label: "Remove watermark",      free: false,         growth: true,            pro: true,         agency: true },
  { label: "Push notifications",    free: "3/mo",        growth: "Unlimited",     pro: "Unlimited",  agency: "Unlimited" },
  { label: "Analytics",             free: "Basic",       growth: "Full",          pro: "Advanced",   agency: "Advanced" },
  { label: "Custom domain",         free: false,         growth: false,           pro: true,         agency: true },
  { label: "AI content writer",     free: false,         growth: true,            pro: true,         agency: true },
  { label: "Multiple locations",    free: false,         growth: "Up to 3",       pro: "Unlimited",  agency: "Unlimited" },
  { label: "Team members",          free: false,         growth: false,           pro: "Up to 3",    agency: "Unlimited" },
  { label: "White-label",           free: false,         growth: false,           pro: false,        agency: true },
  { label: "API access",            free: false,         growth: false,           pro: false,        agency: true },
  { label: "Priority support",      free: false,         growth: false,           pro: true,         agency: true },
];

function canAccess(userPlan: PlanTier, requiredPlan: PlanTier) {
  return TIER_RANK[userPlan] >= TIER_RANK[requiredPlan];
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const icons = {
  layout: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  ),
  star: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  cart: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
  cog: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  palette: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
    </svg>
  ),
  chart: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  phone: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" />
    </svg>
  ),
  mapPin: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  sparkles: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  ),
};

const NAV_ITEMS: NavItem[] = [
  { id: "branding", label: "Branding", icon: icons.layout },
  { id: "appearance", label: "Appearance", icon: icons.palette },
  { id: "locations", label: "Locations", icon: icons.mapPin },
  { id: "loyalty", label: "Loyalty", icon: icons.star },
  { id: "ordering", label: "Ordering", icon: icons.cart },
  { id: "notifications", label: "Notifications", icon: icons.bell },
  { id: "analytics", label: "Analytics", icon: icons.chart },
  { id: "settings", label: "Settings", icon: icons.cog },
];

const CATEGORIES = [
  { value: "Restaurant", emoji: "🍽️" },
  { value: "Cafe", emoji: "☕" },
  { value: "Barbershop", emoji: "✂️" },
  { value: "Hair Salon", emoji: "💇" },
  { value: "Nail Salon", emoji: "💅" },
  { value: "Retail", emoji: "🛍️" },
  { value: "Gym / Fitness", emoji: "💪" },
  { value: "Other", emoji: "🏪" },
];

const COLOR_PRESETS = [
  { primary: "#4F46E5", accent: "#F97316", name: "Indigo" },
  { primary: "#0EA5E9", accent: "#10B981", name: "Sky" },
  { primary: "#DC2626", accent: "#F59E0B", name: "Red" },
  { primary: "#7C3AED", accent: "#EC4899", name: "Violet" },
  { primary: "#0F172A", accent: "#F97316", name: "Slate" },
  { primary: "#059669", accent: "#F59E0B", name: "Emerald" },
  { primary: "#F43F5E", accent: "#FB923C", name: "Rose" },
  { primary: "#D97706", accent: "#10B981", name: "Amber" },
  { primary: "#0D9488", accent: "#6366F1", name: "Teal" },
  { primary: "#DB2777", accent: "#A78BFA", name: "Pink" },
  { primary: "#1E3A8A", accent: "#38BDF8", name: "Navy" },
  { primary: "#0891B2", accent: "#F0ABFC", name: "Cyan" },
  { primary: "#7E22CE", accent: "#FCD34D", name: "Grape" },
  { primary: "#166534", accent: "#FDE68A", name: "Forest" },
];

// ─── Onboarding Wizard ────────────────────────────────────────────────────────
const WIZARD_STEPS = ["Name", "Category", "Colors", "Launch"];

function OnboardingWizard({
  onComplete,
  onDemo,
}: {
  onComplete: (partial: Partial<AppConfig>) => void;
  onDemo: () => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("");
  const [primary, setPrimary] = useState("#4F46E5");
  const [accent, setAccent] = useState("#F97316");
  const [launching, setLaunching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) inputRef.current?.focus();
  }, [step]);

  const canAdvance = [name.trim().length > 0, category !== "", true, true][step];

  const advance = () => {
    if (step < WIZARD_STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => {
      onComplete({ businessName: name.trim(), tagline: tagline.trim(), category, primaryColor: primary, accentColor: accent });
    }, 900);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white">
              {icons.phone}
            </div>
            <span className="font-bold text-[#0F172A] text-lg tracking-tight">LocalApp</span>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2 mb-6">
            {WIZARD_STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-[#4F46E5] text-white"
                      : i === step
                      ? "bg-[#4F46E5] text-white ring-4 ring-indigo-100"
                      : "bg-[#E2E8F0] text-[#94A3B8]"
                  }`}
                >
                  {i < step ? icons.check : i + 1}
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 rounded transition-all duration-500 ${i < step ? "bg-[#4F46E5]" : "bg-[#E2E8F0]"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A] mb-1">What&apos;s your business called?</h2>
                    <p className="text-sm text-[#64748B]">This becomes the name shown in your app.</p>
                  </div>
                  <div>
                    <label htmlFor="wiz-name" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Business name</label>
                    <input
                      ref={inputRef}
                      id="wiz-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && canAdvance && advance()}
                      placeholder="e.g. Smoke & Fire BBQ"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="wiz-tagline" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                      Tagline <span className="text-[#94A3B8] font-normal">(optional)</span>
                    </label>
                    <input
                      id="wiz-tagline"
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && canAdvance && advance()}
                      placeholder="e.g. Real BBQ. Real slow."
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A] mb-1">What kind of business?</h2>
                    <p className="text-sm text-[#64748B]">We&apos;ll suggest the right features for your category.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] ${
                          category === cat.value
                            ? "border-[#4F46E5] bg-indigo-50"
                            : "border-[#E2E8F0] hover:border-[#C7D2FE] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <span className="text-xl leading-none">{cat.emoji}</span>
                        <span className={`text-[10px] font-semibold text-center leading-tight ${category === cat.value ? "text-[#4F46E5]" : "text-[#64748B]"}`}>
                          {cat.value}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A] mb-1">Pick your colors</h2>
                    <p className="text-sm text-[#64748B]">Choose a palette that matches your brand.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.primary}
                        onClick={() => { setPrimary(preset.primary); setAccent(preset.accent); }}
                        className={`relative h-16 rounded-xl cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] overflow-hidden ${
                          primary === preset.primary ? "ring-2 ring-offset-2 ring-[#4F46E5] scale-105" : "hover:scale-102 hover:opacity-90"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${preset.primary} 55%, ${preset.accent} 55%)` }}
                        aria-label={`${preset.name} color preset`}
                        aria-pressed={primary === preset.primary}
                      >
                        <span className="absolute bottom-1.5 left-2 text-white text-[10px] font-bold drop-shadow">{preset.name}</span>
                        {primary === preset.primary && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                          >
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#4F46E5" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="text-center py-2">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{ boxShadow: `0 8px 32px ${primary}55` }}
                    >
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
                      </svg>
                    </motion.div>
                    <h2 className="text-xl font-bold text-[#0F172A] mb-1">Your app is ready to build</h2>
                    <p className="text-sm text-[#64748B]">
                      <span className="font-semibold text-[#0F172A]">{name}</span> — {category}
                    </p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
                    {[
                      { label: "Loyalty rewards", enabled: true },
                      { label: "Online ordering", enabled: true },
                      { label: "Push notifications", enabled: true },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-[#0F172A] font-medium">{f.label}</span>
                        <div className="flex items-center gap-1.5 text-[#10B981]">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          <span className="text-xs font-semibold">Included</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center justify-between">
          {step > 0 && step < 3 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium transition-colors cursor-pointer focus:outline-none focus:underline"
            >
              Back
            </button>
          ) : step === 0 ? (
            <button
              onClick={onDemo}
              className="text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium transition-colors cursor-pointer focus:outline-none focus:underline"
            >
              Try a demo
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={advance}
              disabled={!canAdvance}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 ${
                canAdvance
                  ? "bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm hover:shadow"
                  : "bg-[#C7D2FE] cursor-not-allowed"
              }`}
            >
              Continue
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <motion.button
              onClick={handleLaunch}
              disabled={launching}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 disabled:opacity-70"
            >
              {launching ? (
                <>
                  <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Launching...
                </>
              ) : (
                <>
                  Open builder
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Phone Preview ────────────────────────────────────────────────────────────
function PhonePreview({ config, plan = "free" }: { config: AppConfig; plan?: PlanTier }) {
  const [activeTab, setActiveTab] = useState(0);

  // Normalized -1 to 1 across full viewport for wide-range rotation
  // Default resting pose: slight right-and-up tilt so phone is visibly 3D before any mouse movement
  const rawX = useMotionValue(0.32);
  const rawY = useMotionValue(-0.18);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  // Near-rotatable tilt — sweep left/right for full ±52° rotation, heavier spring
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-52, 52]), { stiffness: 260, damping: 22 });
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [28, -28]), { stiffness: 260, damping: 22 });
  const rotateZ = useSpring(useTransform(rawX, [-1, 1], [3.5, -3.5]), { stiffness: 260, damping: 22 });
  const translateX = useSpring(useTransform(rawX, [-1, 1], [-18, 18]), { stiffness: 260, damping: 22 });

  // Dynamic glare — simulates light source shifting across titanium shell
  const glareX = useTransform(rawX, [-1, 1], [15, 85]);
  const glareY = useTransform(rawY, [-1, 1], [15, 85]);
  const glareBg = useMotionTemplate`radial-gradient(ellipse 55% 45% at ${glareX}% ${glareY}%, rgba(255,255,255,0.14) 0%, transparent 72%)`;

  // Floor shadow shifts opposite to tilt direction
  const shadowX = useTransform(rawX, [-1, 1], [28, -28]);
  const shadowY = useTransform(rawY, [-1, 1], [-18, 18]);

  // Ambient glow drifts with mouse
  const glowX = useTransform(rawX, [-1, 1], [-20, 20]);
  const glowY = useTransform(rawY, [-1, 1], [-20, 20]);

  // Edge specular strips — each face brightens when rotated toward the camera
  const leftEdgeOpacity = useTransform(rawX, [-1, -0.05, 0.05, 1], [0.92, 0.08, 0.02, 0.0]);
  const rightEdgeOpacity = useTransform(rawX, [-1, -0.05, 0.05, 1], [0.0, 0.02, 0.08, 0.92]);
  const topEdgeOpacity = useTransform(rawY, [-1, -0.05, 0.05, 1], [0.80, 0.07, 0.02, 0.0]);
  const bottomEdgeOpacity = useTransform(rawY, [-1, -0.05, 0.05, 1], [0.0, 0.02, 0.07, 0.80]);

  // Directional rim light — box-shadow highlight travels around the shell edge
  const rimLX = useTransform(rawX, [-1, 1], [18, -18]);
  const rimLY = useTransform(rawY, [-1, 1], [11, -11]);
  const shellBoxShadow = useMotionTemplate`0 0 0 0.5px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.88), inset 0 1px 0 rgba(255,255,255,0.13), ${rimLX}px ${rimLY}px 38px rgba(205,218,255,0.22), 0 0 60px ${config.primaryColor}1a`;

  const tabs = [
    { label: "Home", path: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
    { label: "Order", path: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" },
    { label: "Loyalty", path: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" },
    { label: "Profile", path: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" },
  ];

  return (
    <div className="relative mx-auto select-none" style={{ width: 270 }}>
      {/* Ambient glow — drifts with mouse */}
      <motion.div
        className="absolute -inset-16 -z-10 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: config.primaryColor, x: glowX, y: glowY }}
      />

      {/* Live badge */}
      <div className="absolute -top-3 -right-3 z-20 bg-[#10B981] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Live
      </div>

      {/* Perspective ancestor — non-transforming so perspective doesn't collapse */}
      <div style={{ perspective: 750 }}>
        {/* Float loop — only drives vertical y */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Rotation layer — cursor-driven, full ±42° sweep */}
          <motion.div
            style={{
              rotateX,
              rotateY,
              rotateZ,
              x: translateX,
              transformStyle: "preserve-3d" as const,
            }}
          >
            {/* Physical side buttons */}
            <div className="absolute" style={{ left: -2.5, top: 112, width: 2.5, height: 20, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 4px rgba(0,0,0,0.8)" }} />
            <div className="absolute" style={{ left: -2.5, top: 142, width: 2.5, height: 46, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 4px rgba(0,0,0,0.8)" }} />
            <div className="absolute" style={{ left: -2.5, top: 198, width: 2.5, height: 46, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 4px rgba(0,0,0,0.8)" }} />
            <div className="absolute" style={{ right: -2.5, top: 170, width: 2.5, height: 68, borderRadius: "0 2px 2px 0", background: "linear-gradient(to right, #2e2e32, #1c1c1e)", boxShadow: "2px 0 4px rgba(0,0,0,0.8)" }} />

            {/* Titanium rim edge specular strips — light catches each face as it rotates toward camera */}
            <motion.div className="absolute pointer-events-none z-30 rounded-full" style={{ left: 0, top: 44, width: 3, bottom: 44, background: "linear-gradient(to bottom, transparent 0%, rgba(200,216,255,0.95) 25%, rgba(210,224,255,1) 50%, rgba(200,216,255,0.95) 75%, transparent 100%)", opacity: leftEdgeOpacity }} />
            <motion.div className="absolute pointer-events-none z-30 rounded-full" style={{ right: 0, top: 44, width: 3, bottom: 44, background: "linear-gradient(to bottom, transparent 0%, rgba(200,216,255,0.95) 25%, rgba(210,224,255,1) 50%, rgba(200,216,255,0.95) 75%, transparent 100%)", opacity: rightEdgeOpacity }} />
            <motion.div className="absolute pointer-events-none z-30 rounded-full" style={{ top: 0, left: 44, height: 3, right: 44, background: "linear-gradient(to right, transparent 0%, rgba(200,216,255,0.95) 25%, rgba(210,224,255,1) 50%, rgba(200,216,255,0.95) 75%, transparent 100%)", opacity: topEdgeOpacity }} />
            <motion.div className="absolute pointer-events-none z-30 rounded-full" style={{ bottom: 0, left: 44, height: 3, right: 44, background: "linear-gradient(to right, transparent 0%, rgba(200,216,255,0.95) 25%, rgba(210,224,255,1) 50%, rgba(200,216,255,0.95) 75%, transparent 100%)", opacity: bottomEdgeOpacity }} />

            {/* Titanium shell */}
            <motion.div
              className="relative rounded-[44px]"
              style={{
                background: "linear-gradient(155deg, #2C2C30 0%, #1C1C20 40%, #0D0D11 70%, #080B14 100%)",
                padding: "3px",
                boxShadow: shellBoxShadow,
              }}
            >
              {/* Dynamic glare — light source tracks mouse across titanium */}
              <motion.div
                className="absolute inset-0 rounded-[44px] pointer-events-none z-10"
                style={{ background: glareBg }}
              />

              <div className="rounded-[42px]" style={{ background: "#090B0F", padding: "2.5px" }}>
            {/* Dynamic island */}
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 w-[72px] h-6 rounded-full z-10"
              style={{ background: "#06080C", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.04)" }}
            />

            {/* Screen */}
            <div
              className={`rounded-[40px] overflow-hidden flex flex-col relative ${config.appTheme === "dark" ? "bg-[#0F172A]" : "bg-[#F8FAFC]"}`}
              style={{ height: 536 }}
            >
              {/* Status bar */}
              <div className="h-9 flex items-end justify-between px-5 pb-1.5 shrink-0" style={{ background: config.primaryColor }}>
                <span className="text-white text-[10px] font-semibold">9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5 items-end h-2.5">
                    {[2, 4, 6, 8].map((h, i) => <div key={i} className="w-0.5 bg-white/80 rounded-sm" style={{ height: h }} />)}
                  </div>
                  <div className="w-4 h-2 border border-white/80 rounded-sm relative">
                    <div className="absolute inset-0.5 left-0.5 bg-white/80 rounded-sm w-2" />
                  </div>
                </div>
              </div>

              {/* App header */}
              <div className="px-4 pt-2.5 pb-2.5 shrink-0" style={{ background: config.primaryColor }}>
                <div className="flex items-center gap-2">
                  {config.logoDataUrl ? (
                    <img src={config.logoDataUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover shrink-0 border-2 border-white/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">{(config.businessName || "A").charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white/70 text-[9px] font-medium uppercase tracking-widest mb-0.5">{config.category || "Restaurant"}</p>
                    <h3 className="text-white font-bold text-sm leading-tight truncate">{config.businessName || "Your Business"}</h3>
                    {config.tagline && <p className="text-white/60 text-[9px] mt-0.5 truncate">{config.tagline}</p>}
                  </div>
                </div>
              </div>

              {/* Screen content */}
              <div className="flex-1 overflow-hidden px-3 pt-3 space-y-2">
                {config.welcomeMessage && (
                  <div className="rounded-xl px-3 py-2 text-[9px] font-medium border" style={{ background: config.primaryColor + "15", borderColor: config.primaryColor + "30", color: config.primaryColor }}>
                    {config.welcomeMessage}
                  </div>
                )}
                {config.loyaltyEnabled && (
                  <div className="rounded-xl p-3 text-white text-[10px] shadow-sm cursor-pointer" style={{ background: config.accentColor }}>
                    <div className="font-bold mb-1.5">Your Rewards</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {Array.from({ length: Math.min(config.loyaltyStampsRequired, 10) }).map((_, i) => (
                        <div key={i} className={`w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center ${i < 3 ? "bg-white/90" : "bg-white/20"}`}>
                          {i < 3 && <div className="w-2 h-2 rounded-full" style={{ background: config.accentColor }} />}
                        </div>
                      ))}
                    </div>
                    <div className="text-white/80">3 / {config.loyaltyStampsRequired} stamps — earn {config.loyaltyRewardName || "a reward"}</div>
                  </div>
                )}
                {config.orderingEnabled && config.menuItems.length > 0 && (
                  <div className={`rounded-xl border p-3 shadow-sm ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-[#E2E8F0]"}`}>
                    <div className={`text-[10px] font-bold mb-2 ${config.appTheme === "dark" ? "text-white" : "text-[#0F172A]"}`}>Order Ahead</div>
                    <div className="space-y-1.5">
                      {config.menuItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span className={`text-[9px] font-medium ${config.appTheme === "dark" ? "text-[#CBD5E1]" : "text-[#0F172A]"}`}>{item.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-[#64748B]">{item.price}</span>
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: config.primaryColor }}>+</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {config.pushEnabled && config.notificationTitle && (
                  <div className={`rounded-xl border p-3 shadow-sm ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-[#E2E8F0]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: config.primaryColor }}>
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                      </div>
                      <span className={`text-[9px] font-bold ${config.appTheme === "dark" ? "text-white" : "text-[#0F172A]"}`}>{config.notificationTitle}</span>
                    </div>
                    <p className={`text-[8px] leading-relaxed pl-7 ${config.appTheme === "dark" ? "text-[#94A3B8]" : "text-[#64748B]"}`}>{config.notificationBody || "Tap to view"}</p>
                  </div>
                )}
                {(config.hours || config.phone) && (
                  <div className={`rounded-xl border divide-y ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155] divide-[#334155]" : "bg-white border-[#E2E8F0] divide-[#E2E8F0]"}`}>
                    {config.hours && (
                      <div className="flex items-center gap-2 px-3 py-2">
                        <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke={config.primaryColor} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        <span className={`text-[8px] truncate ${config.appTheme === "dark" ? "text-[#CBD5E1]" : "text-[#0F172A]"}`}>{config.hours}</span>
                      </div>
                    )}
                    {config.phone && (
                      <div className="flex items-center gap-2 px-3 py-2">
                        <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke={config.primaryColor} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                        <span className={`text-[8px] ${config.appTheme === "dark" ? "text-[#CBD5E1]" : "text-[#0F172A]"}`}>{config.phone}</span>
                      </div>
                    )}
                  </div>
                )}
                {!config.loyaltyEnabled && !config.orderingEnabled && !config.hours && !config.phone && (
                  <div className={`text-center py-8 text-[10px] ${config.appTheme === "dark" ? "text-[#475569]" : "text-[#94A3B8]"}`}>
                    Enable features to see them here
                  </div>
                )}
              </div>

              {/* Watermark — free plan only */}
              {plan === "free" && (
                <div className="shrink-0 py-1 text-center text-[7px] font-semibold tracking-widest uppercase" style={{ color: "#94A3B8", letterSpacing: "0.12em" }}>
                  Powered by LocalApp
                </div>
              )}

              {/* Bottom tab bar */}
              <div className={`shrink-0 px-2 py-2 border-t flex items-center justify-around ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-[#E2E8F0]"}`}>
                {tabs.map((t, i) => (
                  <button
                    key={t.label}
                    onClick={() => setActiveTab(i)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${activeTab === i ? "text-white" : config.appTheme === "dark" ? "text-[#475569]" : "text-[#94A3B8]"}`}
                      style={activeTab === i ? { background: config.primaryColor } : {}}
                    >
                      <svg width="10" height="10" fill={activeTab === i ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={t.path} />
                      </svg>
                    </div>
                    <span className={`text-[7px] font-medium ${activeTab === i ? (config.appTheme === "dark" ? "text-white" : "text-[#0F172A]") : config.appTheme === "dark" ? "text-[#475569]" : "text-[#94A3B8]"}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
            </motion.div>{/* end titanium shell */}
          </motion.div>{/* end rotation layer */}
        </motion.div>{/* end float loop */}
      </div>{/* end perspective ancestor */}

      {/* Floor shadow — shifts opposite direction to tilt */}
      <motion.div
        className="mx-auto rounded-full blur-2xl pointer-events-none"
        style={{
          width: 180,
          height: 20,
          background: "rgba(0,0,0,0.55)",
          x: shadowX,
          y: shadowY,
          marginTop: 8,
        }}
      />
    </div>
  );
}

// ─── Panel: Branding ─────────────────────────────────────────────────────────
function BrandingPanel({ config, set, plan, onUpgrade }: {
  config: AppConfig;
  set: (k: keyof AppConfig, v: AppConfig[keyof AppConfig]) => void;
  plan: PlanTier;
  onUpgrade: (highlight?: PlanTier) => void;
}) {
  const [aiWriting, setAiWriting] = useState<"tagline" | "about" | null>(null);

  const runAiWriter = (field: "tagline" | "about") => {
    if (!canAccess(plan, "growth")) { onUpgrade("growth"); return; }
    setAiWriting(field);
    setTimeout(() => {
      if (field === "tagline") {
        const taglines = [
          `${config.businessName ? config.businessName + " — " : ""}Where every visit feels like home.`,
          "Crafted with care. Served with pride.",
          "The best of the neighborhood, in your pocket.",
        ];
        set("tagline", taglines[Math.floor(Math.random() * taglines.length)]);
      } else {
        const about = `${config.businessName || "We"} ${config.category ? `is a beloved local ${config.category.toLowerCase()}` : "is a cherished local spot"} known for exceptional quality and warm service. Every detail is crafted to create an experience you'll want to return to, again and again.`;
        set("aboutText", about);
      }
      setAiWriting(null);
    }, 1400);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Branding</h2>
        <p className="text-sm text-[#64748B]">Set your business name, category, and colors.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Business name</label>
          <input
            id="businessName"
            type="text"
            value={config.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            placeholder="e.g. Smoke & Fire BBQ"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="tagline" className="block text-sm font-semibold text-[#0F172A]">Tagline <span className="text-[#94A3B8] font-normal">(optional)</span></label>
            <button
              onClick={() => runAiWriter("tagline")}
              disabled={aiWriting === "tagline"}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${canAccess(plan, "growth") ? "bg-[#4F46E5]/10 text-[#4F46E5] hover:bg-[#4F46E5]/20" : "bg-[#F1F5F9] text-[#64748B]"}`}
            >
              {aiWriting === "tagline" ? (
                <svg className="animate-spin" width="10" height="10" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} strokeDasharray="32" strokeDashoffset="12" /></svg>
              ) : icons.sparkles}
              {canAccess(plan, "growth") ? "Generate" : "Growth+"}
            </button>
          </div>
          <input
            id="tagline"
            type="text"
            value={config.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="e.g. Real BBQ. Real slow."
            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Business category</label>
          <select
            id="category"
            value={config.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-shadow bg-white cursor-pointer"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
          </select>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#0F172A] mb-3">Color preset</p>
          <div className="grid grid-cols-7 gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.primary}
                onClick={() => { set("primaryColor", preset.primary); set("accentColor", preset.accent); }}
                className={`h-9 rounded-xl cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] ${config.primaryColor === preset.primary ? "ring-2 ring-offset-2 ring-[#4F46E5] scale-110" : "hover:scale-105"}`}
                style={{ background: `linear-gradient(135deg, ${preset.primary} 50%, ${preset.accent} 50%)` }}
                aria-label={`${preset.name} color preset`}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="aboutText" className="block text-sm font-semibold text-[#0F172A]">About your business <span className="text-[#94A3B8] font-normal">(optional)</span></label>
            <button
              onClick={() => runAiWriter("about")}
              disabled={aiWriting === "about"}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${canAccess(plan, "growth") ? "bg-[#4F46E5]/10 text-[#4F46E5] hover:bg-[#4F46E5]/20" : "bg-[#F1F5F9] text-[#64748B]"}`}
            >
              {aiWriting === "about" ? (
                <svg className="animate-spin" width="10" height="10" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} strokeDasharray="32" strokeDashoffset="12" /></svg>
              ) : icons.sparkles}
              {canAccess(plan, "growth") ? "Generate" : "Growth+"}
            </button>
          </div>
          <textarea
            id="aboutText"
            rows={3}
            value={config.aboutText}
            onChange={(e) => set("aboutText", e.target.value)}
            placeholder="e.g. Award-winning BBQ since 2009, slow-smoked over oak wood..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Phone <span className="text-[#94A3B8] font-normal">(optional)</span></label>
            <input
              id="phone"
              type="tel"
              value={config.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Website <span className="text-[#94A3B8] font-normal">(optional)</span></label>
            <input
              id="website"
              type="url"
              value={config.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="yoursite.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="hours" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Hours <span className="text-[#94A3B8] font-normal">(optional)</span></label>
          <input
            id="hours"
            type="text"
            value={config.hours}
            onChange={(e) => set("hours", e.target.value)}
            placeholder="e.g. Mon–Sat 11am–9pm, Sun 12pm–7pm"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Primary</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] focus-within:ring-2 focus-within:ring-[#4F46E5] focus-within:border-transparent">
              <input type="color" id="primaryColor" value={config.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent" />
              <span className="text-sm font-mono text-[#64748B]">{config.primaryColor}</span>
            </div>
          </div>
          <div>
            <label htmlFor="accentColor" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Accent</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] focus-within:ring-2 focus-within:ring-[#4F46E5] focus-within:border-transparent">
              <input type="color" id="accentColor" value={config.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent" />
              <span className="text-sm font-mono text-[#64748B]">{config.accentColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Panel: Locations ────────────────────────────────────────────────────────
type LocationEntry = { id: string; name: string; address: string; hours: string; phone: string };

function LocationsPanel({ plan, onUpgrade }: { plan: PlanTier; onUpgrade: (highlight?: PlanTier) => void }) {
  const [locations, setLocations] = useState<LocationEntry[]>([
    { id: "1", name: "Main Location", address: "", hours: "", phone: "" },
  ]);

  const maxLocations = canAccess(plan, "pro") ? Infinity : canAccess(plan, "growth") ? 3 : 1;

  const addLocation = () => {
    if (locations.length >= maxLocations) { onUpgrade(canAccess(plan, "growth") ? "pro" : "growth"); return; }
    setLocations((prev) => [...prev, { id: Date.now().toString(), name: "", address: "", hours: "", phone: "" }]);
  };

  const updateLocation = (id: string, field: keyof LocationEntry, value: string) => {
    setLocations((prev) => prev.map((loc) => loc.id === id ? { ...loc, [field]: value } : loc));
  };

  const removeLocation = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Locations</h2>
        <p className="text-sm text-[#64748B]">Manage your business locations shown in the app.</p>
      </div>

      {!canAccess(plan, "growth") && (
        <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: `${TIER_COLOR.growth}10`, border: `1px solid ${TIER_COLOR.growth}30` }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR.growth} strokeWidth={2.5} className="mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
          <div>
            <div className="text-xs font-bold text-[#0F172A] mb-0.5">Multiple locations requires Growth+</div>
            <div className="text-[10px] text-[#64748B]">Free plan supports 1 location. Upgrade to add up to 3 (Growth) or unlimited (Pro).</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {locations.map((loc, idx) => (
          <div key={loc.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#0F172A]">Location {idx + 1}</span>
              {idx > 0 && (
                <button onClick={() => removeLocation(loc.id)} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors cursor-pointer" aria-label="Remove location">
                  {icons.trash}
                </button>
              )}
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                value={loc.name}
                onChange={(e) => updateLocation(loc.id, "name", e.target.value)}
                placeholder="Location name (e.g. Downtown)"
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
              <input
                type="text"
                value={loc.address}
                onChange={(e) => updateLocation(loc.id, "address", e.target.value)}
                placeholder="Address"
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={loc.hours}
                  onChange={(e) => updateLocation(loc.id, "hours", e.target.value)}
                  placeholder="Hours"
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
                <input
                  type="tel"
                  value={loc.phone}
                  onChange={(e) => updateLocation(loc.id, "phone", e.target.value)}
                  placeholder="Phone"
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addLocation}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors duration-150 cursor-pointer ${locations.length < maxLocations ? "border-[#E2E8F0] text-[#64748B] hover:border-[#4F46E5] hover:text-[#4F46E5]" : "border-[#E2E8F0] text-[#94A3B8]"}`}
      >
        {icons.plus}
        {locations.length < maxLocations ? "Add location" : `Upgrade for more locations (${locations.length}/${canAccess(plan, "growth") ? "3" : "1"} used)`}
      </button>
    </div>
  );
}

// ─── Panel: Loyalty ───────────────────────────────────────────────────────────
function LoyaltyPanel({ config, set }: { config: AppConfig; set: (k: keyof AppConfig, v: AppConfig[keyof AppConfig]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Loyalty Rewards</h2>
        <p className="text-sm text-[#64748B]">Set up a digital punch card to reward repeat customers.</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
        <div>
          <div className="text-sm font-semibold text-[#0F172A]">Enable loyalty program</div>
          <div className="text-xs text-[#64748B] mt-0.5">Show punch card in your app</div>
        </div>
        <button
          role="switch"
          aria-checked={config.loyaltyEnabled}
          onClick={() => set("loyaltyEnabled", !config.loyaltyEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 cursor-pointer ${config.loyaltyEnabled ? "bg-[#4F46E5]" : "bg-[#E2E8F0]"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${config.loyaltyEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      <AnimatePresence>
        {config.loyaltyEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <label htmlFor="loyaltyRewardName" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Reward name</label>
              <input
                id="loyaltyRewardName"
                type="text"
                value={config.loyaltyRewardName}
                onChange={(e) => set("loyaltyRewardName", e.target.value)}
                placeholder="e.g. Free item, Free coffee, 20% off"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="loyaltyStamps" className="text-sm font-semibold text-[#0F172A]">Stamps required</label>
                <span className="text-sm font-bold text-[#4F46E5]">{config.loyaltyStampsRequired}</span>
              </div>
              <input
                id="loyaltyStamps"
                type="range"
                min={4}
                max={16}
                step={1}
                value={config.loyaltyStampsRequired}
                onChange={(e) => set("loyaltyStampsRequired", Number(e.target.value))}
                className="w-full accent-[#4F46E5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] mt-0.5">
                <span>4</span><span>16</span>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="text-sm font-semibold text-indigo-900 mb-2">Punch card preview</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {Array.from({ length: config.loyaltyStampsRequired }).map((_, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${i < 3 ? "border-indigo-600 bg-indigo-600 text-white" : "border-indigo-200 text-indigo-300"}`}>
                    {i < 3 ? "✓" : i + 1}
                  </div>
                ))}
              </div>
              <p className="text-xs text-indigo-600 mt-2">3 of {config.loyaltyStampsRequired} stamps — earn {config.loyaltyRewardName || "a reward"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Panel: Ordering ─────────────────────────────────────────────────────────
function OrderingPanel({ config, set }: { config: AppConfig; set: (k: keyof AppConfig, v: AppConfig[keyof AppConfig]) => void }) {
  const addItem = () => set("menuItems", [...config.menuItems, { id: Date.now().toString(), name: "", price: "" }]);
  const removeItem = (id: string) => set("menuItems", config.menuItems.filter((item) => item.id !== id));
  const updateItem = (id: string, field: "name" | "price", value: string) =>
    set("menuItems", config.menuItems.map((item) => item.id === id ? { ...item, [field]: value } : item));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Online Ordering</h2>
        <p className="text-sm text-[#64748B]">Add menu items customers can order from your app.</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
        <div>
          <div className="text-sm font-semibold text-[#0F172A]">Enable online ordering</div>
          <div className="text-xs text-[#64748B] mt-0.5">Let customers order ahead</div>
        </div>
        <button
          role="switch"
          aria-checked={config.orderingEnabled}
          onClick={() => set("orderingEnabled", !config.orderingEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 cursor-pointer ${config.orderingEnabled ? "bg-[#4F46E5]" : "bg-[#E2E8F0]"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${config.orderingEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      <AnimatePresence>
        {config.orderingEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0F172A]">Menu items</p>
              <button onClick={addItem} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer focus:outline-none focus:underline">
                {icons.plus} Add item
              </button>
            </div>

            {config.menuItems.length === 0 && (
              <div className="text-center py-8 text-sm text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-xl">
                No menu items yet. Add your first item above.
              </div>
            )}

            <div className="space-y-2">
              {config.menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="flex items-center gap-2"
                >
                  <input type="text" value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} placeholder="Item name" aria-label="Menu item name" className="flex-1 px-3 py-2 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent" />
                  <input type="text" value={item.price} onChange={(e) => updateItem(item.id, "price", e.target.value)} placeholder="$0.00" aria-label="Menu item price" className="w-20 px-3 py-2 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent" />
                  <button onClick={() => removeItem(item.id)} aria-label="Remove item" className="p-2 text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg">
                    {icons.trash}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Panel: Notifications ─────────────────────────────────────────────────────
function NotificationsPanel({ config, set }: { config: AppConfig; set: (k: keyof AppConfig, v: AppConfig[keyof AppConfig]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Push Notifications</h2>
        <p className="text-sm text-[#64748B]">Send promotions and updates directly to your customers.</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
        <div>
          <div className="text-sm font-semibold text-[#0F172A]">Enable push notifications</div>
          <div className="text-xs text-[#64748B] mt-0.5">Reach customers in real time</div>
        </div>
        <button
          role="switch"
          aria-checked={config.pushEnabled}
          onClick={() => set("pushEnabled", !config.pushEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 cursor-pointer ${config.pushEnabled ? "bg-[#4F46E5]" : "bg-[#E2E8F0]"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${config.pushEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      <AnimatePresence>
        {config.pushEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <label htmlFor="notifTitle" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Notification title</label>
              <input id="notifTitle" type="text" value={config.notificationTitle} onChange={(e) => set("notificationTitle", e.target.value)} placeholder="e.g. Happy Hour starts now" className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="notifBody" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Message</label>
              <textarea id="notifBody" rows={3} value={config.notificationBody} onChange={(e) => set("notificationBody", e.target.value)} placeholder="e.g. 50% off all drinks until 7pm tonight." className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none" />
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 cursor-pointer text-sm">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
              Send to all customers
            </button>
            <p className="text-xs text-center text-[#94A3B8]">Sends to all customers who have notifications enabled.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Panel: Appearance ───────────────────────────────────────────────────────
const APP_TEMPLATES = [
  { id: "classic",  label: "Classic",  tier: "free"   as PlanTier, bg: "#F8FAFC", accent: "#4F46E5", bars: ["#4F46E5", "#E2E8F0", "#E2E8F0"] },
  { id: "bold",     label: "Bold",     tier: "growth" as PlanTier, bg: "#0F172A", accent: "#F97316", bars: ["#F97316", "#1E293B", "#1E293B"] },
  { id: "minimal",  label: "Minimal",  tier: "growth" as PlanTier, bg: "#FFFFFF", accent: "#18181B", bars: ["#18181B", "#F4F4F5", "#F4F4F5"] },
  { id: "neon",     label: "Neon",     tier: "pro"    as PlanTier, bg: "#09090B", accent: "#22D3EE", bars: ["#22D3EE", "#18181B", "#18181B"] },
  { id: "luxury",   label: "Luxury",   tier: "pro"    as PlanTier, bg: "#1A1209", accent: "#C9A227", bars: ["#C9A227", "#2A1F0A", "#2A1F0A"] },
  { id: "magazine", label: "Magazine", tier: "pro"    as PlanTier, bg: "#FAFAFA", accent: "#E11D48", bars: ["#E11D48", "#F1F5F9", "#E2E8F0"] },
];

const UX_LAYOUTS = [
  { id: "standard",   label: "Standard",   tier: "free"   as PlanTier, desc: "Tabs + cards" },
  { id: "stories",    label: "Stories",    tier: "pro"    as PlanTier, desc: "Story carousel" },
  { id: "dashboard",  label: "Dashboard",  tier: "pro"    as PlanTier, desc: "Metrics widgets" },
  { id: "concierge",  label: "Concierge",  tier: "pro"    as PlanTier, desc: "Hero + quick actions" },
  { id: "gallery",    label: "Gallery",    tier: "pro"    as PlanTier, desc: "Full-bleed grid" },
  { id: "chat",       label: "Chat",       tier: "pro"    as PlanTier, desc: "Direct messaging" },
];

const ANIMATION_STYLES = [
  { id: "smooth",    label: "Smooth",    tier: "free"   as PlanTier, desc: "Default ease" },
  { id: "snappy",    label: "Snappy",    tier: "pro"    as PlanTier, desc: "Quick & bold" },
  { id: "fluid",     label: "Fluid",     tier: "pro"    as PlanTier, desc: "Spring physics" },
  { id: "cinematic", label: "Cinematic", tier: "pro"    as PlanTier, desc: "Slow, dramatic" },
  { id: "none",      label: "None",      tier: "pro"    as PlanTier, desc: "Instant" },
];

const FONT_OPTIONS = [
  { id: "system",    label: "System",    tier: "free"   as PlanTier, sample: "Aa" },
  { id: "modern",    label: "Modern",    tier: "growth" as PlanTier, sample: "Aa" },
  { id: "bold",      label: "Bold",      tier: "growth" as PlanTier, sample: "Aa" },
  { id: "elegant",   label: "Elegant",   tier: "growth" as PlanTier, sample: "Aa" },
  { id: "playful",   label: "Playful",   tier: "growth" as PlanTier, sample: "Aa" },
  { id: "technical", label: "Technical", tier: "pro"    as PlanTier, sample: "Aa" },
];

function AppearancePanel({ config, set, plan, onUpgrade }: {
  config: AppConfig;
  set: (k: keyof AppConfig, v: AppConfig[keyof AppConfig]) => void;
  plan: PlanTier;
  onUpgrade: (highlight?: PlanTier) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [selectedLayout, setSelectedLayout] = useState("standard");
  const [selectedAnimation, setSelectedAnimation] = useState("smooth");
  const [selectedFont, setSelectedFont] = useState("system");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Appearance</h2>
        <p className="text-sm text-[#64748B]">Control the look and feel of your app.</p>
      </div>

      {/* Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#0F172A]">Template</p>
          {!canAccess(plan, "growth") && (
            <button onClick={() => onUpgrade("growth")} className="text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
              Growth+ unlocks 5 more
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {APP_TEMPLATES.map((tpl) => {
            const locked = !canAccess(plan, tpl.tier);
            const active = selectedTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => locked ? onUpgrade(tpl.tier) : setSelectedTemplate(tpl.id)}
                className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] ${
                  active ? "border-[#4F46E5]" : "border-[#E2E8F0] hover:border-[#C7D2FE]"
                } ${locked ? "opacity-50" : ""}`}
                aria-pressed={active}
                aria-label={locked ? `Upgrade to ${TIER_LABELS[tpl.tier]} to unlock ${tpl.label} template` : `${tpl.label} template`}
              >
                <div className="w-full h-12 rounded-lg overflow-hidden" style={{ background: tpl.bg }}>
                  <div className="h-2.5 w-full" style={{ background: tpl.accent }} />
                  <div className="p-1 space-y-1">
                    {tpl.bars.slice(1).map((c, i) => (
                      <div key={i} className="h-1 rounded-sm" style={{ background: c, width: i === 1 ? "70%" : "100%" }} />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-semibold" style={{ color: active ? "#4F46E5" : "#64748B" }}>{tpl.label}</span>
                {locked && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: TIER_COLOR[tpl.tier] }}>
                    <svg width="7" height="7" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                  </div>
                )}
                {active && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-[#4F46E5] rounded-full flex items-center justify-center">
                    <svg width="7" height="7" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* App theme */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">App theme</p>
        <div className="grid grid-cols-2 gap-3">
          {(["light", "dark"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => set("appTheme", theme)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] ${
                config.appTheme === theme
                  ? "border-[#4F46E5] bg-indigo-50"
                  : "border-[#E2E8F0] hover:border-[#C7D2FE]"
              }`}
              aria-pressed={config.appTheme === theme}
            >
              <div className={`w-10 h-16 rounded-lg border ${theme === "light" ? "bg-white border-[#E2E8F0]" : "bg-[#0F172A] border-[#334155]"} overflow-hidden`}>
                <div className="h-4 w-full bg-[#4F46E5]" />
                <div className="p-1 space-y-1">
                  <div className={`h-1.5 w-full rounded ${theme === "light" ? "bg-[#E2E8F0]" : "bg-[#1E293B]"}`} />
                  <div className={`h-1.5 w-3/4 rounded ${theme === "light" ? "bg-[#E2E8F0]" : "bg-[#1E293B]"}`} />
                  <div className={`h-1.5 w-5/6 rounded ${theme === "light" ? "bg-[#E2E8F0]" : "bg-[#1E293B]"}`} />
                </div>
              </div>
              <span className={`text-xs font-semibold capitalize ${config.appTheme === theme ? "text-[#4F46E5]" : "text-[#64748B]"}`}>{theme}</span>
              {config.appTheme === theme && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-[#4F46E5] rounded-full flex items-center justify-center">
                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* UX Layouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#0F172A]">UX Layout</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(79,70,229,0.1)", color: "#4F46E5" }}>Pro</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {UX_LAYOUTS.map((layout) => {
            const locked = !canAccess(plan, layout.tier);
            const active = selectedLayout === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => locked ? onUpgrade(layout.tier) : setSelectedLayout(layout.id)}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-left ${
                  active ? "border-[#4F46E5] bg-indigo-50" : "border-[#E2E8F0] hover:border-[#C7D2FE] bg-white"
                } ${locked ? "opacity-50" : ""}`}
              >
                {locked && (
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR[layout.tier]} strokeWidth={2.5} className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                )}
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${active ? "text-[#4F46E5]" : "text-[#0F172A]"}`}>{layout.label}</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">{layout.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animation style */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#0F172A]">Animations</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(79,70,229,0.1)", color: "#4F46E5" }}>Pro</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ANIMATION_STYLES.map((anim) => {
            const locked = !canAccess(plan, anim.tier);
            const active = selectedAnimation === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => locked ? onUpgrade(anim.tier) : setSelectedAnimation(anim.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] ${
                  active ? "border-[#4F46E5] bg-indigo-50 text-[#4F46E5]" : "border-[#E2E8F0] hover:border-[#C7D2FE] text-[#64748B]"
                } ${locked ? "opacity-50" : ""}`}
              >
                {locked && (
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR[anim.tier]} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                )}
                {anim.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom fonts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#0F172A]">Font style</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>Growth+</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FONT_OPTIONS.map((font) => {
            const locked = !canAccess(plan, font.tier);
            const active = selectedFont === font.id;
            return (
              <button
                key={font.id}
                onClick={() => locked ? onUpgrade(font.tier) : setSelectedFont(font.id)}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] ${
                  active ? "border-[#4F46E5] bg-indigo-50" : "border-[#E2E8F0] hover:border-[#C7D2FE]"
                } ${locked ? "opacity-50" : ""}`}
              >
                <span className={`text-base font-bold ${active ? "text-[#4F46E5]" : "text-[#0F172A]"}`}>{font.sample}</span>
                <span className="text-[10px] font-semibold text-[#64748B]">{font.label}</span>
                {locked && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: TIER_COLOR[font.tier] }}>
                    <svg width="6" height="6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Welcome message */}
      <div>
        <label htmlFor="welcomeMessage" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          Welcome message <span className="text-[#94A3B8] font-normal">(optional)</span>
        </label>
        <input
          id="welcomeMessage"
          type="text"
          value={config.welcomeMessage}
          onChange={(e) => set("welcomeMessage", e.target.value)}
          placeholder="e.g. Welcome back! Today's special is..."
          className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
        />
        <p className="text-xs text-[#94A3B8] mt-1.5">Shown as a banner at the top of your app&apos;s home screen.</p>
      </div>

      {/* Logo */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-2">App logo <span className="text-[#94A3B8] font-normal text-xs">(optional)</span></p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0" style={config.logoDataUrl ? { borderStyle: "solid", borderColor: config.primaryColor } : {}}>
            {config.logoDataUrl ? (
              <img src={config.logoDataUrl} alt="App logo" className="w-full h-full object-cover" />
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#CBD5E1" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            )}
          </div>
          <div className="space-y-2 flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm font-semibold text-[#0F172A] hover:bg-white cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#4F46E5]">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Upload logo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => set("logoDataUrl", ev.target?.result as string ?? "");
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {config.logoDataUrl && (
              <button
                onClick={() => set("logoDataUrl", "")}
                className="block text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer focus:outline-none focus:underline"
              >
                Remove logo
              </button>
            )}
            <p className="text-xs text-[#94A3B8]">PNG or JPG, shown in your app header.</p>
          </div>
        </div>
      </div>

      {/* Watermark notice */}
      {!canAccess(plan, "growth") && (
        <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth={2} className="shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          <div>
            <p className="text-xs font-semibold text-[#92400E]">Free plan includes &quot;Powered by LocalApp&quot; watermark</p>
            <button onClick={() => onUpgrade("growth")} className="text-xs text-[#F97316] font-semibold underline cursor-pointer mt-0.5">Upgrade to Growth to remove it</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Panel: Analytics ────────────────────────────────────────────────────────
function AnalyticsPanel({ plan, onUpgrade }: { plan: PlanTier; onUpgrade: (highlight?: PlanTier) => void }) {
  const basicMetrics = [
    { label: "Total downloads", value: "284", change: "+12 this week", up: true },
    { label: "Active users", value: "147", change: "+5 this week", up: true },
  ];
  const growthMetrics = [
    { label: "Orders this month", value: "63", change: "+8 vs last month", up: true },
    { label: "Loyalty stamps", value: "412", change: "+34 this week", up: true },
  ];
  const proMetrics = [
    { label: "Conversion rate", value: "6.4%", change: "+0.8% this week", up: true },
    { label: "Avg session", value: "3m 12s", change: "+22s vs last week", up: true },
    { label: "Retention D7", value: "38%", change: "+4% vs last month", up: true },
    { label: "Revenue / user", value: "$4.20", change: "+$0.60 this month", up: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Analytics</h2>
        <p className="text-sm text-[#64748B]">Your app performance at a glance.</p>
      </div>

      {/* Basic metrics — always visible */}
      <div className="grid grid-cols-2 gap-3">
        {basicMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-[0_1px_4px_rgba(79,70,229,0.05)]"
          >
            <div className="text-2xl font-extrabold text-[#0F172A] leading-none mb-1">{m.value}</div>
            <div className="text-xs text-[#64748B] mb-2">{m.label}</div>
            <div className={`text-xs font-semibold flex items-center gap-1 ${m.up ? "text-[#10B981]" : "text-red-500"}`}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>
              {m.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Growth metrics */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Orders & Loyalty</p>
          {!canAccess(plan, "growth") && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>Growth+</span>
          )}
        </div>
        <LockedFeature requiredPlan="growth" currentPlan={plan} onUpgrade={onUpgrade} label="orders & loyalty analytics">
          <div className="grid grid-cols-2 gap-3">
            {growthMetrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-[0_1px_4px_rgba(79,70,229,0.05)]"
              >
                <div className="text-2xl font-extrabold text-[#0F172A] leading-none mb-1">{m.value}</div>
                <div className="text-xs text-[#64748B] mb-2">{m.label}</div>
                <div className={`text-xs font-semibold flex items-center gap-1 ${m.up ? "text-[#10B981]" : "text-red-500"}`}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>
                  {m.change}
                </div>
              </motion.div>
            ))}
          </div>
        </LockedFeature>
      </div>

      {/* Weekly chart */}
      <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4">
        <div className="text-sm font-semibold text-[#0F172A] mb-3">Weekly active users</div>
        <div className="flex items-end gap-1.5 h-20">
          {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div className="w-full rounded-t-md" style={{ height: "100%", background: i === 5 ? "#4F46E5" : "#E0E7FF" }} />
            </motion.div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[8px] text-[#94A3B8]">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pro metrics — conversion, retention, etc. */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Advanced metrics</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(79,70,229,0.1)", color: "#4F46E5" }}>Pro</span>
        </div>
        <LockedFeature requiredPlan="pro" currentPlan={plan} onUpgrade={onUpgrade} label="advanced analytics">
          <div className="grid grid-cols-2 gap-3">
            {proMetrics.map((m, i) => (
              <div key={m.label} className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                <div className="text-xl font-extrabold text-[#0F172A] leading-none mb-1">{m.value}</div>
                <div className="text-xs text-[#64748B] mb-2">{m.label}</div>
                <div className={`text-xs font-semibold flex items-center gap-1 ${m.up ? "text-[#10B981]" : "text-red-500"}`}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>
                  {m.change}
                </div>
              </div>
            ))}
          </div>
        </LockedFeature>
      </div>
    </div>
  );
}

// ─── Panel: Settings ─────────────────────────────────────────────────────────
function SettingsPanel({ plan, onUpgrade }: { plan: PlanTier; onUpgrade: (highlight?: PlanTier) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-1">Settings</h2>
        <p className="text-sm text-[#64748B]">Manage your account and subscription.</p>
      </div>

      {/* Current plan card */}
      <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${TIER_COLOR[plan]}18, ${TIER_COLOR[plan]}08)`, border: `1px solid ${TIER_COLOR[plan]}30` }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: TIER_COLOR[plan] }}>{TIER_LABELS[plan]} plan</div>
            <div className="text-sm font-semibold text-[#0F172A]">
              {TIER_PRICES[plan]}{plan !== "free" && <span className="text-xs text-[#64748B] font-normal">/mo</span>}
            </div>
          </div>
          {plan !== "agency" && (
            <button
              onClick={() => onUpgrade()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: TIER_COLOR[plan === "free" ? "growth" : plan === "growth" ? "pro" : "agency"] }}
            >
              Upgrade
            </button>
          )}
        </div>
        {plan === "free" && (
          <p className="text-[10px] text-[#64748B] mt-2">Your app shows a &quot;Powered by LocalApp&quot; watermark. Upgrade to remove it.</p>
        )}
      </div>

      <div className="space-y-2">
        {[
          { label: "Account", sub: "Your account details" },
          { label: "Billing", sub: plan === "free" ? "Free plan" : `${TIER_PRICES[plan]}/mo · renews May 10` },
          { label: "App Store listing", sub: "Published · Version 1.2.4" },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-left"
          >
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">{item.label}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{item.sub}</div>
            </div>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#94A3B8]">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        ))}

        {/* Custom domain — Pro+ */}
        <div className="relative">
          <button
            onClick={() => canAccess(plan, "pro") ? undefined : onUpgrade("pro")}
            className={`w-full flex items-center justify-between p-4 bg-white rounded-xl border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-left ${canAccess(plan, "pro") ? "border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer" : "border-[#E2E8F0] cursor-pointer"}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {!canAccess(plan, "pro") && (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR.pro} strokeWidth={2.5} className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              )}
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">Custom domain</div>
                <div className="text-xs text-[#64748B] mt-0.5">{canAccess(plan, "pro") ? "yourapp.com" : "Requires Pro plan"}</div>
              </div>
            </div>
            {canAccess(plan, "pro") ? (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#94A3B8]"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(79,70,229,0.1)", color: "#4F46E5" }}>Pro</span>
            )}
          </button>
        </div>

        {/* Team members — Pro+ */}
        <div className="relative">
          <button
            onClick={() => canAccess(plan, "pro") ? undefined : onUpgrade("pro")}
            className={`w-full flex items-center justify-between p-4 bg-white rounded-xl border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-left ${canAccess(plan, "pro") ? "border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer" : "border-[#E2E8F0] cursor-pointer"}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {!canAccess(plan, "pro") && (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR.pro} strokeWidth={2.5} className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              )}
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">Team members</div>
                <div className="text-xs text-[#64748B] mt-0.5">{canAccess(plan, "pro") ? "1 member — invite more" : "Requires Pro plan"}</div>
              </div>
            </div>
            {canAccess(plan, "pro") ? (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#94A3B8]"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(79,70,229,0.1)", color: "#4F46E5" }}>Pro</span>
            )}
          </button>
        </div>

        {/* API access — Agency */}
        <div className="relative">
          <button
            onClick={() => canAccess(plan, "agency") ? undefined : onUpgrade("agency")}
            className={`w-full flex items-center justify-between p-4 bg-white rounded-xl border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-left ${canAccess(plan, "agency") ? "border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer" : "border-[#E2E8F0] cursor-pointer"}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {!canAccess(plan, "agency") && (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR.agency} strokeWidth={2.5} className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              )}
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">API access</div>
                <div className="text-xs text-[#64748B] mt-0.5">{canAccess(plan, "agency") ? "API key active" : "Requires Agency plan"}</div>
              </div>
            </div>
            {canAccess(plan, "agency") ? (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#94A3B8]"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>Agency</span>
            )}
          </button>
        </div>

        {/* White-label — Agency */}
        <WhiteLabelToggle plan={plan} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
}

function WhiteLabelToggle({ plan, onUpgrade }: { plan: PlanTier; onUpgrade: (highlight?: PlanTier) => void }) {
  const [enabled, setEnabled] = useState(false);
  const unlocked = canAccess(plan, "agency");
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E8F0] ${!unlocked ? "opacity-80" : ""}`}
      onClick={!unlocked ? () => onUpgrade("agency") : undefined}
      style={!unlocked ? { cursor: "pointer" } : {}}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {!unlocked && (
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR.agency} strokeWidth={2.5} className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
        )}
        <div>
          <div className="text-sm font-semibold text-[#0F172A]">White-label mode</div>
          <div className="text-xs text-[#64748B] mt-0.5">{unlocked ? (enabled ? "LocalApp branding hidden" : "LocalApp branding visible") : "Requires Agency plan"}</div>
        </div>
      </div>
      {unlocked ? (
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 cursor-pointer shrink-0 ${enabled ? "bg-[#7C3AED]" : "bg-[#E2E8F0]"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      ) : (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>Agency</span>
      )}
    </div>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
function UpgradeModal({ currentPlan, highlightPlan, onClose, onUpgrade }: {
  currentPlan: PlanTier;
  highlightPlan?: PlanTier;
  onClose: () => void;
  onUpgrade: (plan: PlanTier) => void;
}) {
  const tiers: PlanTier[] = ["free", "growth", "pro", "agency"];
  const [hovered, setHovered] = useState<PlanTier | null>(null);
  const focusPlan = hovered ?? highlightPlan ?? "pro";

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: "#080B14", border: "1px solid rgba(255,255,255,0.08)" }}
        initial={{ scale: 0.94, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 24 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Gradient mesh bg */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #4F46E5 0%, transparent 70%)" }} />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }} />
        </div>

        <div className="relative px-8 pt-8 pb-6">
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors cursor-pointer" aria-label="Close">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: "rgba(79,70,229,0.2)", color: "#818CF8" }}>
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
              Upgrade your plan
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Unlock more for your app</h2>
            <p className="text-sm text-white/50 mt-1">Templates, animations, layouts, analytics and more.</p>
          </div>

          {/* Tier columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {tiers.map((tier) => {
              const isCurrent = tier === currentPlan;
              const isHighlighted = tier === focusPlan;
              const isUpgradeable = TIER_RANK[tier] > TIER_RANK[currentPlan];
              return (
                <motion.div
                  key={tier}
                  onHoverStart={() => setHovered(tier)}
                  onHoverEnd={() => setHovered(null)}
                  animate={{ scale: isHighlighted ? 1.02 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="relative rounded-xl p-4 flex flex-col cursor-default"
                  style={{
                    background: isHighlighted ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                    border: isHighlighted ? `1px solid ${TIER_COLOR[tier]}` : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {tier === "pro" && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: TIER_COLOR.pro }}>
                      POPULAR
                    </div>
                  )}
                  <div className="mb-3">
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: TIER_COLOR[tier] }}>
                      {TIER_LABELS[tier]}
                    </div>
                    <div className="text-2xl font-extrabold text-white leading-none">
                      {TIER_PRICES[tier]}
                      {tier !== "free" && <span className="text-xs font-normal text-white/40">/mo</span>}
                    </div>
                  </div>
                  {isCurrent ? (
                    <div className="mt-auto pt-3 text-center text-xs font-semibold text-white/40 py-2 rounded-lg border border-white/10">
                      Current plan
                    </div>
                  ) : isUpgradeable ? (
                    <button
                      onClick={() => onUpgrade(tier)}
                      className="mt-auto pt-3 w-full py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer hover:opacity-90 active:scale-95"
                      style={{ background: `linear-gradient(135deg, ${TIER_COLOR[tier]}, ${tier === "growth" ? "#0EA5E9" : tier === "pro" ? "#7C3AED" : "#EC4899"})` }}
                    >
                      Upgrade to {TIER_LABELS[tier]}
                    </button>
                  ) : (
                    <div className="mt-auto pt-3 text-center text-xs font-semibold text-white/20 py-2">
                      Lower tier
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Feature comparison table */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="grid grid-cols-5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-white/40 col-span-1">Feature</div>
              {tiers.map((t) => (
                <div key={t} className="text-center" style={{ color: TIER_COLOR[t] }}>{TIER_LABELS[t]}</div>
              ))}
            </div>
            {TIER_FEATURES.map((feature, i) => (
              <div
                key={feature.label}
                className="grid grid-cols-5 px-4 py-2.5 text-xs"
                style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)", borderBottom: i < TIER_FEATURES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              >
                <div className="text-white/60 col-span-1 font-medium">{feature.label}</div>
                {tiers.map((t) => {
                  const val = feature[t];
                  return (
                    <div key={t} className="text-center">
                      {val === true ? (
                        <svg className="inline-block" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR[t]} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      ) : val === false ? (
                        <svg className="inline-block" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.15)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                      ) : (
                        <span style={{ color: t === currentPlan ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)" }}>{val}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-white/25 mt-4">Cancel anytime · No setup fees · Instant activation</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Locked Feature Wrapper ───────────────────────────────────────────────────
function LockedFeature({ children, requiredPlan, currentPlan, onUpgrade, label }: {
  children: React.ReactNode;
  requiredPlan: PlanTier;
  currentPlan: PlanTier;
  onUpgrade: (highlight?: PlanTier) => void;
  label?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tierKey = requiredPlan as keyof TierFeature;
  const includedFeatures = TIER_FEATURES.filter((f) => {
    const val = f[tierKey];
    return val !== false && val !== undefined;
  }).slice(0, 5);

  if (canAccess(currentPlan, requiredPlan)) return <>{children}</>;
  return (
    <div className="relative group" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <button
        onClick={() => onUpgrade(requiredPlan)}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl cursor-pointer transition-all duration-150 group-hover:bg-black/10"
        aria-label={`Upgrade to ${TIER_LABELS[requiredPlan]} to unlock ${label ?? "this feature"}`}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg" style={{ background: TIER_COLOR[requiredPlan] }}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
          {TIER_LABELS[requiredPlan]}+
        </div>
      </button>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute left-1/2 bottom-[calc(100%+8px)] z-50 pointer-events-none"
            style={{ transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
          >
            <div className="bg-[#0F172A] rounded-xl shadow-xl border border-white/10 p-3 w-52 text-left">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: TIER_COLOR[requiredPlan] }}>{TIER_LABELS[requiredPlan]} includes</div>
              <ul className="space-y-1.5">
                {includedFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-1.5">
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke={TIER_COLOR[requiredPlan]} strokeWidth={3} className="mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    <span className="text-[10px] text-white/80 leading-tight">
                      <span className="font-semibold text-white">{f.label}</span>
                      {typeof f[tierKey] === "string" && <span className="text-white/60"> — {f[tierKey]}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onUpgrade(requiredPlan)}
                className="mt-3 w-full py-1.5 rounded-lg text-[10px] font-bold text-white cursor-pointer"
                style={{ background: TIER_COLOR[requiredPlan] }}
                onMouseEnter={() => setShowTooltip(true)}
              >
                Upgrade to {TIER_LABELS[requiredPlan]}
              </button>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0" style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #0F172A" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Publish Modal ────────────────────────────────────────────────────────────
type PublishPhase = "confirm" | "publishing" | "done";

const PUBLISH_STEPS = [
  "Packaging your app assets...",
  "Updating app store listing...",
  "Pushing to CDN...",
  "All done!",
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-app";
}

// Deterministic fake QR pattern
const QR_CELLS = Array.from({ length: 100 }, (_, i) => {
  const row = Math.floor(i / 10);
  const col = i % 10;
  const corner = (row < 3 && col < 3) || (row < 3 && col > 6) || (row > 6 && col < 3);
  const seed = ((row * 7 + col * 13) % 3) === 0;
  return corner || seed;
});

function FakeQR({ color }: { color: string }) {
  return (
    <div className="grid gap-[2px] p-2 bg-white rounded-xl shadow-sm border border-[#E2E8F0]" style={{ gridTemplateColumns: "repeat(10, 1fr)", width: 88, height: 88 }}>
      {QR_CELLS.map((filled, i) => (
        <div key={i} className="rounded-[1px]" style={{ background: filled ? color : "transparent" }} />
      ))}
    </div>
  );
}

function PublishModal({ config, onClose }: { config: AppConfig; onClose: () => void }) {
  const [phase, setPhase] = useState<PublishPhase>("confirm");
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const slug = slugify(config.businessName);
  const appUrl = `localapp.co/${slug}`;

  const startPublish = () => {
    setPhase("publishing");
    setProgress(0);
    setStepIdx(0);

    const intervals: ReturnType<typeof setInterval>[] = [];

    // Progress bar
    const prog = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(prog); return 100; }
        return p + 1.4;
      });
    }, 30);

    // Step messages
    [0, 700, 1500, 2200].forEach((delay, i) => {
      const t = setTimeout(() => setStepIdx(i), delay);
      intervals.push(t as unknown as ReturnType<typeof setInterval>);
    });

    // Transition to done
    const done = setTimeout(() => {
      clearInterval(prog);
      setProgress(100);
      setTimeout(() => setPhase("done"), 200);
    }, 2800);

    intervals.push(done as unknown as ReturnType<typeof setInterval>);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <AnimatePresence mode="wait">
          {/* ── Confirm ── */}
          {phase === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-8"
            >
              <h2 className="text-xl font-bold text-[#0F172A] mb-1">Publish changes?</h2>
              <p className="text-sm text-[#64748B] mb-6">Your customers will see the following updates immediately.</p>

              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0] mb-6">
                {[
                  { label: "Business name", value: config.businessName || "—" },
                  { label: "Category", value: config.category || "—" },
                  ...(config.phone ? [{ label: "Phone", value: config.phone }] : []),
                  ...(config.hours ? [{ label: "Hours", value: config.hours.length > 28 ? config.hours.slice(0, 28) + "…" : config.hours }] : []),
                  ...(config.website ? [{ label: "Website", value: config.website.replace(/^https?:\/\//, "") }] : []),
                  ...(config.aboutText ? [{ label: "About", value: config.aboutText.length > 32 ? config.aboutText.slice(0, 32) + "…" : config.aboutText }] : []),
                  { label: "Theme", value: config.appTheme === "dark" ? "Dark" : "Light" },
                  { label: "Loyalty", value: config.loyaltyEnabled ? `Enabled · ${config.loyaltyStampsRequired} stamps` : "Disabled" },
                  { label: "Ordering", value: config.orderingEnabled ? "Enabled" : "Disabled" },
                  { label: "Push notifications", value: config.pushEnabled ? "Enabled" : "Disabled" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-[#64748B]">{row.label}</span>
                    <span className="text-xs font-semibold text-[#0F172A] text-right max-w-[55%] truncate">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  Cancel
                </button>
                <button
                  onClick={startPublish}
                  className="flex-1 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
                >
                  Publish
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Publishing ── */}
          {phase === "publishing" && (
            <motion.div
              key="publishing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-8"
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#E0E7FF" strokeWidth="4" />
                    <motion.circle
                      cx="28" cy="28" r="24"
                      fill="none" stroke="#4F46E5" strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (progress / 100) * 150.8}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#4F46E5]">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div>
                  <div className="text-base font-bold text-[#0F172A] mb-1">Publishing your app</div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={stepIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-sm text-[#64748B]"
                    >
                      {PUBLISH_STEPS[stepIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="w-full bg-[#E0E7FF] rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#4F46E5]"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Done ── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-8"
            >
              <div className="flex flex-col items-center text-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="w-14 h-14 rounded-full bg-[#10B981] flex items-center justify-center shadow-lg"
                  style={{ boxShadow: "0 8px 24px #10B98140" }}
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </motion.div>

                <div>
                  <div className="text-xl font-bold text-[#0F172A] mb-1">Your app is live</div>
                  <p className="text-sm text-[#64748B]">{config.businessName} is now published</p>
                </div>

                <div className="flex items-center gap-4 py-4 px-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] w-full">
                  <FakeQR color={config.primaryColor} />
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#94A3B8] mb-1 uppercase tracking-wide font-semibold">Your app URL</div>
                    <div className="text-sm font-bold text-[#0F172A] break-all">{appUrl}</div>
                    <div className="text-[10px] text-[#64748B] mt-1">Scan QR to preview</div>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    Back to builder
                  </button>
                  <button
                    onClick={() => window.open("/preview", "_blank")}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 hover:shadow-md"
                  >
                    View preview
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Scroll Preview Phone (static, larger) ───────────────────────────────────
function ScrollPhone({ config }: { config: AppConfig }) {
  const tabs = [
    { label: "Home", path: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
    { label: "Order", path: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" },
    { label: "Loyalty", path: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" },
    { label: "Profile", path: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" },
  ];
  return (
    <div className="relative select-none" style={{ width: 320 }}>
      <div
        className="relative rounded-[52px]"
        style={{
          background: "linear-gradient(155deg, #2C2C30 0%, #1C1C20 40%, #0D0D11 70%, #080B14 100%)",
          padding: "3px",
          boxShadow: "0 0 0 0.5px rgba(255,255,255,0.08), 0 52px 120px rgba(0,0,0,0.94), inset 0 1px 0 rgba(255,255,255,0.13)",
        }}
      >
        <div className="absolute" style={{ left: -3, top: 132, width: 3, height: 24, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 4px rgba(0,0,0,0.8)" }} />
        <div className="absolute" style={{ left: -3, top: 168, width: 3, height: 55, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 4px rgba(0,0,0,0.8)" }} />
        <div className="absolute" style={{ left: -3, top: 234, width: 3, height: 55, borderRadius: "2px 0 0 2px", background: "linear-gradient(to left, #2e2e32, #1c1c1e)", boxShadow: "-2px 0 4px rgba(0,0,0,0.8)" }} />
        <div className="absolute" style={{ right: -3, top: 202, width: 3, height: 80, borderRadius: "0 2px 2px 0", background: "linear-gradient(to right, #2e2e32, #1c1c1e)", boxShadow: "2px 0 4px rgba(0,0,0,0.8)" }} />

        <div className="rounded-[50px]" style={{ background: "#090B0F", padding: "3px" }}>
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[86px] h-7 rounded-full z-10"
            style={{ background: "#06080C", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.04)" }} />

          <div className={`rounded-[48px] overflow-hidden flex flex-col relative ${config.appTheme === "dark" ? "bg-[#0F172A]" : "bg-[#F8FAFC]"}`} style={{ height: 640 }}>
            {/* Status bar */}
            <div className="h-10 flex items-end justify-between px-6 pb-2 shrink-0" style={{ background: config.primaryColor }}>
              <span className="text-white text-[11px] font-semibold">9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5 items-end h-3">
                  {[2, 5, 7, 10].map((h, i) => <div key={i} className="w-0.5 bg-white/80 rounded-sm" style={{ height: h }} />)}
                </div>
                <div className="w-5 h-2.5 border border-white/80 rounded-sm relative">
                  <div className="absolute inset-0.5 left-0.5 bg-white/80 rounded-sm w-2.5" />
                </div>
              </div>
            </div>

            {/* App header */}
            <div className="px-5 pt-3 pb-3 shrink-0" style={{ background: config.primaryColor }}>
              <div className="flex items-center gap-3">
                {config.logoDataUrl ? (
                  <img src={config.logoDataUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover shrink-0 border-2 border-white/30" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{(config.businessName || "A").charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px] font-medium uppercase tracking-widest mb-0.5">{config.category || "Restaurant"}</p>
                  <h3 className="text-white font-bold text-base leading-tight truncate">{config.businessName || "Your Business"}</h3>
                  {config.tagline && <p className="text-white/60 text-[10px] mt-0.5 truncate">{config.tagline}</p>}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden px-4 pt-4 space-y-3">
              {config.welcomeMessage && (
                <div className="rounded-2xl px-4 py-2.5 text-[10px] font-medium border" style={{ background: config.primaryColor + "15", borderColor: config.primaryColor + "30", color: config.primaryColor }}>
                  {config.welcomeMessage}
                </div>
              )}
              {config.loyaltyEnabled && (
                <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: config.accentColor }}>
                  <div className="font-bold mb-2 text-sm">Your Rewards</div>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {Array.from({ length: Math.min(config.loyaltyStampsRequired, 10) }).map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-white/40 flex items-center justify-center ${i < 3 ? "bg-white/90" : "bg-white/20"}`}>
                        {i < 3 && <div className="w-2.5 h-2.5 rounded-full" style={{ background: config.accentColor }} />}
                      </div>
                    ))}
                  </div>
                  <div className="text-white/80 text-[10px]">3 / {config.loyaltyStampsRequired} stamps — earn {config.loyaltyRewardName || "a reward"}</div>
                </div>
              )}
              {config.orderingEnabled && config.menuItems.length > 0 && (
                <div className={`rounded-2xl border p-4 shadow-sm ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-[#E2E8F0]"}`}>
                  <div className={`text-[11px] font-bold mb-2.5 ${config.appTheme === "dark" ? "text-white" : "text-[#0F172A]"}`}>Order Ahead</div>
                  <div className="space-y-2">
                    {config.menuItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className={`text-[10px] font-medium ${config.appTheme === "dark" ? "text-[#CBD5E1]" : "text-[#0F172A]"}`}>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#64748B]">{item.price}</span>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: config.primaryColor }}>+</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {config.pushEnabled && config.notificationTitle && (
                <div className={`rounded-2xl border p-4 shadow-sm ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-[#E2E8F0]"}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: config.primaryColor }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                    </div>
                    <span className={`text-[10px] font-bold ${config.appTheme === "dark" ? "text-white" : "text-[#0F172A]"}`}>{config.notificationTitle}</span>
                  </div>
                  <p className={`text-[9px] leading-relaxed pl-8 ${config.appTheme === "dark" ? "text-[#94A3B8]" : "text-[#64748B]"}`}>{config.notificationBody || "Tap to view"}</p>
                </div>
              )}
              {!config.loyaltyEnabled && !config.orderingEnabled && !config.pushEnabled && !config.welcomeMessage && (
                <div className={`text-center py-12 text-[11px] ${config.appTheme === "dark" ? "text-[#475569]" : "text-[#94A3B8]"}`}>
                  Enable features to see them here
                </div>
              )}
            </div>

            {/* Tab bar */}
            <div className={`shrink-0 px-3 py-2.5 border-t flex items-center justify-around ${config.appTheme === "dark" ? "bg-[#1E293B] border-[#334155]" : "bg-white border-[#E2E8F0]"}`}>
              {tabs.map((t, i) => (
                <div key={t.label} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${i === 0 ? "text-white" : config.appTheme === "dark" ? "text-[#475569]" : "text-[#94A3B8]"}`}
                    style={i === 0 ? { background: config.primaryColor } : {}}>
                    <svg width="12" height="12" fill={i === 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={t.path} />
                    </svg>
                  </div>
                  <span className={`text-[8px] font-medium ${i === 0 ? (config.appTheme === "dark" ? "text-white" : "text-[#0F172A]") : config.appTheme === "dark" ? "text-[#475569]" : "text-[#94A3B8]"}`}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scroll Preview Section ───────────────────────────────────────────────────
const SCROLL_PILLS = [
  { label: "Loyalty Rewards", icon: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" },
  { label: "Order Ahead", icon: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" },
  { label: "Push Notifications", icon: "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" },
  { label: "Live Preview", icon: "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
];

// Seeded star positions — deterministic so no SSR flicker
const STARS = Array.from({ length: 200 }, (_, i) => {
  const a = (i * 2.6180339887) % 1;
  const b = (i * 0.7548776662) % 1;
  const c = (i * 0.5698402910) % 1;
  return { x: a, y: b, r: c * 1.1 + 0.25, a: (i * 0.3141592) % 0.55 + 0.08 };
});

function ScrollPreviewSection({ config, onPublish }: { config: AppConfig; onPublish: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneOuterRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Star field — drawn once, redrawn on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      STARS.forEach((s) => {
        ctx2d.beginPath();
        ctx2d.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx2d.fill();
      });
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  // GSAP scroll animations
  useEffect(() => {
    if (!containerRef.current || !phoneOuterRef.current || !heroRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(phoneOuterRef.current, { opacity: 0, rotateY: 42, rotateX: 14, scale: 0.34, y: 60 });

      // Hero fades out early
      gsap.timeline({
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "18% bottom", scrub: 1 },
      }).to(heroRef.current, { opacity: 0, y: -36, duration: 1 });

      // Phone zoom-in scrub
      gsap.timeline({
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom bottom", scrub: 1.4 },
      })
        .to(phoneOuterRef.current, { opacity: 1, rotateY: 0, rotateX: 0, scale: 0.82, y: 0, duration: 0.3, ease: "power2.out" })
        .to(phoneOuterRef.current, { scale: 1.0, duration: 0.35, ease: "power1.inOut" })
        .to(phoneOuterRef.current, { scale: 1.22, duration: 0.17, ease: "power2.in" });

      // Pills stagger in when phone hits full scale (~75% scroll)
      if (pillsRef.current) {
        gsap.set(pillsRef.current.children, { opacity: 0, y: 18 });
        gsap.to(Array.from(pillsRef.current.children), {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "74% top",
            toggleActions: "play none none reverse",
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ minHeight: "280vh", background: "#080B14" }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center">
        {/* Star field */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 62%, ${config.primaryColor}1c 0%, transparent 70%)`,
          zIndex: 1,
        }} />

        {/* Hero text */}
        <div ref={heroRef} className="absolute left-1/2 -translate-x-1/2 pointer-events-none text-center whitespace-nowrap"
          style={{ top: "calc(50% - 260px)", zIndex: 10 }}>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3 font-semibold">Your app, live</div>
          <h2 className="text-4xl font-bold text-white leading-tight">See it come to life</h2>
          <p className="text-[#64748B] text-sm mt-3">Scroll to explore your app</p>
          <div className="mt-5 flex items-center justify-center gap-1.5 text-white/20">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
            <span className="text-[11px]">Scroll</span>
          </div>
        </div>

        {/* Phone */}
        <div style={{ perspective: 1400, position: "relative", zIndex: 5 }}>
          <div ref={phoneOuterRef} style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}>
            <ScrollPhone config={config} />
          </div>
        </div>

        {/* Feature pills — stagger in at 75% scroll */}
        <div ref={pillsRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2.5" style={{ zIndex: 10 }}>
          {SCROLL_PILLS.map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-sm text-white/55 text-xs font-medium">
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="opacity-60 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection({ config, onPublish }: { config: AppConfig; onPublish: () => void }) {
  return (
    <div className="relative overflow-hidden" style={{ background: "#080B14", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Gradient mesh */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 55% 70% at 50% 0%, ${config.primaryColor}22 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 80% 100%, ${config.accentColor}14 0%, transparent 60%)`,
      }} />
      {/* Top edge glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px" style={{
        background: `linear-gradient(to right, transparent, ${config.primaryColor}50, transparent)`,
      }} />

      <div className="relative mx-auto max-w-2xl px-8 py-24 text-center" style={{ zIndex: 2 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">Ready to ship</span>
        </div>

        <h2 className="text-5xl font-bold text-white leading-tight mb-4">
          Your app is<br />
          <span style={{ color: config.primaryColor }}>ready to publish</span>
        </h2>
        <p className="text-[#475569] text-base leading-relaxed mb-10 max-w-md mx-auto">
          Push {config.businessName || "your app"} live and start building customer loyalty — in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onPublish}
            className="group relative px-8 py-3.5 rounded-2xl text-white font-semibold text-sm overflow-hidden transition-all duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080B14] cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${config.primaryColor}, #7C3AED)`, focusRingColor: config.primaryColor } as React.CSSProperties}
          >
            <span className="relative z-10 flex items-center gap-2">
              Publish app
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: `linear-gradient(135deg, ${config.primaryColor}cc, #6D28D9)` }} />
          </button>

          <button
            onClick={onPublish}
            className="px-8 py-3.5 rounded-2xl text-white/50 font-semibold text-sm border border-white/10 hover:border-white/20 hover:text-white/70 transition-all duration-200 cursor-pointer focus:outline-none"
          >
            Preview first
          </button>
        </div>

        <p className="mt-8 text-[#334155] text-xs">
          Publishes instantly · No App Store wait · Update anytime
        </p>
      </div>
    </div>
  );
}

// ─── Panel animation variants ─────────────────────────────────────────────────
const panelVariants = {
  enter: { opacity: 0, x: 18 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function DashboardInner() {
  const searchParams = useSearchParams();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showPublish, setShowPublish] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeHighlight, setUpgradeHighlight] = useState<PlanTier | undefined>(undefined);
  const [plan, setPlan] = useState<PlanTier>("free");
  const [activeNav, setActiveNav] = useState("branding");

  const openUpgrade = (highlight?: PlanTier) => {
    setUpgradeHighlight(highlight);
    setShowUpgrade(true);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [config, setConfig] = useState<AppConfig>({
    businessName: "",
    tagline: "",
    aboutText: "",
    phone: "",
    website: "",
    hours: "",
    primaryColor: "#4F46E5",
    accentColor: "#F97316",
    category: "",
    appTheme: "light",
    welcomeMessage: "",
    logoDataUrl: "",
    loyaltyEnabled: true,
    loyaltyStampsRequired: 8,
    loyaltyRewardName: "Free item",
    orderingEnabled: true,
    pushEnabled: false,
    menuItems: [
      { id: "1", name: "Brisket Plate", price: "$18" },
      { id: "2", name: "Pulled Pork Sandwich", price: "$12" },
      { id: "3", name: "Loaded Fries", price: "$8" },
    ],
    notificationTitle: "",
    notificationBody: "",
  });

  const set = (key: keyof AppConfig, value: AppConfig[keyof AppConfig]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  // Persist config to localStorage so /preview can read it
  useEffect(() => {
    try { localStorage.setItem("localapp_config", JSON.stringify(config)); } catch (_) {}
  }, [config]);

  const handleOnboardingComplete = (partial: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setShowOnboarding(false);
  };

  const handleDemo = () => {
    setConfig(DEMO_CONFIG);
    setShowOnboarding(false);
    setIsDemoMode(true);
  };

  // Auto-trigger demo when landing page links with ?demo=true
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      handleDemo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPanel = () => {
    switch (activeNav) {
      case "branding": return <BrandingPanel config={config} set={set} plan={plan} onUpgrade={openUpgrade} />;
      case "appearance": return <AppearancePanel config={config} set={set} plan={plan} onUpgrade={openUpgrade} />;
      case "locations": return <LocationsPanel plan={plan} onUpgrade={openUpgrade} />;
      case "loyalty": return <LoyaltyPanel config={config} set={set} />;
      case "ordering": return <OrderingPanel config={config} set={set} />;
      case "notifications": return <NotificationsPanel config={config} set={set} />;
      case "analytics": return <AnalyticsPanel plan={plan} onUpgrade={openUpgrade} />;
      case "settings": return <SettingsPanel plan={plan} onUpgrade={openUpgrade} />;
      default: return null;
    }
  };

  return (
    <>
      {/* Onboarding wizard */}
      <AnimatePresence>
        {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} onDemo={handleDemo} />}
      </AnimatePresence>

      {/* Publish modal */}
      <AnimatePresence>
        {showPublish && <PublishModal config={config} onClose={() => setShowPublish(false)} />}
      </AnimatePresence>

      {/* Upgrade modal */}
      <AnimatePresence>
        {showUpgrade && (
          <UpgradeModal
            currentPlan={plan}
            highlightPlan={upgradeHighlight}
            onClose={() => setShowUpgrade(false)}
            onUpgrade={(newPlan) => { setPlan(newPlan); setShowUpgrade(false); }}
          />
        )}
      </AnimatePresence>

      <div className="font-sans">
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-[#E2E8F0] flex flex-col transform transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[#E2E8F0] shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center" aria-hidden="true">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" />
              </svg>
            </div>
            <span className="font-bold text-[#0F172A] tracking-tight">LocalApp</span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-left ${
                  activeNav === item.id ? "bg-indigo-50 text-[#4F46E5]" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
                aria-current={activeNav === item.id ? "page" : undefined}
              >
                <span className={activeNav === item.id ? "text-[#4F46E5]" : "text-[#94A3B8]"}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#E2E8F0] shrink-0 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" aria-hidden="true" />
                <span className="text-xs text-[#64748B] font-medium">App is live</span>
              </div>
              <button
                onClick={() => openUpgrade()}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: `${TIER_COLOR[plan]}18`, color: TIER_COLOR[plan] }}
              >
                {plan === "free" && (
                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75" /></svg>
                )}
                {TIER_LABELS[plan]}
              </button>
            </div>
            <button
              onClick={() => setShowPublish(true)}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
            >
              Publish changes
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* ── Main area ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <div>
                <h1 className="text-sm font-bold text-[#0F172A]">{config.businessName || "Your Business"}</h1>
                <p className="text-xs text-[#64748B]">App Builder</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                Live
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold" aria-label="User avatar">
                M
              </div>
            </div>
          </header>

          {/* Demo mode banner */}
          <AnimatePresence>
            {isDemoMode && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="shrink-0 flex items-center justify-between gap-3 px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium"
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                  </svg>
                  You&apos;re viewing a demo — this is Smoke &amp; Fire BBQ, a sample business.
                </div>
                <button
                  onClick={() => { setIsDemoMode(false); setShowOnboarding(true); }}
                  className="shrink-0 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1 rounded-lg transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  Customize it
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 flex overflow-hidden">
            {/* Settings panel — desktop */}
            <div className="w-80 shrink-0 border-r border-[#E2E8F0] bg-white overflow-y-auto hidden md:block relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNav}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="p-6"
                >
                  {renderPanel()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Settings panel — mobile */}
            <div className="flex-1 overflow-y-auto md:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNav}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="p-4"
                >
                  {renderPanel()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Preview area */}
            <div className="flex-1 flex items-center justify-center bg-[#0F1117] overflow-auto p-8 hidden md:flex">
              <PhonePreview config={config} plan={plan} />
            </div>
          </div>
        </div>
      </div>
      <ScrollPreviewSection config={config} onPublish={() => setShowPublish(true)} />
      <CTASection config={config} onPublish={() => setShowPublish(true)} />
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
