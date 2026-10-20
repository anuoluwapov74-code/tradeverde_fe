import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your VerdifyTrades account and start copy trading.",
  alternates: { canonical: "https://verdifytrades.com/verify-email" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Verify Your VerdifyTrades Email",
    description: "Activate your VerdifyTrades account by verifying your email address.",
    url: "https://verdifytrades.com/verify-email",
  },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
