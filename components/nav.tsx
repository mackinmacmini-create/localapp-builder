"use client";

import { SignUpButton, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { useSidebar } from "@/components/sidebar-context";
import { usePathname } from "next/navigation";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M11.89 4.11l1.06-1.06M3.05 12.95l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 10A6 6 0 016 2.5a6 6 0 100 11 6 6 0 007.5-3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function Nav() {
  const { isSignedIn } = useUser();
  const { theme, toggle } = useTheme();
  const sidebar = useSidebar();
  const pathname = usePathname();
  const onDashboard = pathname?.startsWith("/refit/dashboard");

  return (
    <header className="sticky top-0 z-50 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/refit" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Re<span className="text-emerald-600 dark:text-emerald-500">Fit</span>
        </Link>

        <nav className="flex items-center gap-1">
          {isSignedIn ? (
            <>
              <Link
                href="/refit/workouts"
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Workouts
              </Link>

              {/* Dashboard icon — toggles sidebar when on dashboard, navigates otherwise */}
              {onDashboard && sidebar ? (
                <button
                  onClick={sidebar.toggle}
                  aria-label={sidebar.open ? "Collapse sidebar" : "Expand sidebar"}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all active:scale-[0.95] cursor-pointer ${
                    sidebar.open
                      ? "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <GridIcon />
                </button>
              ) : (
                <Link
                  href="/refit/dashboard"
                  aria-label="Go to dashboard"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.95]"
                >
                  <GridIcon />
                </Link>
              )}

              <div className="ml-1">
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/refit/pricing"
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Pricing
              </Link>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all active:scale-[0.98]">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98]">
                  Get started
                </button>
              </SignUpButton>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.95] cursor-pointer"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </div>
    </header>
  );
}
