import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your TradeVerde account and start copying expert traders in real time. Access your portfolio, manage positions, and grow with TradeVerde.",
  alternates: { canonical: "https://tradeverde.com/login" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Log In to TradeVerde",
    description: "Access your TradeVerde copy trading account.",
    url: "https://tradeverde.com/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
