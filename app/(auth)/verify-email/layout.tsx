import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your VerdeTrades Pro account and start copy trading.",
  alternates: { canonical: "https://verdetradepro.com/verify-email" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Verify Your VerdeTrades Pro Email",
    description: "Activate your VerdeTrades Pro account by verifying your email address.",
    url: "https://verdetradepro.com/verify-email",
  },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
