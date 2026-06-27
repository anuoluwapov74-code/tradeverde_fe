"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, Users, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

interface CopiedTrade {
  id: number;
  trader_name: string | null;
  trader_id: number | null;
  market: string;
  market_name: string;
  market_logo_url: string | null;
  custom_image_url: string | null;
  direction: "buy" | "sell";
  entry_price: string;
  exit_price: string | null;
  profit_loss_percent: string;
  user_profit_loss: string;
  status: "open" | "closed";
  time_ago: string;
  is_profit: boolean;
}

interface FollowingTrader {
  id: number;
  trader_id: number;
  trader_name: string;
  trader_username: string;
  trader_avatar_url: string | null;
  initial_investment: string;
  started_copying_at: string;
}

const CHIP = {
  background: "rgba(0,201,167,0.1)",
  border: "1px solid rgba(0,201,167,0.2)",
};

function AccordionSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl tv-card h-full overflow-hidden"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 border-b border-[rgba(0,201,167,0.1)] lg:cursor-default"
      >
        <div className="flex items-center gap-3">
          {/* Icon chip */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={CHIP}
          >
            <Icon className="w-[15px] h-[15px] text-[#00C9A7]" />
          </div>
          <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>

        {/* Chevron chip — always visible; rotates on mobile when open */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={CHIP}
        >
          <ChevronDown
            className={`w-4 h-4 text-[#00C9A7] transition-transform lg:!rotate-0 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Body: always open on lg+, accordion on mobile */}
      <div className="hidden lg:block">{children}</div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden lg:hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Empty state shared component ── */
function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-5"
        style={{ background: "rgba(0,201,167,0.08)" }}
      >
        <Icon className="w-8 h-8 text-[#00C9A7] opacity-70" />
      </div>
      <h4 className="text-[15px] font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-[12px] text-gray-400 dark:text-[rgba(255,255,255,0.4)] max-w-[200px] mb-6 leading-relaxed">
        {subtitle}
      </p>
      <Link href="/explore-traders">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="h-11 px-8 rounded-lg text-[13px] font-bold text-[#001011]"
          style={{ background: "#00C9A7" }}
        >
          Explore Traders
        </motion.button>
      </Link>
    </div>
  );
}

export function TradeCopiedSection() {
  const [trades, setTrades] = useState<CopiedTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCopiedTrades(); }, []);

  const fetchCopiedTrades = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/copy-trader/trades/");
      if (!response.ok) throw new Error("Failed to fetch trades");
      const data = await response.json();
      if (data.success) setTrades(data.trades || []);
    } catch (err) {
      console.error("Error fetching copied trades:", err);
    } finally {
      setLoading(false);
    }
  };

  const body = loading ? (
    <div className="flex items-center justify-center py-10">
      <div className="w-5 h-5 border-2 border-[#00C9A7] border-t-transparent rounded-full animate-spin" />
    </div>
  ) : trades.length === 0 ? (
    <EmptyState
      icon={BarChart2}
      title="No trades yet"
      subtitle="Start copying expert traders to see your trades here"
    />
  ) : (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="w-full text-xs min-w-[560px]">
        <thead className="sticky top-0 dark:bg-[#0a1512] backdrop-blur-sm">
          <tr className="border-b border-gray-100 dark:border-[rgba(0,201,167,0.1)]">
            {["Asset", "Type", "Direction", "Price", "PNL", "Status"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[rgba(0,201,167,0.55)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-[rgba(255,255,255,0.04)]">
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-colors">
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {(trade.custom_image_url ?? trade.market_logo_url) && (
                    <Image
                      src={trade.custom_image_url ?? trade.market_logo_url!}
                      alt={trade.market_name}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full shrink-0 object-cover"
                      unoptimized
                    />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">{trade.market_name}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-gray-600 dark:text-[rgba(255,255,255,0.5)] whitespace-nowrap">{trade.market}</td>
              <td className="px-5 py-3 whitespace-nowrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                    trade.direction === "buy"
                      ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                  }`}
                >
                  {trade.direction === "buy" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trade.direction.toUpperCase()}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                ${parseFloat(trade.entry_price).toFixed(2)}
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <span className={`font-semibold ${trade.is_profit ? "text-green-600 dark:text-[#00C9A7]" : "text-red-600 dark:text-red-400"}`}>
                  {trade.is_profit ? "+" : ""}${parseFloat(trade.user_profit_loss).toFixed(2)}
                </span>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <span className={`text-[10px] font-semibold ${trade.status === "open" ? "text-green-700 dark:text-[#00C9A7]" : "text-gray-500 dark:text-[rgba(255,255,255,0.4)]"}`}>
                  {trade.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="h-full"
    >
      <AccordionSection title="Trade History" icon={BarChart2} defaultOpen={false}>
        {body}
      </AccordionSection>
    </motion.div>
  );
}

export function FollowingSection() {
  const [traders, setTraders] = useState<FollowingTrader[]>([]);
  const [filteredTraders, setFilteredTraders] = useState<FollowingTrader[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFollowingTraders(); }, []);

  useEffect(() => {
    setFilteredTraders(
      searchQuery.trim() === ""
        ? traders
        : traders.filter(
            (t) =>
              t.trader_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.trader_username.toLowerCase().includes(searchQuery.toLowerCase())
          )
    );
  }, [searchQuery, traders]);

  const fetchFollowingTraders = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/copy-trader/following/");
      if (!response.ok) throw new Error("Failed to fetch following traders");
      const data = await response.json();
      if (data.success) {
        setTraders(data.traders || []);
        setFilteredTraders(data.traders || []);
      }
    } catch (err) {
      console.error("Error fetching following traders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (avatarUrl: string | null, name: string) =>
    avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;

  const body = loading ? (
    <div className="flex items-center justify-center py-10">
      <div className="w-5 h-5 border-2 border-[#00C9A7] border-t-transparent rounded-full animate-spin" />
    </div>
  ) : traders.length === 0 ? (
    <div className="flex flex-col items-center px-4 pt-4">
      {/* Search input visible even when empty */}
      <input
        type="text"
        placeholder="Search for trader"
        disabled
        className="w-full px-4 py-2.5 mb-2 text-[13px] rounded-lg bg-white dark:bg-[rgba(255,255,255,0.04)] border border-gray-200 dark:border-[rgba(0,201,167,0.15)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[rgba(255,255,255,0.3)] outline-none"
      />
      <EmptyState
        icon={Users}
        title="No experts followed"
        subtitle="Start following expert traders to see them here"
      />
    </div>
  ) : (
    <div className="px-4 py-4">
      <input
        type="text"
        placeholder="Search for trader"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2.5 mb-4 text-[13px] rounded-lg bg-white dark:bg-[rgba(255,255,255,0.04)] border border-gray-200 dark:border-[rgba(0,201,167,0.15)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[rgba(255,255,255,0.3)] outline-none focus:border-[#00C9A7]/50 transition-colors"
      />
      <div className="space-y-3 max-h-[350px] overflow-y-auto">
        {filteredTraders.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-[rgba(255,255,255,0.4)] text-center py-4">
            No traders found matching &quot;{searchQuery}&quot;
          </p>
        ) : (
          filteredTraders.map((trader) => (
            <Link className="inline-block w-full" key={trader.id} href={`/explore-traders/${trader.trader_id}`}>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[rgba(255,255,255,0.04)] hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.07)] transition-all cursor-pointer border border-transparent dark:hover:border-[rgba(0,201,167,0.2)]">
                <Image
                  src={getAvatarUrl(trader.trader_avatar_url, trader.trader_name)}
                  alt={trader.trader_name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{trader.trader_name}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-[rgba(255,255,255,0.4)] truncate">{trader.trader_username}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-[#00C9A7]">
                    ${parseFloat(trader.initial_investment).toLocaleString()}
                  </p>
                  <p className="text-[9px] text-gray-400 dark:text-[rgba(255,255,255,0.3)]">Investment</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="h-full"
    >
      <AccordionSection title="Following" icon={Users} defaultOpen={false}>
        {body}
      </AccordionSection>
    </motion.div>
  );
}
