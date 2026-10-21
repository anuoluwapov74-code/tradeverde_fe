import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Leader Trader — TradeVerdify",
  description: "Share your trading expertise on TradeVerdify and earn from your followers. Apply to become a Leader Trader, set your strategy, and let others copy your success.",
  alternates: { canonical: "https://tradeverdify.com/leader" },
  openGraph: {
    title: "Become a Leader Trader on TradeVerdify",
    description: "Share your trades, earn from followers, and grow your reputation on TradeVerdify.",
    url: "https://tradeverdify.com/leader",
  },
};

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
