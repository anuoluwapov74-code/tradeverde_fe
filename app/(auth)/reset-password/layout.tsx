import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your VerdeTrades account.",
  alternates: { canonical: "https://verdetrades.com/reset-password" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Set a New VerdeTrades Password",
    description: "Create a new password for your VerdeTrades copy trading account.",
    url: "https://verdetrades.com/reset-password",
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
