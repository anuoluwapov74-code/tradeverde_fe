"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Direction = "balance_to_profit" | "profit_to_balance";

export default function TransferPage() {
  const [balance, setBalance] = useState("0.00");
  const [profit, setProfit] = useState("0.00");
  const [canTransfer, setCanTransfer] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [direction, setDirection] = useState<Direction>("balance_to_profit");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fromLabel = direction === "balance_to_profit" ? "Deposited" : "Profit";
  const toLabel = direction === "balance_to_profit" ? "Profit" : "Deposited";
  const fromValue = direction === "balance_to_profit" ? balance : profit;
  const toValue = direction === "balance_to_profit" ? profit : balance;

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/transfer/info/");
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setProfit(data.profit);
        setCanTransfer(data.can_transfer);
        setCurrency(data.currency || "USD");
      } else {
        console.error("Transfer info error:", res.status, data);
        toast.error(data?.detail || data?.error || "Failed to load transfer info");
      }
    } catch (err) {
      console.error("Transfer info fetch error:", err);
      toast.error("Failed to load transfer info");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setDirection((prev) =>
      prev === "balance_to_profit" ? "profit_to_balance" : "balance_to_profit"
    );
    setAmount("");
  };

  const handleMax = () => {
    setAmount(fromValue);
  };

  const handleConfirm = async () => {
    if (!canTransfer) {
      toast.error("You do not have this option yet. You have not reached the minimum threshold.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > parseFloat(fromValue)) {
      toast.error(`Insufficient ${fromLabel.toLowerCase()}. Available: $${parseFloat(fromValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/transfer/", {
        method: "POST",
        body: JSON.stringify({ direction, amount }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Transfer successful");
        setBalance(data.balance);
        setProfit(data.profit);
        setAmount("");
      } else {
        toast.error(data.error || "Transfer failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-700" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto pb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/portfolio"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Transfer
        </h1>
      </div>

      {/* From */}
      <div className="mb-1">
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
          From
        </label>
        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {fromLabel} Account
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ${parseFloat(fromValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleSwap}
          className="w-10 h-10 rounded-full tv-card border-2 flex items-center justify-center hover:border-[#00C9A7] hover:bg-[rgba(0,201,167,0.08)] transition-all shadow-sm"
        >
          <ArrowDownUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* To */}
      <div className="mt-1 mb-6">
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
          To
        </label>
        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {toLabel} Account
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ${parseFloat(toValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
          Amount
        </label>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] focus-within:border-green-600 dark:focus-within:border-green-600 transition-colors">
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handleMax}
            className="text-xs font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
          >
            Max
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {currency}
          </span>
        </div>
      </div>

      {/* Available / In Use */}
      <div className="space-y-2 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Available
          </span>
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            ${parseFloat(fromValue).toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Transfer to {toLabel}
          </span>
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {amount ? `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00"} {currency}
          </span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={submitting || !amount || parseFloat(amount) <= 0}
        className="w-full py-3.5 rounded-xl bg-[#00C9A7] hover:opacity-90 disabled:bg-gray-300 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-[#001a0f] text-sm font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Confirm"
        )}
      </button>
    </motion.div>
  );
}
