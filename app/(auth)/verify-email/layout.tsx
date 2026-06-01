import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your VerdeTrades account and start copy trading.",
  alternates: { canonical: "https://verdetrades.com/verify-email" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Verify Your VerdeTrades Email",
    description: "Activate your VerdeTrades account by verifying your email address.",
    url: "https://verdetrades.com/verify-email",
  },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
