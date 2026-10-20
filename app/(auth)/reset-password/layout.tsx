import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your VerdifyTrades account.",
  alternates: { canonical: "https://verdifytrades.com/reset-password" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Set a New VerdifyTrades Password",
    description: "Create a new password for your VerdifyTrades copy trading account.",
    url: "https://verdifytrades.com/reset-password",
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
