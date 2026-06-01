import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your VerdeTrades account and start copying expert traders in real time. Access your portfolio, manage positions, and grow with VerdeTrades.",
  alternates: { canonical: "https://verdetrades.com/login" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Log In to VerdeTrades",
    description: "Access your VerdeTrades copy trading account.",
    url: "https://verdetrades.com/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
