import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your VerdifyTrades account and start copying expert traders in real time. Access your portfolio, manage positions, and grow with VerdifyTrades.",
  alternates: { canonical: "https://verdifytrades.com/login" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Log In to VerdifyTrades",
    description: "Access your VerdifyTrades copy trading account.",
    url: "https://verdifytrades.com/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
