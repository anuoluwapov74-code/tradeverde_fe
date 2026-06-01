import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Leader Trader — VerdeTrades",
  description: "Share your trading expertise on VerdeTrades and earn from your followers. Apply to become a Leader Trader, set your strategy, and let others copy your success.",
  alternates: { canonical: "https://verdetrades.com/leader" },
  openGraph: {
    title: "Become a Leader Trader on VerdeTrades",
    description: "Share your trades, earn from followers, and grow your reputation on VerdeTrades.",
    url: "https://verdetrades.com/leader",
  },
};

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
