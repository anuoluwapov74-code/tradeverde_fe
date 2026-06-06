"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import { apiFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";
import Preloader from "@/components/Preloader";

export interface AuthUser {
  email: string;
  first_name: string;
  last_name: string;
  account_id: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  has_submitted_kyc: boolean;
}

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<
    "loading" | "authenticated" | "redirecting"
  >("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function verifyAuth() {
      try {
        const res = await apiFetch("/check/");
        if (cancelled) return;
        if (!res.ok) {
          setAuthState("redirecting");
          router.replace("/login");
          return;
        }
        const data = await res.json();
        // KYC gate: redirect to KYC if not submitted
        if (!data?.user?.has_submitted_kyc) {
          setAuthState("redirecting");
          router.replace("/kyc");
          return;
        }
        setUser(data.user);
        setAuthState("authenticated");
      } catch {
        if (cancelled) return;
        setAuthState("redirecting");
        router.replace("/login");
      }
    }
    verifyAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Silent proactive token refresh — keeps the session alive without waiting for a 401.
  // Fires every 6 hours and also whenever the user returns to a backgrounded tab.
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        await fetch(`${BACKEND_URL}/token/refresh/`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        // Silent — apiFetch 401-retry is the fallback safety net
      }
    };

    // Re-run refresh when the user brings the tab back into focus
    const handleVisibility = () => {
      if (document.visibilityState === "visible") silentRefresh();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Also refresh on a 6-hour interval for long-running open tabs
    const interval = setInterval(silentRefresh, 6 * 60 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, []);

  if (authState !== "authenticated") {
    return <Preloader />;
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top Navigation */}
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} user={user} />

        {/* Sidebar Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
