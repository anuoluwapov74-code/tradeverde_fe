import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Leader Trader — VerdeTrades Pro",
  description: "Share your trading expertise on VerdeTrades Pro and earn from your followers. Apply to become a Leader Trader, set your strategy, and let others copy your success.",
  alternates: { canonical: "https://verdetradepro.com/leader" },
  openGraph: {
    title: "Become a Leader Trader on VerdeTrades Pro",
    description: "Share your trades, earn from followers, and grow your reputation on VerdeTrades Pro.",
    url: "https://verdetradepro.com/leader",
  },
};

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
