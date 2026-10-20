import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Leader Trader — VerdifyTrades",
  description: "Share your trading expertise on VerdifyTrades and earn from your followers. Apply to become a Leader Trader, set your strategy, and let others copy your success.",
  alternates: { canonical: "https://verdifytrades.com/leader" },
  openGraph: {
    title: "Become a Leader Trader on VerdifyTrades",
    description: "Share your trades, earn from followers, and grow your reputation on VerdifyTrades.",
    url: "https://verdifytrades.com/leader",
  },
};

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
