"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState, useRef } from "react";

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
} from "lucide-react";

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

import { createClient } from "@/lib/supabase/client";

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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allWallets, setAllWallets] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // Transaction Form State
  const [title, setTitleInput] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Drink");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [walletId, setWalletId] = useState("");

  const fetchWallets = async () => {
    const { data } = await supabase
      .from("wallets")
      .select("*")
      .order("name", { ascending: true });

    if (data) {
      setAllWallets(data);
      const primary = data.find((w) => w.is_primary);
      if (primary) setWalletId(primary.id);
      else if (data.length > 0) setWalletId(data[0].id);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (data) setAllCategories(data);
  };

  useEffect(() => {
    fetchWallets();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);

    // Format dates to YYYY-MM-DD for clean database filtering
    const year = selectedPeriod.year;
    const month = String(selectedPeriod.monthIndex + 1).padStart(2, "0");

    const startDate = `${year}-${month}-01`;
    // Get last day of month
    const lastDay = new Date(year, selectedPeriod.monthIndex + 1, 0).getDate();
    const endDate = `${year}-${month}-${lastDay}`;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedPeriod]);

  const handleSaveTransaction = async () => {
    if (!title || !amount || !walletId) return;
    setIsSubmitting(true);

    const transactionData = {
      title,
      amount: parseFloat(amount),
      category,
      type,
      date,
      wallet_id: walletId,
    };

    let error;
    if (editingTransaction) {
      // 1. Reverse old wallet balance
      const oldWallet = allWallets.find(
        (w) => w.id === editingTransaction.wallet_id,
      );
      if (oldWallet) {
        const reverseAmount =
          editingTransaction.type === "income"
            ? -editingTransaction.amount
            : editingTransaction.amount;
        await supabase
          .from("wallets")
          .update({ balance: oldWallet.balance + reverseAmount })
          .eq("id", oldWallet.id);
      }

      // 2. Update transaction
      const { error: updateError } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", editingTransaction.id);
      error = updateError;
    } else {
      // Create transaction
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(transactionData);
      error = insertError;
    }

    // 3. Update new/current wallet balance
    if (!error) {
      const currentWallet = (
        await supabase.from("wallets").select("*").eq("id", walletId).single()
      ).data;
      if (currentWallet) {
        const deduction =
          type === "income" ? parseFloat(amount) : -parseFloat(amount);
        await supabase
          .from("wallets")
          .update({ balance: currentWallet.balance + deduction })
          .eq("id", walletId);
      }

      closeModal();
      fetchTransactions();
      fetchWallets(); // Refresh wallet balances
    }
    setIsSubmitting(false);
  };

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    // Get the transaction first to know which wallet/amount to reverse
    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (transaction) {
      const wallet = allWallets.find((w) => w.id === transaction.wallet_id);
      if (wallet) {
        const reverseAmount =
          transaction.type === "income"
            ? -transaction.amount
            : transaction.amount;
        await supabase
          .from("wallets")
          .update({ balance: wallet.balance + reverseAmount })
          .eq("id", wallet.id);
      }
    }

    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (!error) {
      fetchTransactions();
      fetchWallets();
    }
  };

  const openModal = (transaction: any = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setTitleInput(transaction.title);
      setAmount(Math.abs(transaction.amount).toString());
      setCategory(transaction.category);
      setType(transaction.type);
      setDate(transaction.date);
      setWalletId(transaction.wallet_id || "");
    } else {
      setEditingTransaction(null);
      setTitleInput("");
      setAmount("");
      setCategory("Food & Drink");
      setType("expense");
      setDate(new Date().toISOString().split("T")[0]);
      // Default to primary wallet
      const primary = allWallets.find((w) => w.is_primary);
      if (primary) setWalletId(primary.id);
      else if (allWallets.length > 0) setWalletId(allWallets[0].id);

      // Default category based on type
      if (allCategories.length > 0) {
        const firstMatch = allCategories.find((c) => c.type === "expense");
        if (firstMatch) setCategory(firstMatch.name);
      } else {
        setCategory("Other");
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setTitleInput("");
    setAmount("");
    setCategory("Food & Drink");
    setType("expense");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = FALLBACK_CATEGORIES.find((c) => c.name === categoryName);
    return cat ? cat.icon : Tag;
  };

  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const dateLabel = formatTransactionDate(transaction.date);
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(transaction);
      return groups;
    },
    {} as Record<string, any[]>,
  );

  const filteredCategories = allCategories.filter((c) => c.type === type);

  const calculateSummary = () => {
    return transactions.reduce(
      (acc, t) => {
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
      <div className="space-y-8 animate-in fade-in duration-500">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">
              No transactions for this month
            </p>
          </div>
        ) : (
          (Object.entries(groupedTransactions) as [string, any[]][]).map(
            ([dateLabel, transGroup]) => (
              <div key={dateLabel} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2">
                  {dateLabel}
                </h3>

                <div className="space-y-3">
                  {transGroup.map((t) => {
                    const Icon = getCategoryIcon(t.category);
                    return (
                      <div
                        key={t.id}
                        onClick={() => openModal(t)}
                        className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3.5 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                              t.type === "income"
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon size={22} strokeWidth={2.5} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-base sm:text-lg">
                              {t.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                              {t.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div
                            className={`font-bold text-lg sm:text-xl tracking-tight text-right ${
                              t.type === "income"
                                ? "text-primary"
                                : "text-slate-800"
                            }`}
                          >
                            {t.type === "income" ? "+" : ""}
                            {t.amount < 0 ? "-" : ""}
                            {currency}
                            {Math.abs(t.amount).toFixed(2)}
                          </div>
                          <button
                            onClick={(e) => handleDeleteTransaction(t.id, e)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          )
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh] overflow-hidden">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 bg-slate-100/80 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {editingTransaction ? "Edit Transaction" : "New Transaction"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {editingTransaction
                    ? "Update your record details."
                    : "Record your expense or income to stay on track."}
                </p>
              </div>

              {/* Transaction Type Toggle */}
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setType("expense")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                    type === "expense"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <ArrowUpCircle
                    size={18}
                    className={type === "expense" ? "text-rose-500" : ""}
                  />
                  Expense
                </button>
                <button
                  onClick={() => setType("income")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                    type === "income"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <ArrowDownCircle
                    size={18}
                    className={type === "income" ? "text-primary" : ""}
                  />
                  Income
                </button>
              </div>

              <div className="space-y-6">
                {/* Select Wallet */}
                {allWallets.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600 pl-1 flex items-center gap-2">
                      <WalletIcon size={14} className="text-slate-400" />
                      Select Wallet
                    </label>
                    <div className="relative">
                      <select
                        value={walletId}
                        onChange={(e) => setWalletId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
                      >
                        {allWallets.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({currency}
                            {w.balance.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Plus size={16} className="rotate-45" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                    <Tag size={14} className="text-slate-400" />
                    Transaction Tile
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="e.g. Weekly Groceries"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                      <DollarSign size={14} className="text-slate-400" />
                      Amount ({currency})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setCategory(cat.name)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          category === cat.name
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"
                        }`}
                      >
                        <Tag
                          size={20}
                          strokeWidth={category === cat.name ? 2.5 : 2}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-center truncate w-full">
                          {cat.name}
                        </span>
                      </div>
                    ))}
                    {filteredCategories.length === 0 && (
                      <div className="col-span-full py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-bold uppercase">
                          No categories found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveTransaction}
                  disabled={!title || !amount || isSubmitting}
                  className="w-full bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 disabled:shadow-none text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {editingTransaction ? (
                        <CheckCircle size={20} strokeWidth={2.5} />
                      ) : (
                        <PlusCircle size={20} strokeWidth={2.5} />
                      )}
                      {editingTransaction ? "Save Changes" : "Add Transaction"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
