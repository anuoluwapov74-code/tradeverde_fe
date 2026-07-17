"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  source: string;
  author: string;
  published_at: string;
  image_url: string | null;
  tags: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface NewsListResponse {
  results: NewsItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface NewsDetailResponse {
  success: boolean;
  article: NewsItem & { content: string };
}

const PAGE_SIZE = 24;

function NewsImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-white/5 ${className ?? ""}`}>
        <Newspaper className="w-8 h-8 text-gray-400 dark:text-gray-600" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className ?? ""}`}
      onError={() => setFailed(true)}
    />
  );
}

export default function NewsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);

  const categories = [
    "All",
    "Stocks",
    "Technology",
    "Economy",
    "Cryptocurrency",
    "Commodities",
    "Forex",
  ];

  // Debounce free-text search before it hits the API
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 when the category or search changes (adjust during render, not in an effect)
  const [prevFilters, setPrevFilters] = useState({ selectedCategory, searchQuery });
  if (prevFilters.selectedCategory !== selectedCategory || prevFilters.searchQuery !== searchQuery) {
    setPrevFilters({ selectedCategory, searchQuery });
    if (page !== 1) setPage(1);
  }

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(PAGE_SIZE));
  if (selectedCategory !== "All") params.set("category", selectedCategory);
  if (searchQuery) params.set("search", searchQuery);

  const { data, error, isLoading } = useSWR<NewsListResponse>(
    `/news/?${params.toString()}`
  );

  const { data: detailData, isLoading: detailLoading } = useSWR<NewsDetailResponse>(
    selectedId ? `/news/${selectedId}/` : null
  );

  const newsData = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;
  const selectedNews = data?.results.find((n) => n.id === selectedId) ?? null;
  const selectedArticle = detailData?.success ? detailData.article : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            Market News
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest financial news and market insights
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search news..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-[rgba(0,201,167,0.04)] text-white border-2 border-[rgba(0,201,167,0.14)] rounded-lg focus:outline-none focus:border-[#00C9A7] transition-colors placeholder:text-gray-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory !== category
                    ? "tv-card text-gray-300 hover:opacity-80"
                    : ""
                }`}
              style={selectedCategory === category ? { background: "#00C9A7", color: "#001a0f" } : undefined}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">Failed to load news. Please try again later.</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && newsData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No news found matching your criteria
            </p>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && !error && newsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsData.map((news) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedId(news.id)}
                className="tv-card rounded-2xl overflow-hidden hover:border-[#00C9A7] transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#00C9A7]/10"
              >
                {/* Image */}
                <div className="relative h-48">
                  <NewsImage src={news.image_url} alt={news.title} className="w-full h-full" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                      {news.category}
                    </span>
                  </div>
                  {news.is_featured && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {news.summary}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>{news.source}</span>
                    <span>{formatDate(news.published_at)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg tv-card text-gray-400 disabled:opacity-40 hover:border-[#00C9A7] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-gray-400 text-sm">
              Page <span className="text-white font-semibold">{page}</span> of{" "}
              <span className="text-white font-semibold">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg tv-card text-gray-400 disabled:opacity-40 hover:border-[#00C9A7] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedNews && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/70 dark:bg-black/50 flex items-center justify-center p-4 z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedId(null)}
            >
              <div
                className="rounded-2xl max-w-4xl w-full h-[95vh] flex flex-col overflow-hidden bg-white dark:bg-[#0b1a12] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute top-4 right-4 w-12 h-12 bg-black/80 dark:bg-white/90 hover:bg-black dark:hover:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center transition-all shadow-lg z-10"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" strokeWidth={3} />
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">
                  {/* Modal Header - Banner Image */}
                  <div className="relative h-64 sm:h-80">
                    <NewsImage src={selectedNews.image_url} alt={selectedNews.title} className="w-full h-full" />
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                        {selectedNews.category}
                      </span>
                      {selectedNews.is_featured && (
                        <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 sm:p-8">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
                      {selectedNews.title}
                    </h2>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{selectedNews.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                        <span>{selectedNews.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{formatDate(selectedNews.published_at)}</span>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 space-y-4">
                      {detailLoading && !selectedArticle && (
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-5/6" />
                          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-4/6" />
                        </div>
                      )}
                      {selectedArticle?.content
                        ? selectedArticle.content.split("\n").map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))
                        : !detailLoading && <p>{selectedNews.summary}</p>}
                    </div>

                    {/* Tags */}
                    {selectedNews.tags && selectedNews.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedNews.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedId(null)}
                      className="w-full py-3 bg-[#00C9A7] hover:opacity-90 text-[#001a0f] font-semibold rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
