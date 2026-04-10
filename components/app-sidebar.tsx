"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/sidebar-context";

function CollapseIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s ease" }}
    >
      <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    href: "/refit/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    href: "/refit/workouts",
    label: "Workouts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 12.75l.75-4.5 4.5 4.5 4.5-9 3.75 9 2.25-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/refit/pricing",
    label: "Pricing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 14.25l1.5 1.5 4.5-4.5M12 3L4.5 7.5v9L12 21l7.5-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function AppSidebar() {
  const ctx = useSidebar();
  const pathname = usePathname();

  if (!ctx) return null;
  const { open, toggle } = ctx;

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 bg-[#161618] border-r border-zinc-800/70 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ width: open ? 200 : 56 }}
    >
      {/* Collapse toggle */}
      <div className="flex items-center justify-end px-3 pt-4 pb-2">
        <button
          onClick={toggle}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <CollapseIcon open={open} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={open ? undefined : item.label}
              title={open ? undefined : item.label}
              className={`flex items-center gap-3 px-2 min-h-[44px] rounded-lg text-sm transition-all ${
                active
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {open && (
                <span className="truncate transition-opacity duration-200">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Brand */}
      {open && (
        <div className="px-4 pb-5 pt-3 border-t border-zinc-800/60">
          <p className="text-xs font-bold tracking-tight text-zinc-50">
            Re<span className="text-emerald-500">Fit</span>
          </p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Adaptive fitness</p>
        </div>
      )}
    </aside>
  );
}
