"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-[#071a0e]/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] dark:shadow-black/20 border-b border-gray-200/50 dark:border-white/[0.06]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white lg:text-2xl">
              <span className="text-green-600 dark:text-green-400">Verde</span>Trades
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:text-[var(--primary)] dark:hover:text-[var(--primary)]"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:text-[var(--primary)] dark:hover:text-[var(--primary)]"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:text-[var(--primary)] dark:hover:text-[var(--primary)]"
            >
              Pricing
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-full border border-gray-300 dark:border-white/20 bg-transparent px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] dark:hover:border-[var(--primary)] dark:hover:text-[var(--primary)]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--primary-hover)] hover:shadow-lg hover:shadow-green-600/25 hover:-translate-y-0.5"
            >
              Get Started
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-white/15 text-gray-500 dark:text-gray-400 transition-all hover:border-[var(--primary)]/50 hover:text-[var(--primary)]"
              aria-label="Toggle theme"
            >
              {mounted && (
                <>
                  {theme === "dark" ? (
                    <SunIcon className="h-4 w-4" />
                  ) : (
                    <MoonIcon className="h-4 w-4" />
                  )}
                </>
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-2 lg:hidden">
            <Link
              href="/register"
              className="rounded-full bg-[var(--primary)] px-4 sm:px-4 py-2 sm:py-2 text-[11px] sm:text-[10px] font-semibold text-white transition-all hover:bg-[var(--primary-hover)] whitespace-nowrap"
            >
              Get Started
            </Link>

            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-gray-200 dark:border-white/15 text-gray-500 dark:text-gray-400 shrink-0"
              aria-label="Toggle theme"
            >
              {mounted && (
                <>
                  {theme === "dark" ? (
                    <SunIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    <MoonIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                </>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 flex-col items-center justify-center gap-1 sm:gap-1.5 shrink-0"
              aria-label="Toggle menu"
            >
              <span
                className={`h-0.5 w-4.5 sm:w-5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                  mobileMenuOpen ? "translate-y-1.5 sm:translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-4.5 sm:w-5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 w-4.5 sm:w-5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
                  mobileMenuOpen ? "-translate-y-1.5 sm:-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Animated slide */}
      <div
        className={`absolute left-0 right-0 top-full overflow-hidden transition-all duration-300 lg:hidden ${
          mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 dark:bg-[#071a0e]/95 backdrop-blur-xl px-4 py-5 shadow-xl border-b border-gray-200/50 dark:border-white/[0.06]">
          <div className="flex flex-col gap-1">
            <Link
              href="#features"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-green-50 dark:hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-green-50 dark:hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-green-50 dark:hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="mt-2 border-t border-gray-200 dark:border-white/10 pt-3">
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-green-50 dark:hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Moon Icon Component
const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

// Sun Icon Component
const SunIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export default Navbar;
