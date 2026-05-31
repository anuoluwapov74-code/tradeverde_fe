import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your TradeVerde account and start copy trading.",
  alternates: { canonical: "https://tradeverde.com/verify-email" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Verify Your TradeVerde Email",
    description: "Activate your TradeVerde account by verifying your email address.",
    url: "https://tradeverde.com/verify-email",
  },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
