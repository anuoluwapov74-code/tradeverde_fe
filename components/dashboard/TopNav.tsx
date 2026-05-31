"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  Home,
  Users,
  BarChart3,
  Radio,
  Newspaper,
  LineChart,
  Receipt,
  History,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NotificationDropdown from "./portfolio/NotificationDropdown";
import UserProfileMenu from "./portfolio/UserProfileMenu";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

const primaryLinks = [
  { name: "Dashboard", href: "/portfolio", icon: Home },
  { name: "Traders", href: "/explore-traders", icon: Users },
  { name: "Markets", href: "/stock", icon: BarChart3 },
  { name: "Live Trade", href: "/live-trading", icon: Radio },
  { name: "News", href: "/news", icon: Newspaper },
];

const moreLinks = [
  { name: "Signals", href: "/signals", icon: LineChart },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Trade History", href: "/trade-history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface AuthUser {
  email: string;
  first_name: string;
  last_name: string;
  account_id: string;
}

interface TopNavProps {
  onMenuClick: () => void;
  user: AuthUser | null;
}

export default function TopNav({ onMenuClick, user }: TopNavProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const pathname = usePathname();
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close "More" dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await apiFetch("/notifications/recent/");
      const data = await response.json();
      if (data.success) {
        setNotificationCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check if a "more" link is currently active
  const isMoreActive = moreLinks.some((link) => pathname === link.href);

  return (
    <header className="h-14 bg-white/80 dark:bg-[#071a0e]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-[rgba(39,174,96,0.15)] sticky top-0 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side - Logo + Nav Links */}
        <div className="flex items-center space-x-1 lg:space-x-6">
          {/* Hamburger - mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Trade<span className="text-green-600 dark:text-green-400">Verde</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-0.5">
            {primaryLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setShowMore(!showMore)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isMoreActive || showMore
                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
                <span>More</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    showMore ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showMore && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#0d3320] rounded-xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden py-1"
                  >
                    {moreLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setShowMore(false)}
                          className={`flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                            isActive
                              ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          <link.icon className="w-4 h-4" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                setShowMore(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationDropdown
                  onClose={() => setShowNotifications(false)}
                  onNotificationUpdate={fetchUnreadCount}
                />
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowMore(false);
              }}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-semibold text-[10px]">
                {user
                  ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
                  : ""}
              </div>
              <span className="hidden sm:block text-xs font-medium text-gray-700 dark:text-gray-300">
                Hey, {user?.first_name || "User"}!
              </span>
              <ChevronDown className="hidden sm:block w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <UserProfileMenu
                  onClose={() => setShowUserMenu(false)}
                  user={user}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
