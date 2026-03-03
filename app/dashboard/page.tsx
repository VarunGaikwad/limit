"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
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

export default function Dashboard() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const [currentMenu, setCurrentMenu] = useState("All");
  const [userName, setUserName] = useState("User");
  const supabase = createClient();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredTransactions = transactions.filter((t) => {
    if (currentMenu === "All") return true;
    return t.type.toLowerCase() === currentMenu.toLowerCase();
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }

      // 1. Fetch Transactions
      const { data: transData } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(20);

      if (transData) setTransactions(transData);

      // 2. Fetch Budgets
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (budgetData) {
        // Enrich budgets with spent amount for current month
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

        const enriched = budgetData.map((b: any, idx: number) => {
          const categories = b.categories || [];
          const spent = (monthTrans || [])
            .filter((t: any) => categories.includes(t.category))
            .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

          const colors = [
            "bg-indigo-500",
            "bg-blue-500",
            "bg-orange-500",
            "bg-emerald-500",
          ];
          return {
            ...b,
            spentAmount: spent,
            fill: colors[idx % colors.length],
          };
        });
        setBudgets(enriched);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  useEffect(() => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? "Good Morning"
        : hour < 18
          ? "Good Afternoon"
          : "Good Evening";

    setTitle(`Hi, ${userName}`);
    setSubtitle(greeting);
    setTopContent(
      <div
        className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-5 md:gap-6 pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden pt-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {budgets.map((budget) => {
          const remaining = budget.amount - budget.spentAmount;
          const percentage = Math.min(
            (budget.spentAmount / budget.amount) * 100,
            100,
          );
          return (
            <div
              key={budget.id}
              className="w-[85%] md:w-full shrink-0 snap-center md:snap-none bg-white rounded-3xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-transform hover:-translate-y-1 duration-300 group"
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
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full ${budget.fill} rounded-full relative overflow-hidden transition-all duration-1000 ease-out`}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite_ease-in-out]" />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium inline-block bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                    You've spent {percentage.toFixed(0)}% of your budget
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && !loading && (
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
    userName,
    budgets,
    loading,
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

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    t.type === "income"
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-100 text-slate-500"
                  }`}
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
                className={`font-bold text-lg sm:text-xl tracking-tight ${
                  t.type === "income" ? "text-primary" : "text-slate-800"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {currency}
                {Math.abs(t.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        href="/dashboard/transaction"
        className="block w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-center text-slate-500 font-bold transition-colors"
      >
        View All Transactions
      </Link>
    </div>
  );
}
