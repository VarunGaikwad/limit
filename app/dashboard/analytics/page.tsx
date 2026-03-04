"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [spendingData, setSpendingData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [walletData, setWalletData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalIncome: 0,
    avgDaily: 0,
    savingsRate: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    setTitle("Financial Analytics");
    setSubtitle("Deep dive into your spending habits");
    setTopContent(null);
  }, [setTitle, setSubtitle, setTopContent]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Transactions for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1);

      const { data: transactions } = await supabase
        .from("transactions")
        .select(
          `
          *,
          categories:category_id (name)
        `,
        )
        .gte("date", sixMonthsAgo.toISOString())
        .order("date", { ascending: true });

      if (transactions) {
        processSpendingData(transactions);
        processCategoryData(transactions);
        calculateStats(transactions);
      }

      // 2. Fetch Wallet distribution
      const { data: wallets } = await supabase
        .from("wallets")
        .select("*")
        .order("balance", { ascending: false });

      if (wallets) {
        setWalletData(
          wallets.map((w: any) => ({
            name: w.name,
            value: w.balance,
          })),
        );
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  const processSpendingData = (transactions: any[]) => {
    const monthly: any = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthly[key] = { name: key, expense: 0, income: 0 };
    }

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthly[key]) {
        if (t.type === "expense") monthly[key].expense += Math.abs(t.amount);
        else monthly[key].income += Math.abs(t.amount);
      }
    });

    setSpendingData(Object.values(monthly));
  };

  const processCategoryData = (transactions: any[]) => {
    const categories: any = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const catName = t.categories?.name || "Other";
        categories[catName] = (categories[catName] || 0) + Math.abs(t.amount);
      });

    const formatted = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);

    setCategoryData(formatted);
  };

  const calculateStats = (transactions: any[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTrans = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSpent = monthTrans
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncome = monthTrans
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Average daily spending this month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const elapsedDays = Math.min(now.getDate(), daysInMonth);
    const avgDaily = totalSpent / elapsedDays;

    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    setStats({
      totalSpent,
      totalIncome,
      avgDaily,
      savingsRate: Math.max(0, savingsRate),
    });
  };

  const COLORS = [
    "#00B88E",
    "#4F46E5",
    "#F97316",
    "#06B6D4",
    "#EC4899",
    "#8B5CF6",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
              <TrendingDown size={24} />
            </div>
            <div className="flex items-center text-rose-500 text-xs font-bold">
              <ArrowDownRight size={14} className="mr-0.5" />
              This Month
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Total Spent
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {currency}
              {stats.totalSpent.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center text-primary text-xs font-bold">
              <ArrowUpRight size={14} className="mr-0.5" />
              Active
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Total Income
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {currency}
              {stats.totalIncome.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
              <DollarSign size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Avg Daily Spend
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {currency}
              {stats.avgDaily.toFixed(0)}
            </p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Savings Rate
            </p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-slate-800">
                {stats.savingsRate.toFixed(1)}%
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full mb-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.savingsRate}%` }}
                  className="h-full bg-amber-400"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending History Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Spending Overview
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Income vs Expenses (Last 6 Months)
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="size-3 bg-primary rounded-full" />
                <span className="text-xs font-bold text-slate-500">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 bg-slate-200 rounded-full" />
                <span className="text-xs font-bold text-slate-500">
                  Expense
                </span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B88E" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#00B88E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "1.25rem",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    padding: "1rem",
                  }}
                  cursor={{
                    stroke: "#00B88E",
                    strokeWidth: 2,
                    strokeDasharray: "5 5",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#00B88E"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Category Breakdown
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Top spending categories
              </p>
            </div>
            <PieChartIcon className="text-slate-300" size={24} />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-[250px] w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    cornerRadius={8}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 w-full">
              {categoryData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-bold text-slate-600">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-800">
                    {currency}
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Wallet Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Asset Allocation
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Balance across your wallets
              </p>
            </div>
            <BarChart3 className="text-slate-300" size={24} />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={walletData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#4F46E5"
                  radius={[0, 8, 8, 0]}
                  barSize={20}
                >
                  {walletData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 1) % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Savings Goals / Info Card */}
        <Card className="p-8 bg-linear-to-br from-primary to-[#00d6a3] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                <PieChartIcon size={24} />
              </div>
              <h3 className="text-2xl font-black tracking-tight leading-tight">
                Your saving rate is <br />
                healthy this month!
              </h3>
              <p className="text-white/80 font-medium max-w-[240px]">
                You’ve saved {stats.savingsRate.toFixed(1)}% of your income.
                Ready to set a new goal?
              </p>
            </div>
            <button className="mt-8 bg-white text-primary font-bold px-6 py-4 rounded-2xl shadow-xl hover:scale-105 transition-transform w-fit">
              Explore Savings Goals
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PlusCircleIcon({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
