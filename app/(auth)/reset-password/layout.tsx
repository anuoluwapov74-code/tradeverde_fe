import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your TradeVerdify account.",
  alternates: { canonical: "https://tradeverdify.com/reset-password" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Set a New TradeVerdify Password",
    description: "Create a new password for your TradeVerdify copy trading account.",
    url: "https://tradeverdify.com/reset-password",
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
