"use client";

import { Activity, Bell, HomeIcon, Tag, User, Wallet } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/components";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { title, subtitle, topContent } = useDashboard();

  return (
    <div className="min-h-svh bg-primary flex flex-col relative">
      <div className="h-44 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
          </div>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <Bell size={20} />
          </div>
        </div>
        <div className="mt-4">{topContent}</div>
      </div>

      <div className="flex-1 bg-snow rounded-t-cxl p-8 relative pb-24">
        {children}

        <div className="fixed bottom-0 left-0 w-full flex justify-center p-4 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-3xl flex justify-between px-8 py-3 w-full max-w-md pointer-events-auto border border-primary/10">
            <div className="bg-primary p-2 rounded-2xl text-white">
              <HomeIcon size={24} className="cursor-pointer" />
            </div>
            <div className="p-2 rounded-2xl text-primary/60">
              <Activity size={24} className="cursor-pointer" />
            </div>
            <div className="p-2 rounded-2xl text-primary/60">
              <Wallet size={24} className="cursor-pointer" />
            </div>
            <div className="p-2 rounded-2xl text-primary/60">
              <Tag size={24} className="cursor-pointer" />
            </div>
            <div className="p-2 rounded-2xl text-primary/60">
              <User size={24} className="cursor-pointer" />
            </div>
          </div>
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
