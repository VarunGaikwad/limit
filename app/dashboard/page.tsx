"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  ShoppingBag,
  ShoppingCart,
  Activity,
  CreditCard,
  Plus,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { Card, Modal } from "@/components";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const [currentMenu, setCurrentMenu] = useState("All");
  const supabase = createClient();

  // 1. Fetch User Data (Cached)
  const { data: userData } = useSWR("user-profile", async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      name:
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      id: user.id,
    };
  });

  // 2. Fetch Transactions (Cached)
  const { data: transactions = [], isLoading: transLoading } = useSWR(
    "recent-transactions",
    async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(20);
      return data || [];
    },
  );

  // 3. Fetch Budgets (Cached & Enriched)
  const { data: budgets = [], isLoading: budgetsLoading } = useSWR(
    "dashboard-budgets",
    async () => {
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (!budgetData) return [];

      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      const { data: monthTrans } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", startOfMonth)
        .eq("type", "expense");

      const colors = [
        "bg-indigo-500",
        "bg-blue-500",
        "bg-orange-500",
        "bg-emerald-500",
      ];
      return budgetData.map((b: any, idx: number) => {
        const categoryIds = b.category_ids || [];
        const spent = (monthTrans || [])
          .filter((t: any) => categoryIds.includes(t.category_id))
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
        return {
          ...b,
          spentAmount: spent,
          fill: colors[idx % colors.length],
        };
      });
    },
  );

  const filteredTransactions = transactions.filter((t: any) => {
    if (currentMenu === "All") return true;
    return t.type.toLowerCase() === currentMenu.toLowerCase();
  });

  useEffect(() => {
    const hours = new Date().getHours();
    const greeting =
      hours < 12
        ? "Good Morning"
        : hours < 17
          ? "Good Afternoon"
          : "Good Evening";

    setTitle(`${greeting}, ${userData?.name || "User"}!`);
    setSubtitle("Here's what's happening with your money today.");

    setTopContent(
      <div
        className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-5 md:gap-6 pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden pt-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {budgets.map((budget: any) => {
          const remaining = budget.amount - budget.spentAmount;
          const percentage = Math.min(
            (budget.spentAmount / budget.amount) * 100,
            100,
          );
          return (
            <Card
              key={budget.id}
              className="w-[85%] md:w-full shrink-0 snap-center md:snap-none p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
            >
              <div className="space-y-1">
                <div className="font-semibold text-slate-500 text-sm tracking-wide uppercase">
                  {budget.name}
                </div>
                <div className="text-slate-900 font-bold text-2xl md:text-3xl tracking-tight">
                  {currency}
                  {remaining.toLocaleString()}{" "}
                  <span className="text-sm font-medium text-slate-400 block sm:inline mt-1 sm:mt-0">
                    left of {currency}
                    {budget.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="relative">
                  <div className="h-3 w-full bg-slate-100 block rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full ${budget.fill} rounded-full relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite_ease-in-out]" />
                    </motion.div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium inline-block bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                    You&apos;ve spent {percentage.toFixed(0)}% of your budget
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {budgets.length === 0 && !budgetsLoading && (
          <Link href="/dashboard/budget" className="col-span-full">
            <div className="bg-white/50 border-2 border-dashed border-slate-200 p-8 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-primary/50 transition-all group">
              <Plus
                className="text-slate-300 group-hover:text-primary transition-colors"
                size={32}
              />
              <p className="font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                Start by creating a budget
              </p>
            </div>
          </Link>
        )}
      </div>,
    );
  }, [
    setTitle,
    setSubtitle,
    setTopContent,
    userData,
    budgets,
    budgetsLoading,
    currency,
  ]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Recent Transactions
        </h2>
        <div className="bg-gray-100/80 backdrop-blur-md p-1.5 rounded-2xl flex items-center gap-1 border border-gray-200/50">
          {["All", "Income", "Expense"].map((filter) => (
            <button
              key={filter}
              className={`w-fit md:w-28 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${currentMenu === filter ? "bg-white text-primary shadow-[0_2px_10px_rgb(0,0,0,0.06)]" : "text-gray-500 hover:text-gray-800"}`}
              onClick={() => setCurrentMenu(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="hidden sm:block text-primary font-semibold cursor-pointer hover:opacity-80 transition-opacity">
          View All
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid grid-cols-1 gap-4"
      >
        {transLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((t: any) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              key={t.id}
            >
              <Card className="flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      t.type === "income"
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <Tag size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base sm:text-lg">
                      {t.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      {t.category} • {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "font-bold text-lg sm:text-xl tracking-tight",
                    t.type === "income" ? "text-primary" : "text-slate-800",
                  )}
                >
                  {t.type === "income" ? "+" : "-"}
                  {currency}
                  {Math.abs(t.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      <Link
        href="/dashboard/transaction"
        className="block w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-center text-slate-500 font-bold transition-colors"
      >
        View All Transactions
      </Link>
    </div>
  );
}
