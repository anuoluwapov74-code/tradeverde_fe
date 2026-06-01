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
  AssetAllocationCard,
  LiveTradingCard,
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
}


// ── Light palette: sage green (Design 4 from plain.html) ──
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
  rowDivider: "rgba(10,50,25,0.05)",
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
  rowDivider: "rgba(39,174,96,0.08)",
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
  });

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
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { balance, totalDeposits, totalWithdrawals, totalProfits, isVerified, firstName } =
    dashboardData;

  void totalWithdrawals;

  const profitPercent =
    totalDeposits > 0 ? (totalProfits / totalDeposits) * 100 : 0;
  const isProfitPositive = totalProfits >= 0;
  const progressWidth = Math.min(Math.max(Math.abs(profitPercent), 0), 100);

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtCompact = (n: number) => {
    if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "k";
    return fmt(n);
  };

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

      {/* ── Row 1: Portfolio Card (2/3) + Breakdown sidebar (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
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
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: p.iconGrad, boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                    <path d="M3 8h10M8 3l5 5-5 5" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: p.darkText }}>VerdeTrades</div>
                  <div className="text-[11px] font-medium" style={{ color: p.mutedText }}>Copy Portfolio</div>
                </div>
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
            <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
              <div
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                style={{
                  background: isProfitPositive ? p.pillBg : "rgba(239,68,68,0.08)",
                  border: isProfitPositive ? `1px solid ${p.pillBorder}` : "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <span className="text-[13px] font-bold" style={{ color: isProfitPositive ? p.accent : "#ef4444" }}>
                  {isProfitPositive ? "↑ +" : "↓ "}{profitPercent.toFixed(2)}%
                </span>
              </div>
              <span className="text-[13px] font-medium" style={{ color: p.mutedText }}>
                {fmt(totalProfits)} profit
              </span>
              {isVerified && (
                <span
                  className="ml-auto rounded-lg px-3 py-1 text-[13px] font-bold"
                  style={{ background: p.pillBg, border: `1px solid ${p.pillBorder}`, color: p.accentDark }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="mx-6 my-4" style={{ height: 1, background: p.divider }} />

          {/* ── Stats row ── */}
          <div
            className="mx-4 rounded-[14px] flex overflow-hidden"
            style={{ background: p.statBg, border: p.statBorder }}
          >
            {[
              { label: "Invested", value: fmtCompact(totalDeposits), green: false },
              { label: "Profit",   value: fmtCompact(totalProfits),  green: true  },
              { label: "Return",   value: profitPercent.toFixed(1) + "%", green: isProfitPositive },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex-1 min-w-0 px-3 py-4"
                style={i > 0 ? { borderLeft: `1px solid ${p.divider}` } : {}}
              >
                <div
                  className="text-[9px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: p.fadedText }}
                >
                  {stat.label}
                </div>
                <div
                  className="text-sm font-bold leading-snug break-words"
                  style={{ color: stat.green ? p.accent : p.darkText }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Progress bar ── */}
          <div className="px-4 mt-3.5" style={{ background: p.sectionBg }}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] font-semibold" style={{ color: p.fadedText }}>Portfolio Growth</span>
              <span className="text-[11px] font-bold" style={{ color: p.accentDark }}>
                {isProfitPositive ? "+" : ""}{profitPercent.toFixed(1)}% return
              </span>
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
          </div>

          {/* ── Breakdown rows ── */}
          <div
            className="mx-4 mt-3.5 rounded-[14px] px-4 py-0"
            style={{ background: p.statBg, border: p.statBorder }}
          >
            {[
              { label: "Profit",        value: fmt(totalProfits),  color: p.accent,     icon: "💹" },
              { label: "Deposited",     value: fmt(totalDeposits), color: p.accentDark, icon: "🏦" },
              { label: "Total Balance", value: fmt(balance),       color: p.darkText,   icon: "⚖️" },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3"
                style={i < arr.length - 1 ? { borderBottom: `1px solid ${p.rowDivider}` } : {}}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{row.icon}</span>
                  <span className="text-[13px] font-semibold" style={{ color: p.mutedText }}>{row.label}</span>
                </div>
                <span className="text-sm sm:text-[15px] md:text-[17px] font-bold font-mono" style={{ color: row.color }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Action buttons ── */}
          <div className="grid grid-cols-4 gap-2 px-4 pb-5 pt-3.5" style={{ background: p.sectionBg }}>
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

        {/* Right column: Live Trading + Asset Allocation */}
        <div className="flex flex-col gap-4">
          <LiveTradingCard />
          <AssetAllocationCard
            balance={dashboardData.balance}
            totalDeposits={dashboardData.totalDeposits}
            totalWithdrawals={dashboardData.totalWithdrawals}
            totalProfits={dashboardData.totalProfits}
          />
        </div>
      </div>

      {/* Trading sections */}
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
