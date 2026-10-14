import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your VerdeTrades Pro account and start copying expert traders in real time. Access your portfolio, manage positions, and grow with VerdeTrades Pro.",
  alternates: { canonical: "https://verdetradepro.com/login" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Log In to VerdeTrades Pro",
    description: "Access your VerdeTrades Pro copy trading account.",
    url: "https://verdetradepro.com/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
