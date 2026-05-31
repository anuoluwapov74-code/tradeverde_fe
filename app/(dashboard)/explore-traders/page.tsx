"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PulseLoader } from "react-spinners";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface Trader {
  id: number;
  name: string;
  username: string;
  avatar_url: string | null;
  badge: string;
  country: string;
  gain: string;
  risk: number;
  trades: number;
  copiers: number;
  trend_direction: string;
  category: string;
  is_active: boolean;
}

const categories = [
  { key: "all", label: "All" },
  { key: "crypto", label: "Crypto" },
  { key: "stocks", label: "Stocks" },
  { key: "healthcare", label: "Healthcare" },
  { key: "financial", label: "Financial Services" },
  { key: "options", label: "Options" },
  { key: "tech", label: "Tech" },
  { key: "etf", label: "ETF" },
];

const faqs = [
  {
    question: "What is Copy Trading?",
    answer:
      "Copy trading is an investment method that allows individuals to automatically copy the trades of professional or experienced traders. Instead of making trading decisions yourself, you select a trader to follow, and your account mirrors their positions in real time.",
  },
  {
    question: "How do I copy an Expert?",
    answer:
      "Simply browse through our top traders, review their performance metrics, and click the 'Copy' button on their profile. You can set your investment amount and risk parameters before starting to copy their trades.",
  },
  {
    question: "How can I stop copying an Expert?",
    answer:
      "You can stop copying an expert at any time by going to your active copies section and clicking 'Stop Copying'. Your current positions can be closed immediately or you can choose to keep them open.",
  },
  {
    question: "Why don't I receive any trades from copied experts?",
    answer:
      "This could be because the expert hasn't made any trades recently, your account balance is insufficient for the minimum trade size, or there may be trading restrictions on your account. Check your copy trading settings and account status.",
  },
];

// Mini trend line icon
const TrendIcon: React.FC<{ direction: string }> = ({ direction }) => {
  const isUp = direction === "upward";
  const color = isUp ? "#6b7280" : "#6b7280";
  const upPath = "M2,12 L6,9 L10,11 L14,6 L18,8 L22,3";
  const downPath = "M2,3 L6,6 L10,4 L14,9 L18,7 L22,12";

  return (
    <svg
      width="24"
      height="14"
      viewBox="0 0 24 14"
      fill="none"
      className="shrink-0"
    >
      <path
        d={isUp ? upPath : downPath}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const getAvatarUrl = (avatarUrl: string | null, name: string) => {
  return (
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&size=128`
  );
};

const formatGain = (gain: string) => {
  const val = parseFloat(gain);
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)}K`;
  }
  return val.toFixed(2);
};

export default function ExploreTraders() {
  const [activeTab, setActiveTab] = useState<"experts" | "howItWorks">(
    "experts"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Embla carousel for Trending Investors
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      slidesToScroll: 1,
      containScroll: "trimSnaps",
      loop: true,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch ALL traders (only search filter goes to API, NOT category)
  useEffect(() => {
    fetchTraders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const fetchTraders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const queryString = params.toString();
      const endpoint = `/traders/${queryString ? `?${queryString}` : ""}`;

      const response = await apiFetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTraders(data);
    } catch (err) {
      setError("Failed to load traders. Please try again later.");
      console.error("Error fetching traders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trending & Rising Stars always use all traders
  const trendingTraders = traders.slice(0, 4);
  const risingStars = traders.slice(4, 8);

  // Category filter is CLIENT-SIDE, only for "Most copied by categories"
  const categorizedTraders = useMemo(() => {
    if (activeCategory === "all") return traders;
    return traders.filter(
      (t) => t.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [traders, activeCategory]);

  return (
    <div className="w-full min-h-screen rounded-2xl ">
      {/* ========== HERO BANNER (image1) ========== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative bg-lime-400 dark:bg-lime-500 rounded-2xl overflow-hidden px-6 sm:px-10 py-10 sm:py-14 min-h-[220px] sm:min-h-[280px]">
          {/* Background chart line SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 800 300"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0,250 C50,240 100,230 150,220 C200,210 250,200 300,180 C350,160 400,150 450,140 C500,130 520,125 550,110 C580,95 620,80 660,70 C700,60 740,55 800,50"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M0,270 C80,265 160,260 240,250 C320,240 380,225 440,210 C500,195 540,180 580,165 C620,150 680,130 720,115 C760,100 780,90 800,80"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Content */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left text */}
            <div className="max-w-md">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                When they grow, you grow
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-800">
                You can use copy trader to copy the moves of experienced
                investors.
              </p>
            </div>

            {/* Right side - Avatars and stats */}
            <div className="flex items-end gap-4 sm:gap-6">
              {/* Stacked avatars */}
              <div className="flex -space-x-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                  <Image
                    src="/team/banner_1.jpg"
                    width={56}
                    height={56}
                    alt="Trader"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white bg-gray-500 overflow-hidden">
                  <Image
                    src="/team/banner_2.jpg"
                    width={56}
                    height={56}
                    alt="Trader"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white bg-gray-700 overflow-hidden">
                  <Image
                    src="/team/banner_3.jpg"
                    width={56}
                    height={56}
                    alt="Trader"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    31.18%
                  </span>
                  <svg
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                  >
                    <path
                      d="M1,8 L4,6 L8,7 L12,3 L15,1"
                      stroke="#166534"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    24.96%
                  </span>
                  <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SEARCH BAR ========== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0d3320] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-10 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ========== TABS ========== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 border-b border-gray-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab("experts")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "experts"
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            Top Experts
            {activeTab === "experts" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("howItWorks")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "howItWorks"
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            How It Works
            {activeTab === "howItWorks" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* ========== CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "experts" ? (
          <>
            {/* Loading */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <PulseLoader color="#27ae60" size={15} />
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
                <button
                  onClick={fetchTraders}
                  className="mt-4 px-6 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && traders.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  {debouncedSearch
                    ? `No traders found matching "${debouncedSearch}"`
                    : "No traders found"}
                </p>
                {debouncedSearch && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-6 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

            {!loading && !error && traders.length > 0 && (
              <>
                {/* ========== TRENDING INVESTORS (carousel) ========== */}
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Trending Investors
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => emblaApi?.scrollPrev()}
                        disabled={!canScrollPrev}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        aria-label="Previous"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => emblaApi?.scrollNext()}
                        disabled={!canScrollNext}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        aria-label="Next"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Investors with the most popularity of copy among others
                  </p>

                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4">
                      {trendingTraders.map((trader) => (
                        <div
                          key={trader.id}
                          className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(25%-12px)]"
                        >
                          <Link
                            href={`/explore-traders/${trader.id}`}
                            className="group block bg-white dark:bg-[#0d3320] rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all h-full"
                          >
                            {/* Card Header - Dark top section */}
                            <div className="bg-gray-800 dark:bg-[#071a0e] px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 dark:border-gray-500 bg-gray-700 shrink-0">
                                  {trader.avatar_url ? (
                                    <Image
                                      src={getAvatarUrl(
                                        trader.avatar_url,
                                        trader.name
                                      )}
                                      width={48}
                                      height={48}
                                      alt={trader.name}
                                      className="w-full h-full object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-semibold text-lg">
                                      {trader.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-white truncate">
                                    {trader.name}
                                  </h3>
                                  <p className="text-xs text-gray-400">
                                    {trader.badge === "gold"
                                      ? "Earning trader"
                                      : trader.risk >= 7
                                      ? "High risk"
                                      : "Active trader"}
                                  </p>
                                </div>
                              </div>
                              {/* Badges */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-2.5 py-1 bg-lime-400/20 text-lime-400 text-[10px] font-medium rounded-full">
                                  Trending Investors
                                </span>
                                {trader.badge === "gold" && (
                                  <span className="px-2.5 py-1 bg-lime-400/20 text-lime-400 text-[10px] font-medium rounded-full">
                                    Long track record
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Body - Stats */}
                            <div className="px-4 py-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatGain(trader.gain)}%
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <TrendIcon
                                      direction={
                                        trader.trend_direction || "upward"
                                      }
                                    />
                                  </div>
                                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                    Profit (1M)
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {trader.copiers.toLocaleString()}
                                  </p>
                                  <div className="flex items-center justify-end gap-1 mt-0.5">
                                    <TrendIcon
                                      direction={
                                        trader.trend_direction || "upward"
                                      }
                                    />
                                  </div>
                                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                    Copiers
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ========== RISING STARS (image3) ========== */}
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Rising Stars
                    </h2>
                    
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Check new traders with great potential, grasp investment
                    opportunities
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {risingStars.map((trader) => (
                      <Link
                        key={trader.id}
                        href={`/explore-traders/${trader.id}`}
                        className="group bg-white dark:bg-[#0d3320] rounded-xl border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all overflow-hidden"
                      >
                        {/* Top section - Avatar and name */}
                        <div className="px-4 pt-4 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 shrink-0">
                              {trader.avatar_url ? (
                                <Image
                                  src={getAvatarUrl(
                                    trader.avatar_url,
                                    trader.name
                                  )}
                                  width={56}
                                  height={56}
                                  alt={trader.name}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold text-xl">
                                  {trader.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                {trader.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Rising Star
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stats row - gray background */}
                        <div className="mx-4 mb-3 bg-gray-50 dark:bg-[#071a0e] rounded-lg px-4 py-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                {formatGain(trader.gain)}%
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <TrendIcon
                                  direction={
                                    trader.trend_direction || "upward"
                                  }
                                />
                              </div>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                Profit (1M)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                {trader.copiers.toLocaleString()}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <TrendIcon
                                  direction={
                                    trader.trend_direction || "upward"
                                  }
                                />
                              </div>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                Copiers
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Risk level */}
                        <div className="px-4 pb-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Risk level:
                          </p>
                          <div className="flex gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full ${
                                  level <= trader.risk
                                    ? trader.risk <= 3
                                      ? "bg-green-400"
                                      : trader.risk <= 6
                                      ? "bg-yellow-400"
                                      : "bg-red-400"
                                    : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Copy Trader button */}
                        <div className="px-4 pb-4 pt-3">
                          <div className="w-full py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-center text-sm font-semibold text-gray-900 dark:text-white group-hover:bg-gray-50 dark:group-hover:bg-[#0d3320] transition-colors">
                            Copy trader
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* ========== MOST COPIED BY CATEGORIES (image4) ========== */}
                <section>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Most copied by categories
                    </h2>
                    
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Explore traders that are copied the most based on our
                    categories
                  </p>

                  {/* Category Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                          activeCategory === cat.key
                            ? "border-gray-900 dark:border-white bg-transparent text-gray-900 dark:text-white"
                            : "border-gray-300 dark:border-white/10 bg-transparent text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/20"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Progress bar under tabs */}
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((categories.findIndex(
                            (c) => c.key === activeCategory
                          ) +
                            1) /
                            categories.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  {/* Filtered traders list */}
                  {categorizedTraders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Users className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No traders found in this category
                      </p>
                      <button
                        onClick={() => setActiveCategory("all")}
                        className="mt-3 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-400 font-medium transition-colors"
                      >
                        View all categories
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categorizedTraders.map((trader, index) => (
                        <Link
                          key={trader.id}
                          href={`/explore-traders/${trader.id}`}
                          className="group flex items-center gap-3 sm:gap-4 bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-white/5 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all"
                        >
                          {/* Rank Number */}
                          <div className="shrink-0 w-8 sm:w-12">
                            <span
                              className={`text-3xl sm:text-5xl font-extrabold ${
                                index < 3
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </div>

                          {/* Avatar with green ring */}
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full p-0.5 bg-linear-to-br from-lime-400 to-green-500">
                              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                                {trader.avatar_url ? (
                                  <Image
                                    src={getAvatarUrl(
                                      trader.avatar_url,
                                      trader.name
                                    )}
                                    width={56}
                                    height={56}
                                    alt={trader.name}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-lime-400 dark:bg-lime-500 text-gray-900 font-bold text-sm sm:text-lg">
                                    {trader.username.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Username */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {trader.username}
                            </h3>
                          </div>

                          {/* Profit */}
                          <div className="shrink-0 text-right">
                            <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
                              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                {formatGain(trader.gain)}%
                              </span>
                              <TrendIcon
                                direction={
                                  trader.trend_direction || "upward"
                                }
                              />
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                              Profit (1M)
                            </p>
                          </div>

                          {/* Copiers */}
                          <div className="shrink-0 text-right">
                            <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
                              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                {trader.copiers.toLocaleString()}
                              </span>
                              <TrendIcon
                                direction={
                                  trader.trend_direction || "upward"
                                }
                              />
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                              Copiers
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        ) : (
          /* How It Works - FAQ Section */
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Everything you need to know about copy trading
              </p>
            </div>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#0d3320] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-[#0d3320]/30 transition-all"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
