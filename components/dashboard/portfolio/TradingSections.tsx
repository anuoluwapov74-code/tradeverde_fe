"use client";

import { motion } from "framer-motion";
import { BarChart3, Users, TrendingUp, TrendingDown } from "lucide-react";
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

export function TradeCopiedSection() {
  const [trades, setTrades] = useState<CopiedTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCopiedTrades();
  }, []);

  const fetchCopiedTrades = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/copy-trader/trades/");

      if (!response.ok) {
        throw new Error("Failed to fetch trades");
      }

      const data = await response.json();

      if (data.success) {
        setTrades(data.trades || []);
      }
    } catch (err) {
      console.error("Error fetching copied trades:", err);
      setError("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = !loading && trades.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-lg bg-white/80 dark:bg-[#0d3320]/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm h-full"
    >
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
          Trade Copied
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 px-5">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <BarChart3 className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>

          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            No trades yet
          </h4>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center max-w-xs mb-5">
            Start copying expert traders to see your trades here
          </p>

          <Link href="/explore-traders">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Explore Traders
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-100 overflow-y-auto">
          <table className="w-full text-xs min-w-140">
            <thead className="sticky top-0 bg-white/95 dark:bg-[#0d3320]/95 backdrop-blur-sm">
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-2.5 text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Asset</th>
                <th className="px-3 py-2.5 text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Type</th>
                <th className="px-3 py-2.5 text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Direction</th>
                <th className="px-3 py-2.5 text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Price</th>
                <th className="px-3 py-2.5 text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">PNL</th>
                <th className="px-3 py-2.5 text-left text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-2.5 whitespace-nowrap">
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
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trade.market_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {trade.market}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        trade.direction === "buy"
                          ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {trade.direction === "buy" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {trade.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white whitespace-nowrap">
                    ${parseFloat(trade.entry_price).toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        trade.is_profit
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {trade.is_profit ? "+" : ""}${parseFloat(trade.user_profit_loss).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-medium ${
                        trade.status === "open"
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {trade.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export function FollowingSection() {
  const [traders, setTraders] = useState<FollowingTrader[]>([]);
  const [filteredTraders, setFilteredTraders] = useState<FollowingTrader[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowingTraders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTraders(traders);
    } else {
      const filtered = traders.filter(
        (trader) =>
          trader.trader_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trader.trader_username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTraders(filtered);
    }
  }, [searchQuery, traders]);

  const fetchFollowingTraders = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/copy-trader/following/");

      if (!response.ok) {
        throw new Error("Failed to fetch following traders");
      }

      const data = await response.json();

      if (data.success) {
        setTraders(data.traders || []);
        setFilteredTraders(data.traders || []);
      }
    } catch (err) {
      console.error("Error fetching following traders:", err);
      setError("Failed to load traders");
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = !loading && traders.length === 0;

  const getAvatarUrl = (avatarUrl: string | null, name: string) => {
    return (
      avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=random&size=128`
    );
  };

  console.log(filteredTraders);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-lg bg-white/80 dark:bg-[#0d3320]/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm h-full"
    >
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
          Following
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 px-5">
          {/* Search Input */}
          <div className="w-full mb-6">
            <input
              type="text"
              placeholder="Search for trader"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-600/50 transition-all"
              disabled
            />
          </div>

          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>

          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            No experts followed
          </h4>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center max-w-xs mb-5">
            Start following expert traders to see them here
          </p>

          <Link href="/explore-traders">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Explore Traders
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="px-5 py-3">
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search for trader"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-600/50 transition-all"
            />
          </div>

          {/* Trader Cards */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {filteredTraders.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                No traders found matching &quot;{searchQuery}&quot;
              </p>
            ) : (
              filteredTraders.map((trader) => (
                <Link className="inline-block w-full" key={trader.id} href={`/explore-traders/${trader.trader_id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-green-500/30">
                    <Image
                      src={getAvatarUrl(trader.trader_avatar_url, trader.trader_name)}
                      alt={trader.trader_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      unoptimized
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {trader.trader_name}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {trader.trader_username}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-green-700 dark:text-green-400">
                        ${parseFloat(trader.initial_investment).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500">
                        Investment
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
