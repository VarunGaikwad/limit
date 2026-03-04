"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  ShoppingBag,
  ShoppingCart,
  Plus,
  X,
  CreditCard,
  PlusCircle,
  Tag,
  Calendar,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  WalletIcon,
  Star,
} from "lucide-react";
import { Card, Modal } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper to generate months from 2025 March to current year December
const generateMonthRange = () => {
  const startYear = 2025;
  const startMonth = 2; // March (0-indexed)
  const endYear = new Date().getFullYear();
  const endMonth = 11; // December

  const months = [];
  for (let year = startYear; year <= endYear; year++) {
    const sM = year === startYear ? startMonth : 0;
    const eM = year === endYear ? endMonth : 11;
    for (let month = sM; month <= eM; month++) {
      months.push({
        label: `${MONTH_NAMES[month]} ${year}`,
        monthIndex: month,
        year: year,
      });
    }
  }
  return months;
};

const MONTH_RANGE = generateMonthRange();

function MonthSelector({
  selected,
  setSelected,
}: {
  selected: { monthIndex: number; year: number };
  setSelected: (val: { monthIndex: number; year: number }) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<"left" | "right" | null>(null);

  const now = new Date();
  const today = { monthIndex: now.getMonth(), year: now.getFullYear() };

  const handleJumpToToday = () => {
    setSelected(today);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const checkVisibility = () => {
      const todayEl = container.querySelector<HTMLButtonElement>(
        '[data-today="true"]',
      );
      if (!todayEl) return;

      const containerRect = container.getBoundingClientRect();
      const todayRect = todayEl.getBoundingClientRect();

      if (todayRect.right < containerRect.left) {
        setIndicator("left");
      } else if (todayRect.left > containerRect.right) {
        setIndicator("right");
      } else {
        setIndicator(null);
      }
    };

    container.addEventListener("scroll", checkVisibility);
    checkVisibility(); // Initial check
    return () => container.removeEventListener("scroll", checkVisibility);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector<HTMLButtonElement>(
        '[data-active="true"]',
      );
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [selected]);

  return (
    <div className="w-full relative mt-4 md:mt-6 group/selector">
      {/* Left Indicator */}
      {indicator === "left" && (
        <button
          onClick={handleJumpToToday}
          className="absolute left-0 top-5 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-slate-200 text-primary animate-bounce-x flex items-center gap-1 pl-3 pr-4"
        >
          <ChevronLeft size={20} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-tighter">
            Today
          </span>
        </button>
      )}

      {/* Right Indicator */}
      {indicator === "right" && (
        <button
          onClick={handleJumpToToday}
          className="absolute right-0 top-5 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-slate-200 text-primary animate-bounce-x-reverse flex items-center gap-1 pr-3 pl-4"
        >
          <span className="text-[10px] font-black uppercase tracking-tighter">
            Today
          </span>
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {MONTH_RANGE.map((item) => {
          const isActive =
            selected.monthIndex === item.monthIndex &&
            selected.year === item.year;
          const isToday =
            item.monthIndex === today.monthIndex && item.year === today.year;
          return (
            <button
              key={item.label}
              data-active={isActive}
              data-today={isToday}
              onClick={() =>
                setSelected({ monthIndex: item.monthIndex, year: item.year })
              }
              className={`shrink-0 snap-center px-6 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-300 relative ${
                isActive
                  ? "bg-primary text-white shadow-[0_8px_20px_rgba(0,184,142,0.25)] scale-105"
                  : "bg-white/60 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200/50 shadow-sm"
              }`}
            >
              {item.label}
              {isToday && !isActive && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const FALLBACK_CATEGORIES = [
  { name: "Food & Drink", icon: Coffee },
  { name: "Groceries", icon: ShoppingCart },
  { name: "Shopping", icon: ShoppingBag },
  { name: "Entertainment", icon: Activity },
  { name: "Income", icon: ArrowDownLeft },
  { name: "Other", icon: CreditCard },
];

const formatTransactionDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function Transaction() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const supabase = createClient();

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return { monthIndex: now.getMonth(), year: now.getFullYear() };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitleInput] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [walletId, setWalletId] = useState("");

  // SWR for Wallets
  const { data: allWallets = [], mutate: mutateWallets } = useSWR(
    "user-wallets",
    async () => {
      const { data } = await supabase
        .from("wallets")
        .select("*")
        .order("name", { ascending: true });
      return data || [];
    },
  );

  // SWR for Categories
  const { data: allCategories = [] } = useSWR("user-categories", async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    return data || [];
  });

  // SWR for Transactions (Keyed by selected period)
  const {
    data: transactions = [],
    isLoading,
    mutate: mutateTransactions,
  } = useSWR(
    ["transactions", selectedPeriod.year, selectedPeriod.monthIndex],
    async () => {
      const year = selectedPeriod.year;
      const month = String(selectedPeriod.monthIndex + 1).padStart(2, "0");
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(
        year,
        selectedPeriod.monthIndex + 1,
        0,
      ).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      const { data } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });
      return data || [];
    },
  );

  // Set default wallet when wallets load or modal opens
  useEffect(() => {
    if (!walletId && allWallets.length > 0) {
      const primary = allWallets.find((w: any) => w.is_primary);
      if (primary) setWalletId(primary.id);
      else setWalletId(allWallets[0].id);
    }
  }, [allWallets, walletId]);

  const handleSaveTransaction = async () => {
    if (!title || !amount || !walletId || !categoryId) return;
    setIsSubmitting(true);

    const transactionData = {
      title,
      amount: parseFloat(amount),
      category_id: categoryId, // Using ID now
      category: allCategories.find((c: any) => c.id === categoryId)?.name || "", // Keep name as fallback for now
      type,
      date,
      wallet_id: walletId,
    };

    let error;
    if (editingTransaction) {
      const { error: updateError } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", editingTransaction.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(transactionData);
      error = insertError;
    }

    if (!error) {
      closeModal();
      mutateTransactions();
      mutateWallets(); // Refresh balances
    }
    setIsSubmitting(false);
  };

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (!error) {
      mutateTransactions();
      mutateWallets();
    }
  };

  const openModal = (transaction: any = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setTitleInput(transaction.title);
      setAmount(Math.abs(transaction.amount).toString());
      setCategoryId(transaction.category_id || "");
      setType(transaction.type);
      setDate(transaction.date);
      setWalletId(transaction.wallet_id || "");
    } else {
      setEditingTransaction(null);
      setTitleInput("");
      setAmount("");
      setType("expense");
      setDate(new Date().toISOString().split("T")[0]);
      // Default to primary wallet
      const primary = allWallets.find((w: any) => w.is_primary);
      if (primary) setWalletId(primary.id);
      else if (allWallets.length > 0) setWalletId(allWallets[0].id);

      // Default category based on type
      if (allCategories.length > 0) {
        const firstMatch = allCategories.find((c: any) => c.type === "expense");
        if (firstMatch) setCategoryId(firstMatch.id);
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setTitleInput("");
    setAmount("");
    setCategoryId("");
    setType("expense");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = FALLBACK_CATEGORIES.find((c: any) => c.name === categoryName);
    return cat ? cat.icon : Tag;
  };

  const groupedTransactions = transactions.reduce(
    (groups: any, transaction: any) => {
      const dateLabel = formatTransactionDate(transaction.date);
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }

      // Enrich with wallet name for display
      const enrichedTransaction = {
        ...transaction,
        walletName:
          allWallets.find((w: any) => w.id === transaction.wallet_id)?.name ||
          "Unknown Wallet",
      };

      groups[dateLabel].push(enrichedTransaction);
      return groups;
    },
    {} as Record<string, any[]>,
  );

  const filteredCategories = allCategories.filter((c: any) => c.type === type);

  const calculateSummary = () => {
    return transactions.reduce(
      (acc: any, t: any) => {
        const amount = parseFloat(t.amount);
        if (t.type === "income") {
          acc.income += amount;
        } else {
          acc.expense += Math.abs(amount);
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  };

  const { income, expense } = calculateSummary();
  const balance = income - expense;

  useEffect(() => {
    setTitle("Transactions");
    setSubtitle(
      `Manage your transactions for ${MONTH_NAMES[selectedPeriod.monthIndex]} ${selectedPeriod.year}`,
    );
    setTopContent(
      <div className="w-full mt-4 md:mt-2 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              Recent Activity
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Currently viewing {MONTH_NAMES[selectedPeriod.monthIndex]}{" "}
              {selectedPeriod.year}
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primary hover:bg-[#00d6a3] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <Plus size={20} className="stroke-[3]" />
            New Transaction
          </button>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
              <ArrowDownCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Income
              </p>
              <p className="text-xl font-black text-slate-800">
                {currency}
                {income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl group-hover:scale-110 transition-transform">
              <ArrowUpCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Expense
              </p>
              <p className="text-xl font-black text-slate-800">
                {currency}
                {expense.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Net Balance
              </p>
              <p
                className={`text-xl font-black ${balance >= 0 ? "text-slate-800" : "text-rose-600"}`}
              >
                {balance < 0 ? "-" : ""}
                {currency}
                {Math.abs(balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <MonthSelector
          selected={selectedPeriod}
          setSelected={setSelectedPeriod}
        />
      </div>,
    );
  }, [
    setTitle,
    setSubtitle,
    setTopContent,
    selectedPeriod,
    income,
    expense,
    balance,
    currency,
  ]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
        className="flex flex-col gap-6"
      >
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 w-full bg-slate-100 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : !transactions.length ? (
          <div className="py-20 text-center bg-white rounded-4xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No transactions found</p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(
            ([dateLabel, dateTransactions]: [string, any]) => (
              <motion.div
                key={dateLabel}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="space-y-4"
              >
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] pl-2 flex items-center gap-3">
                  {dateLabel}
                  <div className="h-px flex-1 bg-slate-100" />
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {dateTransactions.map((t: any) => {
                    const Icon = getCategoryIcon(t.category);
                    return (
                      <Card
                        key={t.id}
                        onClick={() => openModal(t)}
                        className="flex items-center justify-between p-4 sm:p-5 group cursor-pointer hover:border-primary/30"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                              t.type === "income"
                                ? "bg-emerald-50 text-emerald-500"
                                : "bg-rose-50 text-rose-500",
                            )}
                          >
                            <Icon size={24} strokeWidth={2.5} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">
                              {t.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                              {t.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "text-right",
                              t.type === "income"
                                ? "text-primary font-bold"
                                : "text-slate-800 font-bold",
                            )}
                          >
                            <div className="text-lg sm:text-xl tracking-tight leading-none">
                              {t.type === "income" ? "+" : "-"}
                              {currency}
                              {Math.abs(t.amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
                              {t.walletName}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            ),
          )
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTransaction ? "Edit Transaction" : "New Transaction"}
        description={
          editingTransaction
            ? "Update your transaction details."
            : "Record a new income or expense transaction."
        }
      >
        <div className="space-y-6">
          {/* Transaction Type Toggle */}
          <div className="flex p-1.5 bg-slate-100 rounded-[1.25rem] gap-1.5">
            <button
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300",
                type === "expense"
                  ? "bg-white text-slate-800 shadow-md scale-[1.02]"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <ArrowDownCircle
                size={18}
                className={type === "expense" ? "text-rose-500" : ""}
              />
              Expense
            </button>
            <button
              onClick={() => setType("income")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300",
                type === "income"
                  ? "bg-white text-slate-800 shadow-md scale-[1.02]"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <ArrowUpCircle
                size={18}
                className={type === "income" ? "text-primary" : ""}
              />
              Income
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Weekly Groceries"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {currency}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                  Date
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center justify-between group">
                <span>Wallet</span>
                <span className="text-[10px] text-slate-400 font-medium lowercase italic opacity-0 group-hover:opacity-100 transition-opacity">
                  select source account
                </span>
              </label>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden">
                {allWallets.map((w: any) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWalletId(w.id)}
                    className={cn(
                      "shrink-0 p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 min-w-[140px]",
                      walletId === w.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-200",
                    )}
                  >
                    <div className="flex justify-between items-start w-full">
                      <WalletIcon
                        size={18}
                        className={
                          walletId === w.id ? "text-primary" : "text-slate-400"
                        }
                      />
                      {w.is_primary && (
                        <Star
                          size={14}
                          className="text-amber-400 fill-amber-400"
                        />
                      )}
                    </div>
                    <div className="text-left mt-1">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {w.name}
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {currency}
                        {w.balance.toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Category
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {allCategories
                  .filter((cat: any) => cat.type === type)
                  .map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                        categoryId === cat.id
                          ? "border-primary bg-primary/5 text-primary scale-[1.05]"
                          : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200",
                      )}
                    >
                      <Tag
                        size={20}
                        strokeWidth={categoryId === cat.id ? 2.5 : 2}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-tight text-center truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            {editingTransaction && (
              <button
                onClick={(e) =>
                  handleDeleteTransaction(editingTransaction.id, e)
                }
                className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors"
                title="Delete"
              >
                <Trash2 size={22} strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={handleSaveTransaction}
              disabled={isSubmitting || !title || !amount || !categoryId}
              className="flex-1 bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle size={20} strokeWidth={2.5} />
                  {editingTransaction ? "Save Changes" : "Save Transaction"}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
