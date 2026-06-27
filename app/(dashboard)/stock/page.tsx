"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Stock {
  id: number;
  symbol: string;
  name: string;
  logo_url: string;
  price: string;
  change: string;
  change_percent: string;
  is_positive_change: boolean;
  is_featured: boolean;
}

export default function StockListPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "featured">("all");

  // Fetch stocks from API
  useEffect(() => {
    fetchStocks();
  }, [filterType]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const url =
        filterType === "featured"
          ? "/stocks/?featured=true"
          : "/stocks/";

      const response = await apiFetch(url);
      const data = await response.json();

      if (data.success) {
        setStocks(data.stocks);
        setFilteredStocks(data.stocks);
      } else {
        console.error("Failed to fetch stocks:", data.error);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStocks(stocks);
    } else {
      const filtered = stocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    }
  }, [searchQuery, stocks]);

  const handleStockClick = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            Stock Market
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Trade stocks with real-time market data
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[rgba(0,201,167,0.04)] text-white rounded-lg border-2 border-[rgba(0,201,167,0.14)] focus:border-[#00C9A7] focus:outline-none transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                filterType !== "all"
                  ? "tv-card text-gray-300 hover:opacity-80"
                  : ""
              }`}
              style={filterType === "all" ? { background: "#00C9A7", color: "#001a0f" } : undefined}
            >
              All Stocks
            </button>
            <button
              onClick={() => setFilterType("featured")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                filterType !== "featured"
                  ? "tv-card text-gray-300 hover:opacity-80"
                  : ""
              }`}
              style={filterType === "featured" ? { background: "#00C9A7", color: "#001a0f" } : undefined}
            >
              Featured
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        )}

        {/* Stock Grid */}
        {!loading && filteredStocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((stock) => (
              <div
                key={stock.id}
                onClick={() => handleStockClick(stock.symbol)}
                className="tv-card p-6 rounded-lg hover:border-[#00C9A7] transition-all cursor-pointer hover:shadow-lg hover:shadow-[#00C9A7]/10"
              >
                {/* Stock Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white">
                    {stock.logo_url ? (
                      <Image
                        src={stock.logo_url}
                        alt={stock.name}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold">
                        {stock.symbol.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {stock.symbol}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {stock.name}
                    </p>
                  </div>
                  {stock.is_featured && (
                    <div className="flex-shrink-0">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-medium rounded">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Price */}
                <div className="mb-3">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    $
                    {parseFloat(stock.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {/* Stock Change */}
                <div className="flex items-center gap-2">
                  {stock.is_positive_change ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stock.is_positive_change
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {stock.is_positive_change ? "+" : ""}
                    {parseFloat(stock.change).toFixed(2)} (
                    {parseFloat(stock.change_percent).toFixed(2)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredStocks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery
                ? "No stocks found matching your search"
                : "No stocks available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
