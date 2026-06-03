"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Info,
  TrendingUp,
  TrendingDown,
  X,
  Users,
  Calendar,
  DollarSign,
  UserCheck,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PulseLoader } from "react-spinners";
import { apiFetch } from "@/lib/api";

interface TraderDetail {
  id: number;
  name: string;
  username: string;
  avatar_url: string | null;
  country_flag_url: string | null;
  badge: string;
  country: string;
  gain: string;
  risk: number;
  trades: number;
  copiers: number;
  avg_trade_time: string;
  subscribers: number;
  current_positions: number;
  min_account_threshold: string;
  expert_rating: string;
  return_ytd: string;
  return_2y: string;
  avg_score_7d: string;
  profitable_weeks: string;
  avg_profit_percent: string;
  avg_loss_percent: string;
  total_wins: number;
  total_losses: number;
  win_rate: number;
  performance_data: Array<{ month: string; value: number }>;
  monthly_performance: Array<{ month: string; percentage: number }>;
  frequently_traded: string[];
  bio: string;
  followers: number;
  trend_direction: string;
  tags: string[];
  category: string;
  max_drawdown: string;
  cumulative_earnings_copiers: string;
  cumulative_copiers: number;
  portfolio_breakdown: Array<{ name: string; percentage: number }>;
  top_traded: Array<{
    name: string;
    ticker: string;
    avg_profit: number;
    avg_loss: number;
    profitable_pct: number;
  }>;
  profit_share: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  success: boolean;
  user: {
    balance: string;
    profit: string;
  };
}

interface SimilarTrader {
  id: number;
  name: string;
  username: string;
  avatar_url: string | null;
  gain: string;
  copiers: number;
  risk: number;
  trend_direction: string;
  category: string;
}

function generateChartData(
  direction: string,
  period: string
): Array<{ label: string; value: number }> {
  const periods: Record<string, { count: number; labels: string[] }> = {
    "1D": { count: 24, labels: Array.from({ length: 24 }, (_, i) => `${i}:00`) },
    "1W": { count: 7, labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    "1M": { count: 30, labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`) },
    "3M": { count: 12, labels: ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"] },
    "1Y": { count: 12, labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] },
  };
  const config = periods[period] || periods["1M"];
  const isUp = direction === "upward";
  const data: Array<{ label: string; value: number }> = [];
  let seed = period.charCodeAt(0) * 100;
  const pseudoRandom = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const baseValue = 10000;
  let current = baseValue;
  for (let i = 0; i < config.count; i++) {
    const progress = i / (config.count - 1);
    const noise = (pseudoRandom() - 0.5) * 800;
    current = isUp
      ? baseValue + progress * 5000 + noise
      : baseValue + 5000 - progress * 5000 + noise;
    data.push({ label: config.labels[i], value: Math.max(current, 1000) });
  }
  return data;
}

const portfolioColors = ["#14532d","#22c55e","#86efac","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899"];

export default function TraderProfilePage() {
  const params = useParams();
  const traderId = params.id;

  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "history" | "copiers">("overview");
  const [chartPeriod, setChartPeriod] = useState("1Y");
  const [trader, setTrader] = useState<TraderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isCopying, setIsCopying] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [copyActionLoading, setCopyActionLoading] = useState(false);
  const [similarTraders, setSimilarTraders] = useState<SimilarTrader[]>([]);

  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => { fetchUserBalance(); }, []);
  useEffect(() => { if (traderId) { fetchTraderDetails(); fetchCopyStatus(); } }, [traderId]);
  useEffect(() => { if (trader) fetchSimilarTraders(); }, [trader]);

  const fetchUserBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await apiFetch("/profile/");
      if (!response.ok) throw new Error("Failed to fetch balance");
      const data: UserProfile = await response.json();
      if (data?.success && data?.user?.balance) setUserBalance(parseFloat(data.user.balance));
    } catch (err) {
      console.error("Error fetching balance:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchTraderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`/traders/${traderId}/`);
      if (!response.ok) throw new Error("Failed to fetch trader details");
      const data: TraderDetail = await response.json();
      setTrader(data);
    } catch (err) {
      setError("Failed to load trader details. Please try again later.");
      console.error("Error fetching trader:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarTraders = async () => {
    try {
      const response = await apiFetch("/traders/");
      if (!response.ok) return;
      const data: SimilarTrader[] = await response.json();
      setSimilarTraders(data.filter((t) => t.id !== trader?.id).slice(0, 4));
    } catch (err) {
      console.error("Error fetching similar traders:", err);
    }
  };

  const fetchCopyStatus = async () => {
    try {
      const response = await apiFetch(`/copy-trader/status/${traderId}/`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.success && data.is_copying) { setIsCopying(true); setCancelRequested(data.cancel_requested || false); }
    } catch (err) {
      console.error("Error fetching copy status:", err);
    }
  };

  const handleCopyTrader = async () => {
    if (!trader) return;
    const minThreshold = parseFloat(trader.min_account_threshold);
    if (userBalance < minThreshold) {
      toast.error("Insufficient Balance", {
        description: `You need at least $${minThreshold.toLocaleString()} to copy ${trader.name}. Your balance: $${userBalance.toLocaleString()}`,
      });
      return;
    }
    setCopyActionLoading(true);
    try {
      const response = await apiFetch("/copy-trader/action/", {
        method: "POST",
        body: JSON.stringify({ trader_id: trader.id, action: "copy" }),
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.error || "Failed to copy trader"); }
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to copy trader");
      setIsCopying(true);
      toast.success("Copying Trader", { description: data.message || `You are now copying ${trader.name}` });
    } catch (err) {
      toast.error("Failed to Copy Trader", { description: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      setCopyActionLoading(false);
    }
  };

  const handleCancelCopy = async () => {
    if (!trader) return;
    setCopyActionLoading(true);
    try {
      const response = await apiFetch("/copy-trader/action/", {
        method: "POST",
        body: JSON.stringify({ trader_id: trader.id, action: "cancel" }),
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.error || "Failed to request cancel"); }
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to request cancel");
      setCancelRequested(true);
      toast.info("Cancel Request Sent", { description: data.message || "Your cancel request has been sent to admin" });
    } catch (err) {
      toast.error("Failed to Request Cancel", { description: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      setCopyActionLoading(false);
    }
  };

  const isLight = mounted ? resolvedTheme === "light" || theme === "light" : false;
  const getAvatarUrl = (avatarUrl: string | null, name: string): string =>
    avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;

  const chartData = useMemo(() => {
    if (!trader) return [];
    return generateChartData(trader.trend_direction || "upward", chartPeriod);
  }, [trader, chartPeriod]);

  const chartColor = trader?.trend_direction === "downward" ? "#ef4444" : "#22c55e";

  const earningsValue = useMemo(() => chartData.length ? chartData[chartData.length - 1].value : 0, [chartData]);
  const earningsChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    return ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100;
  }, [chartData]);

  const getRiskLabel = (risk: number) => {
    if (risk <= 3) return "Conservative";
    if (risk <= 6) return "Swing trader";
    return "Aggressive";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <PulseLoader color="#27ae60" size={15} />
      </div>
    );
  }

  if (error || !trader) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <p className="text-red-500 text-lg">{error || "Trader not found"}</p>
        <div className="flex gap-4">
          <button
            onClick={fetchTraderDetails}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
          <Link
            href="/explore-traders"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            Back to Experts
          </Link>
        </div>
      </div>
    );
  }

  const minThreshold = parseFloat(trader.min_account_threshold);
  const hasEnoughBalance = userBalance >= minThreshold;
  const totalPortfolio = trader.portfolio_breakdown?.reduce((sum, item) => sum + item.percentage, 0) || 100;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6">
        {/* Back */}
        <Link
          href="/explore-traders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Experts
        </Link>

        {/* Profile Header */}
        <div className="bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar + Flag */}
            <div className="shrink-0 flex items-start justify-between gap-6 min-w-[140px] sm:min-w-[160px]">
              <div className="relative">
                <Image
                  src={getAvatarUrl(trader.avatar_url, trader.name)}
                  alt={trader.name}
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-green-100 dark:border-green-900/30"
                  unoptimized
                />
                {trader.badge === "gold" && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-[#0d3320]">
                    <span className="text-xs">&#x1F451;</span>
                  </div>
                )}
              </div>
              {trader.country_flag_url && (
                <div className="flex flex-col items-center gap-1 pt-1">
                  <Image
                    src={trader.country_flag_url}
                    alt={trader.country}
                    width={52}
                    height={36}
                    className="rounded-full object-cover shadow-sm border border-gray-200/50 dark:border-white/10 h-10 w-10"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{trader.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">@{trader.username}</p>
                  {trader.bio && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 max-w-xl leading-relaxed">{trader.bio}</p>
                  )}
                </div>

                {/* Copy Button */}
                <div className="flex gap-2 shrink-0">
                  {!isCopying ? (
                    <button
                      onClick={handleCopyTrader}
                      disabled={loadingBalance || copyActionLoading}
                      className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                        loadingBalance || copyActionLoading
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                      }`}
                    >
                      {loadingBalance ? "Loading..." : copyActionLoading ? "Processing..." : "Copy Trader"}
                    </button>
                  ) : cancelRequested ? (
                    <span className="px-4 py-2.5 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-xl text-sm font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Cancel Requested
                    </span>
                  ) : (
                    <>
                      <span className="px-4 py-2.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        Copying
                      </span>
                      <button
                        onClick={handleCancelCopy}
                        disabled={copyActionLoading}
                        className={`px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${copyActionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <X className="w-4 h-4" />
                        {copyActionLoading ? "..." : "Stop"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-5">
                {[
                  { icon: <DollarSign className="w-4 h-4 text-green-500" />, value: `$${parseFloat(trader.min_account_threshold).toLocaleString()}`, label: "Min Capital" },
                  { icon: <Users className="w-4 h-4 text-purple-500" />, value: trader.copiers.toLocaleString(), label: "Copiers" },
                  { icon: <UserCheck className="w-4 h-4 text-emerald-500" />, value: trader.followers.toLocaleString(), label: "Followers" },
                  { icon: <Shield className="w-4 h-4 text-amber-500" />, value: `${trader.profit_share ?? 50}%`, label: "Profit Share" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {s.icon}
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{s.value}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {trader.tags && trader.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {trader.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full border border-green-100 dark:border-green-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Balance Warning */}
          {!hasEnoughBalance && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">
                Minimum balance required: ${minThreshold.toLocaleString()} &bull; Your balance: ${userBalance.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 sm:gap-8 border-b border-gray-200 dark:border-[rgba(39,174,96,0.15)] mb-6 overflow-x-auto scrollbar-hide">
          {[
            { id: "overview", label: "Overview" },
            { id: "portfolio", label: "Portfolio" },
            { id: "history", label: "Trade History" },
            { id: "copiers", label: "Copiers" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as "overview" | "portfolio" | "history" | "copiers")}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-all relative ${
                activeTab === t.id
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.label}
              {activeTab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-5 sm:p-6">
                <div className="mb-1">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Earnings</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, "0")}-{new Date().getFullYear()}
                  </p>
                </div>
                <div className="flex gap-1 mb-4">
                  {["1D", "1W", "1M", "3M", "1Y"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-4 py-2 text-xs font-medium border transition-all ${
                        chartPeriod === p
                          ? "border-green-500 dark:border-green-500 bg-green-50 dark:bg-[#071a0e] text-green-700 dark:text-green-400"
                          : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    ${earningsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-sm font-semibold ${earningsChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {earningsChange >= 0 ? "+" : ""}{earningsChange.toFixed(1)}%
                  </span>
                </div>
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#f1f5f9" : "#1e3a28"} vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isLight ? "#94a3b8" : "#64748b" }} interval="preserveStartEnd" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isLight ? "#94a3b8" : "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} width={55} />
                      <Tooltip
                        contentStyle={{ backgroundColor: isLight ? "#ffffff" : "#0d3320", border: `1px solid ${isLight ? "#e2e8f0" : "rgba(39,174,96,0.2)"}`, borderRadius: 12, color: isLight ? "#0f1724" : "#fff", fontSize: 13 }}
                        formatter={(value) => [`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Value"]}
                      />
                      <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill="url(#chartGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Profile Data Sidebar */}
              <div className="bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">Profile data</h2>
                <div className="space-y-0">
                  {[
                    { label: "Master's P/L", value: `${parseFloat(trader.gain) >= 0 ? "+" : ""}${trader.gain}`, isGain: true, showTrend: true },
                    { label: "Minimum Capital", value: `$${parseFloat(trader.min_account_threshold).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                    { label: "Max. Drawdown", value: `${trader.max_drawdown}%`, isRed: parseFloat(trader.max_drawdown) > 0 },
                    { label: "Risk", value: getRiskLabel(trader.risk), isBold: true },
                    { label: "Cum. Earnings of Copiers", value: `+${parseFloat(trader.cumulative_earnings_copiers).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, isGain: true, showTrend: true },
                    { label: "Cum. Copiers", value: trader.cumulative_copiers.toLocaleString(), isBold: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-[rgba(39,174,96,0.08)] last:border-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                      <span className={`text-sm font-bold flex items-center gap-1 ${item.isGain ? "text-emerald-500" : item.isRed ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                        {item.value}
                        {item.showTrend && (
                          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                            <path d="M1,8 L4,6 L8,7 L12,3 L15,1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Traded */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Top traded</h2>
                {trader.top_traded && trader.top_traded.length > 0 ? (
                  <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-[rgba(39,174,96,0.08)]">
                          {["Asset", "Avg profit", "Avg Loss", "Profitable"].map((h) => (
                            <th key={h} className="text-left pb-3 text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {trader.top_traded.map((asset, i) => (
                          <tr key={i} className="border-b border-gray-50 dark:border-[rgba(39,174,96,0.05)] last:border-0">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-900 dark:bg-[#071a0e] flex items-center justify-center shrink-0">
                                  <span className="text-white text-sm font-bold">{asset.ticker?.charAt(0) || asset.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{asset.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{asset.ticker}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4"><span className="text-sm font-semibold text-emerald-500">{asset.avg_profit}%</span><div className="text-[10px] text-gray-400">Avg profit</div></td>
                            <td className="py-4"><span className="text-sm font-semibold text-red-500">-{Math.abs(asset.avg_loss)}%</span><div className="text-[10px] text-gray-400">Avg Loss</div></td>
                            <td className="py-4"><span className="text-sm font-semibold text-emerald-500">{asset.profitable_pct}%</span><div className="text-[10px] text-gray-400">Profitable</div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                    <Info className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">No top traded data available</p>
                  </div>
                )}
              </div>

              {/* Portfolio Breakdown */}
              <div className="bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Profile breakdown</h2>
                {trader.portfolio_breakdown && trader.portfolio_breakdown.length > 0 ? (
                  <>
                    <div className="flex rounded-lg overflow-hidden h-8 mb-6">
                      {trader.portfolio_breakdown.map((item, i) => (
                        <div key={i} style={{ width: `${(item.percentage / totalPortfolio) * 100}%`, backgroundColor: portfolioColors[i % portfolioColors.length] }} className="transition-all" />
                      ))}
                    </div>
                    <div className="space-y-3">
                      {trader.portfolio_breakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: portfolioColors[i % portfolioColors.length] }} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                    <Info className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">No portfolio data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Traders */}
            {similarTraders.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Similar traders</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Investors that trade just like {trader.username}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {similarTraders.map((st) => (
                    <Link key={st.id} href={`/explore-traders/${st.id}`} className="group bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-green-600 shrink-0">
                          {st.avatar_url ? (
                            <Image src={st.avatar_url} width={40} height={40} alt={st.name} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">{st.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{st.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{st.username}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div><span className="font-bold text-gray-900 dark:text-white">{parseFloat(st.gain).toFixed(2)}%</span><p className="text-[10px] text-gray-400">Profit (1M)</p></div>
                        <div className="text-right"><span className="font-bold text-gray-900 dark:text-white">{st.copiers.toLocaleString()}</span><p className="text-[10px] text-gray-400">Copiers</p></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PORTFOLIO TAB ── */}
        {activeTab === "portfolio" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win Rate */}
            <div className="bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">Win Rate</h2>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke={isLight ? "#f1f5f9" : "#1e3a28"} strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray={`${(trader.win_rate / 100) * 251.2} 251.2`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{trader.win_rate.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <div className="text-lg font-bold text-emerald-500">{trader.total_wins}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Wins</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
                  <div className="text-lg font-bold text-red-500">{trader.total_losses}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Losses</div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">Performance</h2>
              <div className="space-y-0">
                {[
                  { label: "Return YTD", value: `${trader.return_ytd}%`, color: parseFloat(trader.return_ytd) >= 0 ? "text-emerald-500" : "text-red-500" },
                  { label: "Return 2Y", value: `${trader.return_2y}%`, color: parseFloat(trader.return_2y) >= 0 ? "text-emerald-500" : "text-red-500" },
                  { label: "Avg Score (7D)", value: trader.avg_score_7d, color: "text-gray-900 dark:text-white" },
                  { label: "Profitable Weeks", value: `${trader.profitable_weeks}%`, color: "text-emerald-500" },
                  { label: "Avg. Profit", value: `+${trader.avg_profit_percent}%`, color: "text-emerald-500" },
                  { label: "Avg. Loss", value: `${trader.avg_loss_percent}%`, color: "text-red-500" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-[rgba(39,174,96,0.08)] last:border-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">About {trader.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { value: trader.subscribers.toLocaleString(), label: "Subscribers" },
                  { value: trader.current_positions, label: "Open Positions" },
                  { value: trader.avg_trade_time, label: "Avg. Trade Time" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-lg">{star <= Math.floor(parseFloat(trader.expert_rating)) ? "⭐" : "☆"}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rating ({trader.expert_rating}/5)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Trading Statistics</h2>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-sm text-emerald-500 font-semibold">+{trader.avg_profit_percent}% Avg. Profit</span></div>
                <div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-sm text-red-500 font-semibold">{trader.avg_loss_percent}% Avg. Loss</span></div>
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-[rgba(39,174,96,0.08)]">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Frequently Traded Assets</h3>
                {trader.frequently_traded.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                    <Info className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">No records found</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {trader.frequently_traded.map((asset, index) => (
                      <span key={index} className="px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm rounded-xl font-medium border border-green-100 dark:border-green-500/20">
                        {asset}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── COPIERS TAB ── */}
        {activeTab === "copiers" && (
          <div className="bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-[rgba(39,174,96,0.15)] rounded-2xl p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">Copier Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-6 bg-green-50 dark:bg-green-500/10 rounded-2xl">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{trader.copiers.toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active Copiers</div>
              </div>
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-500/10 rounded-2xl">
                <Shield className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{trader.cumulative_copiers.toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">All-time Copiers</div>
              </div>
              <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-emerald-500">${parseFloat(trader.cumulative_earnings_copiers).toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Copier Earnings</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
