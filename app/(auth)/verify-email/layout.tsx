import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your TradeVerdify account and start copy trading.",
  alternates: { canonical: "https://tradeverdify.com/verify-email" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Verify Your TradeVerdify Email",
    description: "Activate your TradeVerdify account by verifying your email address.",
    url: "https://tradeverdify.com/verify-email",
  },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
