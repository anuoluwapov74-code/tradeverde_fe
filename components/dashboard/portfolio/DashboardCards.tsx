"use client";

import { motion } from "framer-motion";
import { Radio, TrendingUp, TrendingDown } from "lucide-react";

export function LiveTradingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-lg bg-white/80 dark:bg-[#0d3320]/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm p-4"
    >
      <motion.a
      href="/live-trading"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200/50 dark:border-red-500/30 rounded-lg transition-all"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="text-xs font-semibold text-gray-800 dark:text-white">
          Go to Live trading
        </span>
      </motion.a>
    </motion.div>
  );
}

interface AssetAllocationProps {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfits: number;
}

export function AssetAllocationCard({
  balance,
  totalDeposits,
  totalWithdrawals,
  totalProfits,
}: AssetAllocationProps) {
  const totalPortfolio = balance + totalProfits;

  const assets = (() => {
    if (totalPortfolio <= 0) {
      return [
        { name: "Balance", value: 0, color: "bg-blue-400" },
        { name: "Deposits", value: 0, color: "bg-green-600" },
        { name: "Profits", value: 0, color: "bg-emerald-500" },
      ];
    }

    const balancePct = totalPortfolio > 0 ? Math.round((balance / totalPortfolio) * 100) : 0;
    const profitPct = totalPortfolio > 0 ? Math.round((Math.abs(totalProfits) / totalPortfolio) * 100) : 0;
    const depositPct = 100 - balancePct - profitPct;

    return [
      { name: "Available", value: Math.max(balancePct, 0), color: "bg-blue-400" },
      { name: "Deposits", value: Math.max(depositPct, 0), color: "bg-green-600" },
      { name: "Profits", value: Math.max(profitPct, 0), color: totalProfits >= 0 ? "bg-emerald-500" : "bg-red-400" },
    ];
  })();

  const growthPercent = totalDeposits > 0
    ? (((balance - totalDeposits + totalWithdrawals) / totalDeposits) * 100).toFixed(2)
    : "0.00";
  const isPositiveGrowth = parseFloat(growthPercent) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-lg bg-white/80 dark:bg-[#0d3320]/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm p-5"
    >
      {/* Header */}
      <div className="flex items-center space-x-2.5 mb-4">
        <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
        </div>
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
          Asset allocation
        </h3>
      </div>

      {/* Growth Stat */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-sm font-bold ${isPositiveGrowth ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {isPositiveGrowth ? "+" : ""}{growthPercent}%
          </span>
          {isPositiveGrowth ? (
            <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
          )}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
          portfolio growth from total deposits
        </p>
      </div>

      {/* Legend + Chart Row */}
      <div className="flex items-end justify-between">
        {/* Legend */}
        <div className="space-y-1.5">
          {assets.map((asset) => (
            <div key={asset.name} className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-sm ${asset.color}`} />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {asset.name} ({asset.value}%)
              </span>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="flex h-28 items-end space-x-2 overflow-hidden">
          {assets.map((asset, index) => (
            <motion.div
              key={asset.name}
              initial={{ height: 0 }}
              animate={{ height: `${Math.min(Math.max(asset.value, 4), 100)}%` }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              className={`${asset.color} w-10 min-h-2 rounded-t-sm`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
