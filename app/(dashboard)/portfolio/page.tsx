"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { apiFetch } from "@/lib/api";
import {
  FollowingSection,
  TradeCopiedSection,
} from "@/components/dashboard/portfolio/TradingSections";
import {
  LiveTradingCard,
  PortfolioBreakdownCard,
} from "@/components/dashboard/portfolio/DashboardCards";
import DepositModal from "@/components/dashboard/modals/DepositModal";
import WithdrawModal from "@/components/dashboard/modals/WithdrawModal";
import TransactionHistoryModal from "@/components/dashboard/modals/TransactionHistoryModal";
import Link from "next/link";

interface DashboardData {
  balance: number;
  availableBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfits: number;
  isVerified: boolean;
  firstName: string;
  target: number;
}

// ── Light palette: sage green ──
const sg = {
  cardBg: "#fff",
  cardBorder: "1px solid rgba(10,50,25,0.07)",
  cardShadow: "0 28px 80px rgba(10,50,25,0.08), 0 4px 16px rgba(10,50,25,0.05)",
  heroBg: "linear-gradient(155deg, #f0faf4, #e6f5ec 60%, #f5fbf7)",
  darkText: "#0a2e18",
  mutedText: "#4a8060",
  fadedText: "#7aab90",
  accent: "#059669",
  accentDark: "#047857",
  accentBright: "#10b981",
  statBg: "#f5fbf7",
  statBorder: "1px solid rgba(10,50,25,0.07)",
  divider: "rgba(10,50,25,0.07)",
  pillBg: "rgba(5,150,105,0.08)",
  pillBorder: "rgba(5,150,105,0.2)",
  iconBg: "rgba(5,150,105,0.1)",
  iconGrad: "linear-gradient(135deg, #059669, #047857)",
  sectionBg: "#fff",
};

// ── Dark palette: TradeVerde forest green ──
const dk = {
  cardBg: "#0d3320",
  cardBorder: "1px solid rgba(39,174,96,0.18)",
  cardShadow: "0 28px 80px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25)",
  heroBg: "linear-gradient(155deg, #071a0e, #0a2416 60%, #0d3320)",
  darkText: "#e8f8f0",
  mutedText: "#7fb799",
  fadedText: "#52be80",
  accent: "#27ae60",
  accentDark: "#52be80",
  accentBright: "#34d399",
  statBg: "#071a0e",
  statBorder: "1px solid rgba(39,174,96,0.12)",
  divider: "rgba(39,174,96,0.12)",
  pillBg: "rgba(39,174,96,0.12)",
  pillBorder: "rgba(39,174,96,0.28)",
  iconBg: "rgba(39,174,96,0.15)",
  iconGrad: "linear-gradient(135deg, #059669, #047857)",
  sectionBg: "#0d3320",
};

export default function PortfolioPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    availableBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalProfits: 0,
    isVerified: false,
    firstName: "",
    target: 50000,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const p = isDark ? dk : sg;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await apiFetch("/profile/");
      const profileData = await profileRes.json();

      if (profileData.success) {
        const user = profileData.user;
        setDashboardData((prev) => ({
          ...prev,
          balance: parseFloat(user.balance) || 0,
          availableBalance: parseFloat(user.balance) || 0,
          totalProfits: parseFloat(user.profit) || 0,
          isVerified: user.is_verified || false,
          firstName: user.first_name || "",
          target: parseFloat(user.target) || 50000,
        }));
      }

      const [depositRes, withdrawalRes] = await Promise.all([
        apiFetch("/deposits/history/?limit=100"),
        apiFetch("/withdrawals/history/?limit=100"),
      ]);

      const depositData = await depositRes.json();
      const withdrawalData = await withdrawalRes.json();

      let totalDeposits = 0;
      let totalWithdrawals = 0;

      if (depositData.success) {
        totalDeposits = depositData.transactions
          .filter((t: { status: string }) => t.status === "completed")
          .reduce(
            (sum: number, t: { amount: string }) => sum + parseFloat(t.amount),
            0
          );
      }

      if (withdrawalData.success) {
        totalWithdrawals = withdrawalData.transactions
          .filter((t: { status: string }) => t.status === "completed")
          .reduce(
            (sum: number, t: { amount: string }) => sum + parseFloat(t.amount),
            0
          );
      }

      setDashboardData((prev) => ({ ...prev, totalDeposits, totalWithdrawals }));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { balance, totalDeposits, totalWithdrawals, totalProfits, isVerified, firstName, target } =
    dashboardData;

  void totalWithdrawals;

  // Progress bar: how far completed deposits are toward the admin-set target
  const progressWidth = target > 0 ? Math.min((totalDeposits / target) * 100, 100) : 0;
  const isProfitPositive = totalProfits >= 0;
  const profitPercent = totalDeposits > 0 ? (totalProfits / totalDeposits) * 100 : 0;

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleDepositClose = () => { setShowDeposit(false); fetchDashboardData(); };
  const handleWithdrawClose = () => { setShowWithdraw(false); fetchDashboardData(); };

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {firstName || "Trader"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Here&apos;s an overview of your portfolio and trading activity
        </p>
      </motion.div>

      {/* ── Row 1: Portfolio Card (2/3) + Right sidebar (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ══ SKELETON: shown while data loads ══ */}
        {isLoading && (
          <>
            {/* Left card skeleton */}
            <div className="lg:col-span-2 rounded-[28px] overflow-hidden animate-pulse"
              style={{ background: p.cardBg, boxShadow: p.cardShadow, border: p.cardBorder }}>
              {/* Hero area */}
              <div className="px-6 py-6" style={{ background: p.heroBg }}>
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded-md bg-emerald-300/30 dark:bg-emerald-600/20" />
                    <div className="h-3 w-16 rounded-md bg-emerald-300/20 dark:bg-emerald-600/15" />
                  </div>
                  <div className="h-6 w-14 rounded-full bg-emerald-300/30 dark:bg-emerald-600/20" />
                </div>
                {/* Balance label */}
                <div className="h-3 w-24 rounded bg-emerald-300/20 dark:bg-emerald-600/15 mb-2" />
                {/* Big balance */}
                <div className="h-10 w-52 rounded-lg bg-emerald-300/30 dark:bg-emerald-600/25 mb-4" />
                {/* Profit row */}
                <div className="h-4 w-60 rounded bg-emerald-300/20 dark:bg-emerald-600/15 mb-4" />
                {/* Profit + Deposited */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-10 rounded bg-emerald-300/20 dark:bg-emerald-600/15" />
                    <div className="h-4 w-24 rounded bg-emerald-300/30 dark:bg-emerald-600/20" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-14 rounded bg-emerald-300/20 dark:bg-emerald-600/15" />
                    <div className="h-4 w-24 rounded bg-emerald-300/30 dark:bg-emerald-600/20" />
                  </div>
                </div>
              </div>
              {/* Chart area */}
              <div className="h-[120px]" style={{ background: p.heroBg }} />
              {/* Buttons row */}
              <div className="grid grid-cols-4 gap-2 px-4 pb-5 pt-4" style={{ background: p.heroBg }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-[62px] rounded-[14px] bg-emerald-300/25 dark:bg-emerald-600/15" />
                ))}
              </div>
            </div>

            {/* Right column skeleton */}
            <div className="flex flex-col gap-4 animate-pulse">
              {/* Portfolio Growth */}
              <div className="rounded-2xl px-4 pt-3 pb-3"
                style={{ background: p.cardBg, border: p.cardBorder }}>
                <div className="flex justify-between mb-2">
                  <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mb-1.5" />
                <div className="h-2.5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              {/* Live Trading */}
              <div className="h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10" />
              {/* Portfolio Breakdown */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-emerald-900/30">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-emerald-900/20 bg-white dark:bg-[#0d3320]">
                  <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="px-4 py-1 bg-white dark:bg-[#0d3320] divide-y divide-gray-50 dark:divide-emerald-900/20">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700" />
                      </div>
                      <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Real content: shown after data loads ── */}
        {!isLoading && (<>
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="overflow-hidden"
            style={{
              borderRadius: 28,
              background: p.cardBg,
              boxShadow: p.cardShadow,
              border: p.cardBorder,
            }}
          >
            {/* ── Hero ── */}
            <div
              className="relative overflow-hidden px-6 py-6"
              style={{ background: p.heroBg }}
            >
              {/* Radial glow */}
              <div
                className="absolute -top-12 -right-12 w-52 h-52 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)" }}
              />

              {/* Top bar */}
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <div className="text-base font-bold">
                    <span style={{ color: p.accent }}>Verde</span><span style={{ color: p.darkText }}>Trades</span>
                  </div>
                  {isVerified ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold w-fit"
                      style={{ background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.25)", color: p.accent }}
                    >
                      ✓ Verified
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold w-fit"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#d97706" }}
                    >
                      ⚠ Unverified
                    </span>
                  )}
                </div>

                {/* LIVE */}
                <div
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
                  style={{ background: p.pillBg, border: `1px solid ${p.pillBorder}` }}
                >
                  <span className="relative flex w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-bold tracking-wide" style={{ color: p.accentDark }}>LIVE</span>
                </div>
              </div>

              {/* Balance label */}
              <div className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.8px] mb-1.5" style={{ color: p.mutedText }}>
                Total Balance
              </div>

              {/* Balance amount */}
              <div
                className="relative z-10 text-[26px] sm:text-[34px] md:text-[42px] leading-none font-bold mb-3 font-mono"
                style={{ color: p.darkText, letterSpacing: "-1px" }}
              >
                {fmt(balance)}
              </div>

              {/* Profit row */}
              <div className="relative z-10 flex items-center gap-2 mt-1">
                <span className="text-[13px] font-bold" style={{ color: isProfitPositive ? p.accent : "#ef4444" }}>
                  {isProfitPositive ? "↑" : "↓"}
                </span>
                <span className="text-[13px] font-bold" style={{ color: isProfitPositive ? p.accent : "#ef4444" }}>
                  {fmt(totalProfits)}
                </span>
                <span className="text-[13px] font-semibold" style={{ color: p.mutedText }}>
                  {isProfitPositive ? "+" : ""}{profitPercent.toFixed(2)}% today
                </span>
              </div>

              {/* Profit + Deposited summary */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: p.fadedText }}>Profit</div>
                  <div className="text-[14px] font-bold font-mono" style={{ color: isProfitPositive ? p.accent : "#ef4444" }}>
                    {fmt(totalProfits)}
                  </div>
                </div>
                <div className="hidden sm:block w-px h-7 self-center" style={{ background: p.divider }} />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: p.fadedText }}>Deposited</div>
                  <div className="text-[14px] font-bold font-mono" style={{ color: p.darkText }}>
                    {fmt(totalDeposits)}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Decorative area chart ── */}
            <div
              className="relative overflow-hidden"
              style={{ background: p.heroBg, height: 120 }}
            >
              <svg
                viewBox="0 0 500 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
              >
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={isDark ? "0.35" : "0.18"} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <filter id="lineGlow" x="-20%" y="-80%" width="140%" height="260%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Area fill */}
                <path
                  d="M 0,78 C 30,76 45,80 70,73 C 95,66 108,69 130,63 C 152,57 168,61 190,53 C 212,45 228,50 250,43 C 272,36 288,40 310,33 C 332,26 358,30 380,23 C 402,16 428,20 455,13 C 472,8 488,10 500,6 L 500,100 L 0,100 Z"
                  fill="url(#chartFill)"
                />
                {/* Glowing line */}
                <path
                  d="M 0,78 C 30,76 45,80 70,73 C 95,66 108,69 130,63 C 152,57 168,61 190,53 C 212,45 228,50 250,43 C 272,36 288,40 310,33 C 332,26 358,30 380,23 C 402,16 428,20 455,13 C 472,8 488,10 500,6"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  filter="url(#lineGlow)"
                />
              </svg>

              {/* Profit badge — top right corner of chart */}
              <div
                className="absolute top-3 right-4 rounded-lg px-2.5 py-1 text-[11px] font-bold"
                style={{
                  background: isProfitPositive ? p.pillBg : "rgba(239,68,68,0.08)",
                  border: isProfitPositive ? `1px solid ${p.pillBorder}` : "1px solid rgba(239,68,68,0.25)",
                  color: isProfitPositive ? p.accentDark : "#ef4444",
                }}
              >
                {isProfitPositive ? "+" : ""}{profitPercent.toFixed(2)}%
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="grid grid-cols-4 gap-2 px-4 pb-5 pt-4" style={{ background: p.heroBg }}>
              {/* Deposit — primary */}
              <button
                onClick={() => setShowDeposit(true)}
                className="flex flex-col items-center gap-1.5 rounded-[14px] p-3 transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: p.iconGrad, boxShadow: "0 4px 16px rgba(5,150,105,0.3)", border: "none" }}
              >
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <svg viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                    <path d="M7 1v9M3 6l4 4 4-4M1 13h12" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-white">Deposit</span>
              </button>

              {/* Withdraw */}
              <button
                onClick={() => setShowWithdraw(true)}
                className="flex flex-col items-center gap-1.5 rounded-[14px] p-3 transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: p.statBg, border: p.statBorder }}
              >
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: p.iconBg }}>
                  <svg viewBox="0 0 14 14" fill="none" stroke={p.accentDark} strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                    <path d="M7 13V4M3 8l4-4 4 4M1 1h12" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold" style={{ color: p.mutedText }}>Withdraw</span>
              </button>

              {/* Transfer */}
              <Link
                href="/transfer"
                className="flex flex-col items-center gap-1.5 rounded-[14px] p-3 transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: p.statBg, border: p.statBorder }}
              >
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: p.iconBg }}>
                  <svg viewBox="0 0 14 14" fill="none" stroke={p.accentDark} strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                    <path d="M1 4h12M9 1l3 3-3 3M13 10H1M5 7l-3 3 3 3" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold" style={{ color: p.mutedText }}>Transfer</span>
              </Link>

              {/* History */}
              <button
                onClick={() => setShowHistory(true)}
                className="flex flex-col items-center gap-1.5 rounded-[14px] p-3 transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: p.statBg, border: p.statBorder }}
              >
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: p.iconBg }}>
                  <svg viewBox="0 0 14 14" fill="none" stroke={p.accentDark} strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                    <circle cx="7" cy="7" r="6" />
                    <path d="M7 4v3.5L9.5 9" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold" style={{ color: p.mutedText }}>History</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4">
          {/* Portfolio Growth + target progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl px-4 pt-3 pb-2"
            style={{
              background: p.cardBg,
              border: p.cardBorder,
              boxShadow: p.cardShadow,
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-semibold" style={{ color: p.mutedText }}>Portfolio Growth</span>
              <span className="text-[12px] font-bold" style={{ color: p.accentDark }}>{fmt(target)} target</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(39,174,96,0.12)" : "rgba(5,150,105,0.1)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressWidth}%` }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #059669, #34d399)" }}
              />
            </div>
            <div className="mt-1 text-[10px]" style={{ color: p.fadedText }}>
              {fmt(totalDeposits)} deposited of {fmt(target)}
            </div>
          </motion.div>

          {/* Go to Live Trading */}
          <LiveTradingCard />

          {/* Portfolio Breakdown */}
          <PortfolioBreakdownCard
            balance={dashboardData.balance}
            totalDeposits={dashboardData.totalDeposits}
            totalWithdrawals={dashboardData.totalWithdrawals}
            totalProfits={dashboardData.totalProfits}
          />
        </div>
        </>)}
      </div>

      {/* ── Trading sections (accordion on mobile) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><TradeCopiedSection /></div>
        <div><FollowingSection /></div>
      </div>

      {/* Modals */}
      <DepositModal isOpen={showDeposit} onClose={handleDepositClose} />
      <WithdrawModal isOpen={showWithdraw} onClose={handleWithdrawClose} />
      <TransactionHistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}
