"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState, useRef } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function MonthSelector({ selectedMonth, setSelectedMonth }: { selectedMonth: string; setSelectedMonth: (m: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector<HTMLButtonElement>('[data-active="true"]');
      if (activeEl) {
        // Scroll the active element to the center of the scroll container
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedMonth]);

  return (
    <div className="w-full relative overflow-hidden mt-4 md:mt-6">
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {MONTHS.map((month) => {
          const isActive = selectedMonth === month;
          return (
            <button
              key={month}
              data-active={isActive}
              onClick={() => setSelectedMonth(month)}
              className={`shrink-0 snap-center px-6 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-[0_8px_20px_rgba(0,184,142,0.25)] scale-105"
                  : "bg-white/60 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200/50 shadow-sm"
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { Activity, ArrowDownLeft, ArrowUpRight, Coffee, ShoppingBag, ShoppingCart } from "lucide-react";

// Helper to format dates correctly into "Today", "Yesterday", or "MMM DD, YYYY"
const formatTransactionDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Mock data (make sure it contains dates from today, yesterday, and older)
const generateMockTransactions = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 5);

  return [
    { id: 1, title: "Starbucks Coffee", category: "Food & Drink", amount: -4.50, date: today.toISOString(), icon: Coffee, type: "expense" },
    { id: 2, title: "Freelance Payment", category: "Income", amount: 1250.00, date: today.toISOString(), icon: ArrowDownLeft, type: "income" },
    { id: 3, title: "Grocery Store", category: "Groceries", amount: -85.20, date: yesterday.toISOString(), icon: ShoppingCart, type: "expense" },
    { id: 4, title: "Netflix Subscription", category: "Entertainment", amount: -15.99, date: yesterday.toISOString(), icon: Activity, type: "expense" },
    { id: 5, title: "Amazon Purchase", category: "Shopping", amount: -130.00, date: lastWeek.toISOString(), icon: ShoppingBag, type: "expense" },
  ];
};

export default function Transaction() {
  const { setTitle, setSubtitle, setTopContent } = useDashboard();
  
  // Default to current month index
  const [selectedMonth, setSelectedMonth] = useState(() => MONTHS[new Date().getMonth()]);
  const transactions = generateMockTransactions();

  // Group transactions by date string
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const dateLabel = formatTransactionDate(transaction.date);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  useEffect(() => {
    setTitle("Transactions");
    setSubtitle("Manage your transactions");
    setTopContent(
      <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
    );
  }, [setTitle, setSubtitle, setTopContent, selectedMonth]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Object.entries(groupedTransactions).map(([dateLabel, transGroup]) => (
        <div key={dateLabel} className="space-y-4">
          {/* Date Group Header */}
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2">
            {dateLabel}
          </h3>
          
          {/* Transaction Cards */}
          <div className="space-y-3">
            {transGroup.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    t.type === "income" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                  }`}>
                    <t.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base sm:text-lg">{t.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{t.category}</p>
                  </div>
                </div>
                <div className={`font-bold text-lg sm:text-xl tracking-tight ${
                  t.type === "income" ? "text-primary" : "text-slate-800"
                }`}>
                  {t.type === "income" ? "+" : ""}{t.amount < 0 ? "-" : ""}${Math.abs(t.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
