"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Target,
  Car,
  Coffee,
  Home as HomeIcon,
  ShoppingBag,
  PlusCircle,
  X,
  Check,
  Edit2,
  Trash2,
  PieChart,
} from "lucide-react";

import { Card, Modal } from "@/components";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface BudgetData {
  id: string;
  name: string;
  amount: number;
  category_ids: string[]; // Use ID array
  categories: string[]; // Keep names for legacy/display
  created_at: string;
  user_id: string;
}

interface TransactionData {
  id: string;
  amount: number;
  category_id: string;
}

export default function Budget() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const supabase = createClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // SWR for Categories
  const { data: allCategories = [] } = useSWR("user-categories", async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("type", "expense")
      .order("name", { ascending: true });
    return data || [];
  });

  // SWR for Budgets (includes spend calculation)
  const {
    data: budgets = [],
    isLoading,
    mutate,
  } = useSWR("user-budgets", async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: budgetData } = await supabase
      .from("budgets")
      .select("*")
      .order("created_at", { ascending: true });

    if (!budgetData) return [];

    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    ).toISOString();

    const { data: transData } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", startOfMonth)
      .lte("date", endOfMonth)
      .eq("type", "expense");

    return (budgetData as BudgetData[]).map((b) => {
      const categoryIds = b.category_ids || [];
      const spent = ((transData as TransactionData[]) || [])
        .filter((t: any) => categoryIds.includes(t.category_id))
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      return {
        ...b,
        spentAmount: spent,
        totalAmount: b.amount,
      };
    });
  });

  useEffect(() => {
    setTitle("Budgets");
    setSubtitle("Track your spending limits");

    setTopContent(
      <div className="w-full mt-4 md:mt-2">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              Financial Goals
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Set monthly limits across multiple categories to stay on track.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary hover:bg-[#00d6a3] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <Plus size={20} className="stroke-3" />
            New Budget
          </button>
        </div>
      </div>,
    );
  }, [setTitle, setSubtitle, setTopContent]);

  const handleOpenModal = (budget: any = null) => {
    setEditingBudget(budget);
    if (budget) {
      setBudgetName(budget.name);
      setBudgetAmount(budget.totalAmount.toString());
      setSelectedCategoryIds([...(budget.category_ids || [])]);
    } else {
      setBudgetName("");
      setBudgetAmount("");
      setSelectedCategoryIds([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleSaveBudget = async () => {
    if (!budgetName || !budgetAmount || selectedCategoryIds.length === 0)
      return;
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const budgetData = {
      name: budgetName,
      amount: parseFloat(budgetAmount),
      category_ids: selectedCategoryIds,
      categories: allCategories
        .filter((c: any) => selectedCategoryIds.includes(c.id))
        .map((c: any) => c.name),
      user_id: user.id,
    };

    let error;
    if (editingBudget) {
      const { error: updateError } = await supabase
        .from("budgets")
        .update(budgetData)
        .eq("id", editingBudget.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("budgets")
        .insert(budgetData);
      error = insertError;
    }

    if (!error) {
      closeModal();
      mutate();
    }
    setIsSubmitting(false);
  };

  const handleDeleteBudget = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this budget?")) return;

    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (!error) {
      mutate();
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId],
    );
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const getBudgetStyle = (budgetCategories: string[]) => {
    const styles = [
      {
        icon: HomeIcon,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        fill: "bg-indigo-500",
      },
      {
        icon: Car,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        fill: "bg-blue-500",
      },
      {
        icon: Coffee,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        fill: "bg-orange-500",
      },
      {
        icon: PieChart,
        color: "text-primary",
        bg: "bg-primary/10",
        fill: "bg-primary",
      },
      {
        icon: ShoppingBag,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        fill: "bg-rose-500",
      },
    ];

    const firstCat = budgetCategories[0] || "";
    const index = firstCat.length % styles.length;
    return styles[index];
  };

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
              staggerChildren: 0.1,
            },
          },
        }}
        className="space-y-6 pb-20"
      >
        {/* Budgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {budgets.map((budget) => {
            const percentage = Math.min(
              (budget.spentAmount / budget.totalAmount) * 100,
              100,
            );
            const isWarning = percentage >= 90;
            const remaining = budget.totalAmount - budget.spentAmount;
            const style = getBudgetStyle(budget.categories);
            const Icon = style.icon;

            return (
              <Card
                key={budget.id}
                className={cn(
                  "flex flex-col gap-6 group",
                  isWarning ? "border-rose-200" : "border-slate-100",
                )}
              >
                {/* Header */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-[1.25rem] flex items-center justify-center ${style.bg} ${style.color}`}
                    >
                      <Icon size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xl leading-tight">
                        {budget.name}
                      </h4>
                      <p className="text-sm font-semibold text-slate-400 mt-1">
                        {currency}
                        {budget.spentAmount.toLocaleString()} of {currency}
                        {budget.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleOpenModal(budget)}
                      className="p-2 sm:p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                    >
                      <Edit2 size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteBudget(budget.id, e)}
                      className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3 z-10">
                  <div className="flex justify-between items-end">
                    <span
                      className={`text-sm font-bold ${isWarning ? "text-rose-500" : "text-slate-500"}`}
                    >
                      {remaining >= 0
                        ? `${currency}${remaining.toLocaleString()} left`
                        : `-${currency}${Math.abs(remaining).toLocaleString()} over`}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${isWarning ? "bg-rose-500" : style.fill}`}
                    />
                  </div>
                </div>

                {/* Categories Chips */}
                <div className="pt-5 border-t border-slate-100/80 z-10">
                  <div className="flex flex-wrap gap-2">
                    {budget.categories.map((cat: string) => (
                      <span
                        key={cat}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold rounded-lg tracking-wide uppercase"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Add Budget Card */}
          <Card
            onClick={() => handleOpenModal()}
            className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white flex flex-col items-center justify-center gap-4 text-slate-400 group min-h-70"
          >
            <div className="p-4 rounded-[1.25rem] flex items-center justify-center bg-transparent group-hover:bg-primary/10 transition-colors">
              <PlusCircle
                size={36}
                className="group-hover:scale-110 transition-transform text-slate-300 group-hover:text-primary"
                strokeWidth={2}
              />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-xl text-slate-600 group-hover:text-primary transition-colors">
                Create New Budget
              </h4>
              <p className="text-sm font-medium mt-1">
                Group multiple categories under one limit
              </p>
            </div>
          </Card>
        </div>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBudget ? "Edit Budget" : "New Budget"}
        description={
          editingBudget
            ? "Update your budget details and categories."
            : "Group your categories under a single spending limit."
        }
      >
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Budget Name
              </label>
              <input
                type="text"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                placeholder="e.g. Vacation Fund"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Total Amount ({currency})
              </label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Included Categories
                </label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                  {selectedCategoryIds.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {allCategories.map((cat: any) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-5 h-5 rounded-[0.4rem] transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "border-2 border-slate-300 bg-transparent"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-bold truncate">
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveBudget}
              disabled={
                isSubmitting ||
                !budgetName ||
                !budgetAmount ||
                selectedCategoryIds.length === 0
              }
              className="w-full bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 disabled:shadow-none text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Target size={20} strokeWidth={2.5} />
                  {editingBudget ? "Save Changes" : "Create Budget"}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
