"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { UserProfile, Transaction } from "@/components/dashboard/modals/types";
import { getCryptoIcon, getNetworkName } from "@/components/dashboard/modals/crypto-icons";

// Hardcoded crypto types for withdrawal — no dependency on saved payment
// methods. The user always types their own destination address manually below.
const CRYPTO_TYPES = ["BTC", "ETH", "USDT", "BNB", "TRX", "USDC", "XRP", "SOL"];

export default function WithdrawPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ ref: string; amount: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        apiFetch("/withdrawals/profile/"),
        apiFetch("/withdrawals/history/?limit=10"),
      ]);

      const profileData = await profileRes.json();
      const historyData = await historyRes.json();

      if (profileData.success) setProfile(profileData.user);
      if (historyData.success) setTransactions(historyData.transactions);
    } catch {
      toast.error("Failed to load withdrawal data");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWithdrawal = async () => {
    setError("");

    if (!selectedCurrency) { setError("Please select a currency type"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Please enter a valid amount"); return; }
    if (!withdrawalAddress.trim()) { setError("Please enter your wallet address"); return; }
    if (profile && parseFloat(amount) > parseFloat(profile.balance)) {
      setError(`Insufficient balance. Your balance is ${profile.formatted_balance}`);
      return;
    }

    setSubmitting(true);

    // Fire-and-forget: tell admin a withdrawal is being confirmed, independent
    // of (and never blocking) the real withdrawal request below.
    apiFetch("/withdrawals/intent/", {
      method: "POST",
      body: JSON.stringify({
        method_type: selectedCurrency,
        amount: amount,
        withdrawal_address: withdrawalAddress.trim(),
      }),
    }).catch(() => {});

    try {
      const res = await apiFetch("/withdrawals/create/", {
        method: "POST",
        body: JSON.stringify({
          method_type: selectedCurrency,
          amount: amount,
          withdrawal_address: withdrawalAddress.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess({ ref: data.transaction.reference, amount });
        if (profile) {
          setProfile({
            ...profile,
            balance: data.transaction.new_balance,
            formatted_balance: data.transaction.formatted_new_balance,
          });
        }
        setSelectedCurrency("");
        setAmount("");
        setWithdrawalAddress("");
        toast.success("Withdrawal request submitted!");
        fetchData();
      } else {
        setError(data.error || "Failed to submit withdrawal request");
      }
    } catch {
      setError("Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-500/20 text-green-400";
      case "failed": return "bg-red-500/20 text-red-400";
      default: return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">Withdrawal</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Withdraw funds from your account</p>
      </motion.div>

      {/* Success Banner */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-600/10 border border-green-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Withdrawal Submitted</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                ${parseFloat(success.amount).toFixed(2)} &middot; Ref: <span className="font-mono">{success.ref}</span>
              </p>
              <button onClick={() => setSuccess(null)} className="text-xs text-green-600 hover:underline mt-1">Dismiss</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-1 tv-card backdrop-blur-xl rounded-2xl p-6"
        >
          <div className="space-y-5">
            {/* Balance Display */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {profile ? profile.formatted_balance : "$0.00"}
              </p>
            </div>

            <hr className="border-gray-200 dark:border-white/10" />

            {/* Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3 rounded-lg text-left flex items-center justify-between gap-2 transition-all bg-gray-100 dark:bg-[#071a0e] border ${
                    isDropdownOpen ? "border-green-600" : "border-gray-300 dark:border-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {selectedCurrency && (
                      <span className="shrink-0 [&_svg]:!w-5 [&_svg]:!h-5">{getCryptoIcon(selectedCurrency)}</span>
                    )}
                    <span className={`truncate ${selectedCurrency ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                      {selectedCurrency
                        ? `${selectedCurrency} (${getNetworkName(selectedCurrency)})`
                        : "Select currency"}
                    </span>
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1.5 rounded-lg shadow-lg overflow-hidden" style={{ background: "#0d1a12", border: "1px solid rgba(0,201,167,0.14)" }}>
                    <div className="max-h-56 overflow-y-auto">
                      {CRYPTO_TYPES.map((currency) => (
                        <button
                          key={currency}
                          onClick={() => { setSelectedCurrency(currency); setIsDropdownOpen(false); setError(""); }}
                          className="w-full px-3 py-2.5 flex items-center gap-2.5 text-left text-sm text-gray-900 dark:text-white hover:bg-white/5 transition-colors"
                        >
                          <span className="shrink-0 [&_svg]:!w-6 [&_svg]:!h-6">{getCryptoIcon(currency)}</span>
                          <span className="flex-1 truncate">{currency}</span>
                          {selectedCurrency === currency && (
                            <Check className="w-4 h-4 shrink-0" style={{ color: "#00C9A7" }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-green-600 transition-all text-lg font-semibold"
              />
              {profile && amount && parseFloat(amount) > parseFloat(profile.balance) && (
                <p className="mt-1.5 text-xs text-red-400">
                  Amount exceeds your balance of {profile.formatted_balance}
                </p>
              )}
            </div>

            {/* Withdrawal Address — always manually typed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Withdrawal Address
              </label>
              <input
                type="text"
                value={withdrawalAddress}
                onChange={(e) => { setWithdrawalAddress(e.target.value); setError(""); }}
                placeholder="Your wallet address"
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-green-600 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-500 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleConfirmWithdrawal}
              disabled={submitting || !selectedCurrency || !amount || !withdrawalAddress.trim()}
              className="w-full py-3 bg-[#00C9A7] hover:opacity-90 text-[#001a0f] rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
              ) : (
                "Confirm Withdrawal"
              )}
            </button>

            {/* Note */}
            <div className="p-3 bg-green-600/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-green-700 dark:text-green-300">
                  <strong>Note:</strong> Withdrawals are processed within 24-48 hours. You will be notified once approved.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Withdrawals Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="tv-card backdrop-blur-xl rounded-2xl p-5 h-fit"
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Withdrawals</h3>

          {transactions.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">No withdrawals yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="tv-inner border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center">
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">Withdrawal</p>
                        <p className="text-[9px] text-gray-500 font-mono">{tx.reference}</p>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status_display}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] text-gray-500">{formatDate(tx.created_at)}</p>
                    <p className="text-sm font-bold text-red-400">-${parseFloat(tx.amount).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
