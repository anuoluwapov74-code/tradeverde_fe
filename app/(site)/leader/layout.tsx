import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Leader Trader — TradeVerde",
  description: "Share your trading expertise on TradeVerde and earn from your followers. Apply to become a Leader Trader, set your strategy, and let others copy your success.",
  alternates: { canonical: "https://tradeverde.com/leader" },
  openGraph: {
    title: "Become a Leader Trader on TradeVerde",
    description: "Share your trades, earn from followers, and grow your reputation on TradeVerde.",
    url: "https://tradeverde.com/leader",
  },
};

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
