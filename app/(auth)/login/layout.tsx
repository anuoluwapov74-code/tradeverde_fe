import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your TradeVerdify account and start copying expert traders in real time. Access your portfolio, manage positions, and grow with TradeVerdify.",
  alternates: { canonical: "https://tradeverdify.com/login" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Log In to TradeVerdify",
    description: "Access your TradeVerdify copy trading account.",
    url: "https://tradeverdify.com/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
