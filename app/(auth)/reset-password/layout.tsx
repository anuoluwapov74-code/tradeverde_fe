import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your TradeVerde account.",
  alternates: { canonical: "https://tradeverde.com/reset-password" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Set a New TradeVerde Password",
    description: "Create a new password for your TradeVerde copy trading account.",
    url: "https://tradeverde.com/reset-password",
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
