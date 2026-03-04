"use client";

import { DashboardProvider } from "@/context";
import { useDashboard } from "@/hook";
import {
  Activity,
  Bell,
  HomeIcon,
  Tag,
  User,
  Wallet,
  PieChart,
  Zap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: HomeIcon, key: "home", link: "/dashboard" },
  { icon: Activity, key: "transaction", link: "/dashboard/transaction" },
  { icon: PieChart, key: "budget", link: "/dashboard/budget" },
  { icon: BarChart3, key: "analytics", link: "/dashboard/analytics" },
  { icon: Zap, key: "subscription", link: "/dashboard/subscription" },
  { icon: Wallet, key: "wallet", link: "/dashboard/wallet" },
  { icon: Tag, key: "tag", link: "/dashboard/tag" },
  { icon: User, key: "user", link: "/dashboard/user" },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { title, subtitle, topContent } = useDashboard();
  const pathname = usePathname();

  return (
    <div className="flex h-dvh w-full bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Desktop Left Sidebar Nav */}
      <aside className="hidden md:flex flex-col w-25 h-full bg-white border-r border-slate-200 py-8 items-center justify-between z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="space-y-8 flex flex-col items-center">
          {/* Logo Placeholder */}
          <div className="size-12 flex items-center justify-center text-primary font-black text-xl shadow-inner">
            LIMIT
          </div>

          <nav className="flex flex-col gap-6 w-full px-4">
            {NAV_ITEMS.slice(0, 7).map(({ icon: Icon, key, link }) => {
              const isActive = pathname === link;
              return (
                <Link
                  key={key}
                  href={link}
                  className={
                    isActive
                      ? "bg-primary shadow-lg shadow-primary/30 p-3.5 rounded-2xl text-white transition-transform hover:scale-105 flex justify-center"
                      : "p-3.5 rounded-2xl text-slate-400 hover:text-primary transition-all hover:bg-slate-50 flex justify-center group"
                  }
                >
                  <Icon
                    size={24}
                    strokeWidth={2.5}
                    className={
                      !isActive
                        ? "group-hover:scale-110 transition-transform"
                        : ""
                    }
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href={NAV_ITEMS[7].link}
          className={
            pathname === NAV_ITEMS[7].link
              ? "p-3.5 mt-auto bg-primary shadow-lg shadow-primary/30 rounded-2xl text-white transition-transform hover:scale-105 flex justify-center"
              : "p-3.5 mt-auto rounded-2xl text-slate-400 hover:text-primary transition-all hover:bg-slate-50 flex justify-center group"
          }
        >
          <User
            size={24}
            strokeWidth={2.5}
            className={
              pathname !== NAV_ITEMS[7].link
                ? "group-hover:scale-110 transition-transform"
                : ""
            }
          />
        </Link>
      </aside>

      {/* Main Content Area (Scrollable) */}
      <main
        className="flex-1 h-full overflow-y-auto relative [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Mobile Banner / Desktop Header Wrapper */}
        <div className="bg-primary md:bg-transparent min-h-65 md:min-h-0 w-full pt-8 px-6 md:px-10 lg:px-12 md:py-10 text-white md:text-slate-900 pb-30 md:pb-0 relative">
          {/* Header Content */}
          <header className="flex justify-between items-start md:items-center max-w-7xl mx-auto relative z-10 box-border">
            <div className="space-y-1 md:space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-base md:text-lg opacity-90 md:opacity-60 font-medium md:font-normal">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="bg-white/20 md:bg-white hover:bg-white/30 md:hover:bg-slate-50 transition-colors p-3 rounded-2xl backdrop-blur-md cursor-pointer border border-white/20 md:border-slate-200 shadow-sm text-white md:text-slate-600">
              <Bell size={24} />
            </div>
          </header>

          {/* Desktop Top Content Injection */}
          <div className="hidden md:block w-full max-w-7xl mx-auto mt-10 box-border">
            {topContent}
          </div>
        </div>

        {/* Mobile Overlapping Container & Main Dashboard Canvas */}
        <div className="bg-[#F8FAFC] md:bg-transparent rounded-t-[2.5rem] md:rounded-t-none -mt-25 md:mt-0 p-6 sm:p-8 md:p-10 lg:p-12 relative min-h-[calc(100vh-200px)] md:min-h-0 z-10 box-border">
          {/* Mobile Top Content Injection */}
          <div className="md:hidden w-full mb-8">{topContent}</div>

          {/* Children / Transactions Area */}
          <div className="max-w-7xl mx-auto w-full pb-32 md:pb-12 box-border">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav Bar */}
      <div className="md:hidden fixed bottom-6 left-0 w-full flex justify-center px-4 pointer-events-none z-50">
        <div className="bg-white/80 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-4xl flex justify-between items-center px-6 py-3.5 w-full max-w-105 pointer-events-auto border border-white/50">
          {NAV_ITEMS.slice(0, 6).map(({ icon: Icon, key, link }) => {
            const isActive = pathname === link;
            return (
              <Link
                key={key}
                href={link}
                className={
                  isActive
                    ? "bg-primary shadow-lg shadow-primary/30 p-2.5 sm:p-3 rounded-[1.25rem] text-white transition-transform hover:scale-105"
                    : "p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-primary transition-all hover:-translate-y-1"
                }
              >
                <Icon size={24} strokeWidth={2.5} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
