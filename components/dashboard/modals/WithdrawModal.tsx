"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { PaymentMethod, UserProfile, Transaction } from "./types";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WithdrawStep = "form" | "success";

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [step, setStep] = useState<WithdrawStep>("form");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [withdrawSource, setWithdrawSource] = useState<"balance" | "profit">("balance");
  const [amount, setAmount] = useState("");
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [withdrawRef, setWithdrawRef] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Update withdrawal address when method changes
  useEffect(() => {
    if (selectedMethod && methods.length > 0) {
      const method = methods.find((m) => m.method_type === selectedMethod);
      if (method) setWithdrawalAddress(method.address);
    } else {
      setWithdrawalAddress("");
    }
  }, [selectedMethod, methods]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, methodsRes, historyRes] = await Promise.all([
        apiFetch("/withdrawals/profile/"),
        apiFetch("/withdrawals/methods/"),
        apiFetch("/withdrawals/history/?limit=5"),
      ]);

      const profileData = await profileRes.json();
      const methodsData = await methodsRes.json();
      const historyData = await historyRes.json();

      if (profileData.success) setProfile(profileData.user);
      if (methodsData.success) setMethods(methodsData.methods);
      if (historyData.success) setTransactions(historyData.transactions);
    } catch {
      toast.error("Failed to load withdrawal data");
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (methodType: string) => {
    setSelectedMethod(methodType);
    setIsDropdownOpen(false);
    setError("");
  };

  const handleConfirmWithdrawal = async () => {
    setError("");

    if (!selectedMethod) { setError("Please select a withdrawal method"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Please enter a valid amount"); return; }
    if (!withdrawalAddress) { setError("Withdrawal address is required"); return; }
    if (profile) {
      const available = withdrawSource === "profit"
        ? parseFloat(profile.profit)
        : parseFloat(profile.balance);
      const label = withdrawSource === "profit" ? profile.formatted_profit : profile.formatted_balance;
      if (parseFloat(amount) > available) {
        setError(`Insufficient ${withdrawSource === "profit" ? "profit" : "balance"}. Available: ${label}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/withdrawals/create/", {
        method: "POST",
        body: JSON.stringify({
          method_type: selectedMethod,
          amount: amount,
          withdrawal_address: withdrawalAddress,
          source: withdrawSource,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWithdrawRef(data.transaction.reference);
        setWithdrawAmount(amount);
        if (profile) {
          setProfile({
            ...profile,
            balance: data.transaction.new_balance,
            formatted_balance: data.transaction.formatted_new_balance,
          });
        }
        setStep("success");
        toast.success("Withdrawal request submitted!");
      } else {
        setError(data.error || "Failed to submit withdrawal request");
      }
    } catch {
      setError("Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setSelectedMethod("");
    setWithdrawSource("balance");
    setAmount("");
    setWithdrawalAddress("");
    setError("");
    setIsDropdownOpen(false);
    setIsSourceDropdownOpen(false);
    setWithdrawRef("");
    setWithdrawAmount("");
    onClose();
  };

  const getDisplayName = (methodType: string): string => {
    return methodType.replace("_ERC20", "").replace("_TRC20", "");
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-[#0b1a12] border border-gray-200 dark:border-[rgba(0,201,167,0.14)]"
        >
          {/* ==================== FORM STEP ==================== */}
          {step === "form" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Withdrawal</h3>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity bg-gray-100 dark:bg-white/8"
                >
                  <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Balance Display */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deposited</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile ? profile.formatted_balance : "$0.00"}
                      </p>
                    </div>
                    <div className="w-px bg-gray-200 dark:bg-white/10" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profit</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {profile ? profile.formatted_profit : "$0.00"}
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-white/10" />

                  {/* Source Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Withdraw From:
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                        className={`w-full px-4 py-3 rounded-lg text-left flex items-center justify-between transition-all bg-gray-50 dark:bg-white/5 border ${
                          isSourceDropdownOpen
                            ? "border-[#00C9A7]"
                            : "border-gray-200 dark:border-white/10"
                        } text-gray-900 dark:text-white`}
                      >
                        <span>{withdrawSource === "profit" ? "Profit" : "Deposited"}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isSourceDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isSourceDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1.5 rounded-lg shadow-lg overflow-hidden bg-white dark:bg-[#0b1a12] border border-gray-200 dark:border-[rgba(0,201,167,0.14)]">
                          {(["balance", "profit"] as const).map((src) => (
                            <button
                              key={src}
                              onClick={() => { setWithdrawSource(src); setIsSourceDropdownOpen(false); setError(""); setAmount(""); }}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                                withdrawSource === src
                                  ? "text-green-700 dark:text-green-400 font-semibold"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {src === "profit" ? "Profit" : "Deposited"}
                              {profile && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({src === "profit" ? profile.formatted_profit : profile.formatted_balance})
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Method Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Withdrawal Method:
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full px-4 py-3 rounded-lg text-left flex items-center justify-between transition-all bg-gray-50 dark:bg-white/5 border ${
                          isDropdownOpen ? "border-[#00C9A7]" : "border-gray-200 dark:border-white/10"
                        } ${selectedMethod ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        <span>{selectedMethod ? getDisplayName(selectedMethod) : "Select method"}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1.5 rounded-lg shadow-lg overflow-hidden bg-white dark:bg-[#0b1a12] border border-gray-200 dark:border-[rgba(0,201,167,0.14)]">
                          <div className="px-3 py-2 text-xs font-semibold" style={{ background: "#00C9A7", color: "#001a0f" }}>Select method</div>
                          <div className="max-h-48 overflow-y-auto">
                            {methods.length === 0 ? (
                              <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                No payment methods available. Add one in settings.
                              </div>
                            ) : (
                              methods.map((method) => (
                                <button
                                  key={method.id}
                                  onClick={() => handleMethodSelect(method.method_type)}
                                  className="w-full px-3 py-2.5 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                  {method.display_name}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {methods.length === 0 && !loading && (
                      <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-600 dark:text-yellow-300">
                            No withdrawal methods set up. Please add one in your settings.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (USD):
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setError(""); }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#00C9A7] transition-all"
                    />
                    {profile && amount && parseFloat(amount) > parseFloat(withdrawSource === "profit" ? profile.profit : profile.balance) && (
                      <p className="mt-1.5 text-xs text-red-400">
                        Amount exceeds your {withdrawSource === "profit" ? "profit" : "balance"} of {withdrawSource === "profit" ? profile.formatted_profit : profile.formatted_balance}
                      </p>
                    )}
                  </div>

                  {/* Withdrawal Address (read only) */}
                  {selectedMethod && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Withdrawal Address:
                      </label>
                      <input
                        type="text"
                        value={withdrawalAddress}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/3 border border-gray-200 dark:border-white/6 rounded-lg text-gray-500 focus:outline-none cursor-not-allowed opacity-75"
                      />
                      <p className="mt-1 text-[10px] text-gray-500">
                        Saved address for {getDisplayName(selectedMethod)}. Update in settings.
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-500 dark:text-red-300">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
                    <button
                      onClick={handleClose}
                      disabled={submitting}
                      className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmWithdrawal}
                      disabled={submitting || !selectedMethod || !amount || !withdrawalAddress}
                      className="flex-1 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                      style={{ background: "#00C9A7", color: "#001a0f" }}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                      ) : (
                        "Confirm Withdrawal"
                      )}
                    </button>
                  </div>

                  {/* Note */}
                  <div className="p-3 bg-green-600/10 border border-green-500/20 rounded-lg">
                    <p className="text-[10px] text-green-700 dark:text-green-300">
                      <strong>Note:</strong> Withdrawals are processed within 24-48 hours. You will be notified once approved.
                    </p>
                  </div>

                  {/* Recent Withdrawals */}
                  {transactions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Recent Withdrawals
                      </h4>
                      <div className="space-y-2">
                        {transactions.map((tx) => (
                          <div key={tx.id} className="bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/6 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{tx.reference}</p>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(tx.status)}`}>
                                {tx.status_display}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] text-gray-500">{formatDate(tx.created_at)}</p>
                              <p className="text-sm font-bold text-red-400">-${parseFloat(tx.amount).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== SUCCESS STEP ==================== */}
          {step === "success" && (
            <div className="p-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-14 h-14 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Withdrawal Submitted!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your withdrawal is being processed</p>
              </div>

              <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">${parseFloat(withdrawAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Source:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{withdrawSource === "profit" ? "Profit" : "Deposited"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Method:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{getDisplayName(selectedMethod)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-500/20">
                  <span className="text-gray-500 dark:text-gray-400">Reference:</span>
                  <span className="text-green-700 dark:text-green-400 font-semibold font-mono text-xs">{withdrawRef}</span>
                </div>
              </div>

              <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Processing Time</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Withdrawals are processed within 24-48 hours after approval.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
                style={{ background: "#00C9A7", color: "#001a0f" }}
              >
                Got It!
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
