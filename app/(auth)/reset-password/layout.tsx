import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your VerdeTrades Pro account.",
  alternates: { canonical: "https://verdetradepro.com/reset-password" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Set a New VerdeTrades Pro Password",
    description: "Create a new password for your VerdeTrades Pro copy trading account.",
    url: "https://verdetradepro.com/reset-password",
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
