import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your VerdifyTrades account password. Enter your email address and we will send you a link to regain access to your copy trading account.",
  alternates: { canonical: "https://verdifytrades.com/forgot-password" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Reset Your VerdifyTrades Password",
    description: "Regain access to your VerdifyTrades copy trading account.",
    url: "https://verdifytrades.com/forgot-password",
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
