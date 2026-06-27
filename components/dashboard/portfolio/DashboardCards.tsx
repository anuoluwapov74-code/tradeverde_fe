"use client";

import { motion } from "framer-motion";
import { TrendingUp, Wallet, Layers, BarChart2 } from "lucide-react";

export function LiveTradingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full rounded-2xl p-3 tv-card flex justify-center"
    >
      <motion.a
        href="/live-trading"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="inline-flex items-center gap-2.5 py-2.5 px-4 rounded-xl transition-all"
        style={{ background: "rgba(239,68,68,0.1)" }}
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <BarChart2 className="w-4 h-4 text-red-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          Go to Live Trading
        </span>
      </motion.a>
    </motion.div>
  );
}

interface PortfolioBreakdownProps {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfits: number;
}

export function PortfolioBreakdownCard({
  balance,
  totalDeposits,
  totalWithdrawals,
  totalProfits,
}: PortfolioBreakdownProps) {
  void totalDeposits;
  void totalWithdrawals;

  const total = balance + totalProfits;

  const rows = [
    {
      label: "Profit",
      value: totalProfits,
      icon: TrendingUp,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valueColor: "text-emerald-600 dark:text-emerald-400",
      barColor: "bg-emerald-500",
      barPct: total > 0 ? Math.abs(totalProfits / total) * 100 : 0,
    },
    {
      label: "Balance",
      value: balance,
      icon: Wallet,
      iconBg: "bg-blue-100 dark:bg-blue-500/15",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-gray-900 dark:text-white",
      barColor: "bg-blue-500",
      barPct: total > 0 ? (balance / total) * 100 : 0,
    },
    {
      label: "Total",
      value: total,
      icon: Layers,
      iconBg: "bg-teal-100 dark:bg-teal-500/15",
      iconColor: "text-teal-600 dark:text-teal-400",
      valueColor: "text-gray-900 dark:text-white",
      barColor: "bg-teal-400",
      barPct: 100,
    },
  ];

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl tv-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(0,201,167,0.1)] flex items-center gap-2">
        <Layers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Portfolio Breakdown</h3>
      </div>

      {/* Rows + Bar chart side by side */}
      <div className="flex items-end gap-3 px-4 py-3">
        {/* Rows */}
        <div className="flex-1 space-y-0 divide-y divide-[rgba(255,255,255,0.06)]">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${row.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${row.iconColor}`} />
                  </div>
                  <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300">
                    {row.label}
                  </span>
                </div>
                <span className={`text-[13px] font-bold font-mono ${row.valueColor}`}>
                  {fmt(row.value)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mini bar chart */}
        <div className="flex h-24 items-end gap-1.5 pb-0.5 shrink-0">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(row.barPct, 6)}%` }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`${row.barColor} w-8 rounded-t-sm min-h-1`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Keep backward-compatible export alias
export const AssetAllocationCard = PortfolioBreakdownCard;
