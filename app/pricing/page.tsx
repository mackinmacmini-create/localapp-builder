"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DM_Serif_Display } from "next/font/google";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

// ── Types ─────────────────────────────────────────────────────────────────────

type BillingCycle = "monthly" | "annual";
type PlanKey = "free" | "growth" | "pro" | "agency";

type Plan = {
  key: PlanKey;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
  accentClass: string;
  tagClass: string;
};

type CompareValue = string | boolean;

type CompareRow = {
  feature: string;
  free: CompareValue;
  growth: CompareValue;
  pro: CompareValue;
  agency: CompareValue;
};

type CompareSection = {
  label: string;
  rows: CompareRow[];
};

// ── Data ──────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    tagline: "No credit card required",
    monthly: 0,
    annual: 0,
    description: "A branded app with the essentials to get discovered by your customers.",
    accentClass: "from-slate-400 to-slate-500",
    tagClass: "bg-slate-100 text-slate-600",
    features: [
      "Branded mobile app",
      "App Store + Google Play",
      "Loyalty punch cards",
      "Up to 500 customers",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start building free",
  },
  {
    key: "growth",
    name: "Growth",
    tagline: "Most popular",
    monthly: 29,
    annual: 23,
    description: "Everything to drive repeat visits, increase order frequency, and build loyalty.",
    accentClass: "from-[#4F46E5] to-[#7C3AED]",
    tagClass: "bg-indigo-100 text-indigo-700",
    features: [
      "Everything in Free",
      "Online ordering",
      "Push notifications",
      "Up to 5,000 customers",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Scale without limits",
    monthly: 79,
    annual: 63,
    description: "Built for high-volume businesses that need multiple locations and full control.",
    accentClass: "from-[#F97316] to-[#EF4444]",
    tagClass: "bg-orange-100 text-orange-700",
    features: [
      "Everything in Growth",
      "Unlimited customers",
      "Multiple locations",
      "Custom domain",
      "White-label app",
      "Dedicated onboarding",
    ],
    cta: "Start free trial",
  },
  {
    key: "agency",
    name: "Agency",
    tagline: "Portfolio scale",
    monthly: 149,
    annual: 119,
    description: "Manage multiple brands and locations under one roof with white-label control.",
    accentClass: "from-violet-500 to-purple-600",
    tagClass: "bg-violet-100 text-violet-700",
    features: [
      "Everything in Pro",
      "Unlimited locations",
      "White-label dashboard",
      "Client sub-accounts",
      "Custom report builder",
      "Dedicated success manager",
    ],
    cta: "Start free trial",
  },
];

const COMPARE: CompareSection[] = [
  {
    label: "App & Publishing",
    rows: [
      { feature: "Branded mobile app", free: true, growth: true, pro: true, agency: true },
      { feature: "App Store & Google Play", free: true, growth: true, pro: true, agency: true },
      { feature: "Custom domain", free: false, growth: false, pro: true, agency: true },
      { feature: "White-label (remove LocalApp branding)", free: false, growth: false, pro: true, agency: true },
      { feature: "Multiple locations", free: false, growth: false, pro: true, agency: "Unlimited" },
    ],
  },
  {
    label: "Customer Engagement",
    rows: [
      { feature: "Loyalty punch cards", free: true, growth: true, pro: true, agency: true },
      { feature: "Points & tier rewards", free: false, growth: true, pro: true, agency: true },
      { feature: "Push notifications", free: false, growth: true, pro: true, agency: true },
      { feature: "Online ordering", free: false, growth: true, pro: true, agency: true },
      { feature: "Customer limit", free: "500", growth: "5,000", pro: "Unlimited", agency: "Unlimited" },
    ],
  },
  {
    label: "Analytics",
    rows: [
      { feature: "App visit & retention stats", free: true, growth: true, pro: true, agency: true },
      { feature: "Order & revenue reporting", free: false, growth: true, pro: true, agency: true },
      { feature: "Customer lifetime value", free: false, growth: true, pro: true, agency: true },
      { feature: "Custom report builder", free: false, growth: false, pro: true, agency: true },
    ],
  },
  {
    label: "Support",
    rows: [
      { feature: "Email support", free: true, growth: true, pro: true, agency: true },
      { feature: "Priority support (< 4 hr response)", free: false, growth: true, pro: true, agency: true },
      { feature: "Dedicated onboarding call", free: false, growth: false, pro: true, agency: true },
      { feature: "99.9% uptime SLA", free: false, growth: false, pro: true, agency: true },
    ],
  },
];

const FAQS = [
  {
    q: "Can I switch plans after signing up?",
    a: "Yes, at any time. Upgrades take effect immediately and you're billed the prorated difference. Downgrades apply at the start of your next billing cycle — you keep all current features until then.",
  },
  {
    q: "Is there really no credit card required to start?",
    a: "Correct. Your 14-day free trial gives you full access to every feature on the plan you choose. We only ask for a payment method when your trial ends.",
  },
  {
    q: "What happens if I reach my customer limit?",
    a: "We'll notify you at 80% usage so you have time to upgrade. We won't lock out existing customers — they can still use your app while you decide. Going over the limit doesn't incur overage charges; we just ask you to upgrade.",
  },
  {
    q: "How quickly does my app go live?",
    a: "Most apps are published on the App Store and Google Play within 48–72 hours of completing setup. First-time submissions take slightly longer due to Apple and Google review queues.",
  },
  {
    q: "Does LocalApp take a cut of my orders?",
    a: "No. We charge a flat monthly subscription and nothing else. Every dollar of revenue from your online orders goes directly to you.",
  },
  {
    q: "Can I export my customer data if I cancel?",
    a: "Always. Your data is yours. You can export your full customer list, loyalty history, and order history in CSV format at any time — including after canceling.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CompareCell({ value }: { value: CompareValue }) {
  if (value === true)
    return <div className="flex justify-center"><CheckIcon className="text-[#10B981]" /></div>;
  if (value === false)
    return <div className="flex justify-center"><CrossIcon className="text-[#CBD5E1]" /></div>;
  return <div className="text-center text-sm font-semibold text-[#0F172A]">{value}</div>;
}

function ctaHref(plan: Plan, billing: BillingCycle) {
  return `/dashboard?plan=${plan.key}&billing=${billing}`;
}

// ── Inner page (needs useSearchParams) ────────────────────────────────────────

function PricingInner() {
  const searchParams = useSearchParams();
  const initialPlan = (searchParams.get("plan") ?? "growth") as PlanKey;
  const initialBilling = (searchParams.get("billing") ?? "monthly") as BillingCycle;

  const [billing, setBilling] = useState<BillingCycle>(initialBilling);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const _ = initialPlan; // available for future pre-selection use

  return (
    <div className={`${dmSerif.variable} min-h-screen bg-[#F8FAFC]`}>
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#E2E8F0]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center" aria-hidden="true">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" />
              </svg>
            </div>
            <span className="text-[#0F172A] font-bold text-lg tracking-tight">LocalApp</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <Link href="/#features" className="hover:text-[#0F172A] transition-colors duration-150">Features</Link>
            <Link href="/#how-it-works" className="hover:text-[#0F172A] transition-colors duration-150">How it works</Link>
            <Link href="/pricing" className="text-[#4F46E5] font-semibold">Pricing</Link>
          </div>

          <Link href={`/dashboard?plan=growth&billing=${billing}`}
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2">
            Start free trial
          </Link>
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #09081A 0%, #0F0D2A 55%, #130E2E 100%)" }}>
          {/* Grid texture */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
          {/* Radial glow */}
          <div aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.22) 0%, transparent 70%)",
          }} />

          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
            {/* Label */}
            <div className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
              Transparent pricing
            </div>

            <h1 className="font-[family-name:var(--font-dm-serif)] text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] mb-6" style={{ letterSpacing: "-0.01em" }}>
              Simple pricing,
              <br />
              <span style={{ background: "linear-gradient(90deg, #818CF8 0%, #C084FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                serious results.
              </span>
            </h1>

            <p className="text-indigo-200/70 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
              No setup fees. No contracts. No hidden charges.
              Cancel any time — but you won&apos;t want to.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-4 mb-8" role="group" aria-label="Billing period">
              <button onClick={() => setBilling("monthly")}
                className={`text-sm font-semibold transition-colors duration-150 focus:outline-none focus:underline ${billing === "monthly" ? "text-white" : "text-indigo-400 hover:text-indigo-200"}`}>
                Monthly
              </button>
              <button role="switch" aria-checked={billing === "annual"}
                onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
                className="relative w-14 h-7 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#09081A] cursor-pointer"
                style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.4)" }}>
                <span className="absolute top-0.5 w-6 h-6 rounded-full transition-all duration-200"
                  style={{ left: billing === "annual" ? "calc(100% - 1.625rem)" : "0.125rem", background: "linear-gradient(135deg, #818CF8, #A78BFA)", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
              </button>
              <button onClick={() => setBilling("annual")}
                className={`text-sm font-semibold transition-colors duration-150 flex items-center gap-2 focus:outline-none focus:underline ${billing === "annual" ? "text-white" : "text-indigo-400 hover:text-indigo-200"}`}>
                Annual
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Money-back guarantee */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="inline-flex items-center gap-2 text-indigo-300/80 text-xs font-medium">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                30-day money-back guarantee
              </div>
              <div className="w-px h-4 bg-indigo-500/30" aria-hidden="true" />
              <div className="inline-flex items-center gap-2 text-indigo-300/80 text-xs font-medium">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
                No credit card to start
              </div>
              <div className="w-px h-4 bg-indigo-500/30" aria-hidden="true" />
              <div className="inline-flex items-center gap-2 text-indigo-300/80 text-xs font-medium">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                Cancel any time
              </div>
            </div>
          </div>
        </section>

        {/* ── Plan cards ───────────────────────────────────────────────────── */}
        <section className="relative z-10 -mt-16" aria-label="Pricing plans">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6 items-end pb-4">
              {PLANS.filter((p) => p.key !== "agency").map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative rounded-2xl bg-white border transition-all duration-200 ${
                    plan.featured
                      ? "border-[#4F46E5] shadow-[0_0_0_1px_#4F46E5,0_20px_60px_rgba(79,70,229,0.18)] md:-translate-y-4"
                      : "border-[#E2E8F0] shadow-[0_4px_24px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_32px_rgba(15,23,42,0.12)]"
                  }`}
                >
                  <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${plan.accentClass}`} aria-hidden="true" />

                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="text-xl font-bold text-[#0F172A] mb-1">{plan.name}</div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.tagClass}`}>
                          {plan.tagline}
                        </span>
                      </div>
                      {plan.featured && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#4F46E5] text-white">
                          Recommended
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="flex items-end gap-1">
                        <span className="font-[family-name:var(--font-dm-serif)] text-6xl leading-none text-[#0F172A]"
                          aria-label={plan.monthly === 0 ? "Free" : `$${billing === "monthly" ? plan.monthly : plan.annual} per month`}>
                          {plan.monthly === 0 ? "$0" : `$${billing === "monthly" ? plan.monthly : plan.annual}`}
                        </span>
                        {plan.monthly > 0 && (
                          <span className="text-[#64748B] font-medium mb-2">/mo</span>
                        )}
                      </div>
                      {billing === "annual" && plan.monthly > 0 && (
                        <div className="text-xs text-emerald-600 font-semibold mt-1">
                          Billed ${plan.annual * 12}/yr — saves ${(plan.monthly - plan.annual) * 12}/yr
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-[#64748B] leading-relaxed mb-8">{plan.description}</p>

                    <Link href={ctaHref(plan, billing)}
                      className={`block text-center text-sm font-semibold py-3.5 rounded-xl mb-8 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        plan.featured
                          ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white focus:ring-[#4F46E5]"
                          : "bg-[#F8FAFC] hover:bg-[#EEF2FF] text-[#4F46E5] border border-[#E2E8F0] focus:ring-[#4F46E5]"
                      }`}>
                      {plan.cta}
                    </Link>

                    <ul className="space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3 text-sm">
                          <CheckIcon className="text-[#10B981] shrink-0 mt-0.5" />
                          <span className="text-[#374151]">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Agency tier */}
            {(() => {
              const agency = PLANS.find((p) => p.key === "agency")!;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-0.5 flex-wrap">
                        <span className="font-bold text-[#0F172A]">Agency</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">Portfolio scale</span>
                        <span className="font-bold text-violet-700">
                          {billing === "annual" ? `$${agency.annual}` : `$${agency.monthly}`}/mo
                        </span>
                        {billing === "annual" && (
                          <span className="text-xs font-semibold text-emerald-600">Save 20% annually</span>
                        )}
                      </div>
                      <p className="text-sm text-[#64748B] leading-snug">
                        {agency.description}
                      </p>
                    </div>
                  </div>
                  <Link href={ctaHref(agency, billing)}
                    className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 whitespace-nowrap shadow-sm">
                    {agency.cta}
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </motion.div>
              );
            })()}

            {/* Enterprise tier */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 mb-4 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl border-2 border-[#E2E8F0] flex items-center justify-center text-[#64748B] shrink-0">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#0F172A] text-sm">Enterprise</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Custom pricing</span>
                  </div>
                  <p className="text-sm text-[#64748B] leading-snug">
                    10+ locations, custom integrations, dedicated infrastructure, SSO, priority SLA, and a dedicated success manager.
                  </p>
                </div>
              </div>
              <a href="mailto:hello@localapp.co"
                className="shrink-0 inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2 whitespace-nowrap">
                Talk to sales
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </motion.div>

            <p className="text-center text-sm text-[#64748B] pt-2 pb-16">
              All plans include a <strong className="text-[#0F172A]">14-day free trial</strong>. No credit card required.
            </p>
          </div>
        </section>

        {/* ── Compare table ────────────────────────────────────────────────── */}
        <section className="bg-white border-y border-[#E2E8F0]" aria-label="Feature comparison">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-14"
            >
              <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl md:text-5xl text-[#0F172A] mb-4" style={{ letterSpacing: "-0.01em" }}>
                Compare every feature
              </h2>
              <p className="text-[#64748B] text-lg">
                No asterisks. No fine print. Here&apos;s exactly what&apos;s in each plan.
              </p>
            </motion.div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[780px]" role="table">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left pb-5 text-sm font-medium text-[#64748B] w-[36%] bg-white" scope="col"
                      style={{ position: "sticky", top: 64, zIndex: 10, paddingTop: 16 }}>
                      Feature
                    </th>
                    {PLANS.map((plan) => (
                      <th key={plan.name} className="pb-5 text-center w-[16%] bg-white" scope="col"
                        style={{ position: "sticky", top: 64, zIndex: 10, paddingTop: 16 }}>
                        <div className={`inline-flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${plan.featured ? "bg-indigo-50 border border-indigo-200" : ""}`}>
                          <span className={`text-sm font-bold ${plan.featured ? "text-[#4F46E5]" : "text-[#0F172A]"}`}>
                            {plan.name}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            {plan.monthly === 0 ? "Free" : `$${billing === "monthly" ? plan.monthly : plan.annual}/mo`}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {COMPARE.map((section, si) => (
                    <>
                      <tr key={`section-${si}`}>
                        <td colSpan={5} className="pt-8 pb-3 text-xs font-bold text-[#64748B] uppercase tracking-widest border-b border-[#E2E8F0]">
                          {section.label}
                        </td>
                      </tr>
                      {section.rows.map((row, ri) => (
                        <tr key={`${si}-${ri}`} className={`border-b border-[#F1F5F9] ${ri % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"}`}>
                          <td className="py-3.5 pr-6 text-sm text-[#374151]">{row.feature}</td>
                          <td className="py-3.5 text-center"><CompareCell value={row.free} /></td>
                          <td className="py-3.5 text-center"><CompareCell value={row.growth} /></td>
                          <td className="py-3.5 text-center"><CompareCell value={row.pro} /></td>
                          <td className="py-3.5 text-center"><CompareCell value={row.agency} /></td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <td className="pt-8" />
                    {PLANS.map((plan) => (
                      <td key={plan.name} className="pt-8 text-center px-2">
                        <Link href={ctaHref(plan, billing)}
                          className={`inline-block w-full text-sm font-semibold py-3 rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            plan.featured
                              ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white focus:ring-[#4F46E5]"
                              : "bg-[#F8FAFC] hover:bg-[#EEF2FF] text-[#4F46E5] border border-[#E2E8F0] focus:ring-[#4F46E5]"
                          }`}>
                          {plan.cta}
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section aria-label="Frequently asked questions">
          <div className="max-w-3xl mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-12"
            >
              <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl md:text-5xl text-[#0F172A] mb-4" style={{ letterSpacing: "-0.01em" }}>
                Common questions
              </h2>
              <p className="text-[#64748B] text-lg">
                Email us at{" "}
                <a href="mailto:hello@localapp.co" className="text-[#4F46E5] hover:underline focus:outline-none focus:underline">
                  hello@localapp.co
                </a>{" "}if you don&apos;t see yours.
              </p>
            </motion.div>

            <div className="space-y-2">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOpen ? "border-[#C7D2FE] bg-indigo-50/50" : "border-[#E2E8F0] bg-white hover:border-[#C7D2FE]"
                    }`}
                  >
                    <button onClick={() => setOpenFaq(isOpen ? null : i)} aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-inset">
                      <span className="font-semibold text-[#0F172A] text-sm leading-snug">{faq.q}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                        className={`text-[#64748B] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: isOpen ? "200px" : "0px" }}>
                      <p className="px-6 pb-5 text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl px-8 py-16 text-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6D28D9 100%)" }}
          >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
            <div className="relative">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl md:text-5xl text-white mb-4" style={{ letterSpacing: "-0.01em" }}>
                14 days free. No card needed.
              </h2>
              <p className="text-indigo-100/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Build your app today and see what it feels like to have 600 loyal customers in your pocket.
              </p>

              {/* Guarantee badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-8">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                30-day money-back guarantee. No risk.
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`/dashboard?plan=growth&billing=${billing}`}
                  className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold text-base px-8 py-4 rounded-xl transition-colors duration-150 shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                  Build your app free
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a href="mailto:hello@localapp.co"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-4 rounded-xl border border-white/20 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                  Talk to sales
                </a>
              </div>
              <p className="text-indigo-200/60 text-sm mt-5">
                Trusted by 4,200+ local businesses. 4.8 stars on the App Store.
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 rounded-lg">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center" aria-hidden="true">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" />
              </svg>
            </div>
            <span className="font-bold text-[#0F172A]">LocalApp</span>
          </Link>
          <p className="text-sm text-[#64748B]">© {new Date().getFullYear()} LocalApp. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[#64748B]">
            <a href="#" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">Privacy</a>
            <a href="#" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">Terms</a>
            <a href="mailto:hello@localapp.co" className="hover:text-[#0F172A] transition-colors duration-150 focus:outline-none focus:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Export (Suspense required for useSearchParams) ────────────────────────────
export default function PricingPage() {
  return (
    <Suspense>
      <PricingInner />
    </Suspense>
  );
}
