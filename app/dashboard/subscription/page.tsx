"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
import {
  Plus,
  X,
  PlusCircle,
  Tag,
  Calendar,
  DollarSign,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Tv,
  Music,
  Zap,
  Gamepad,
  Heart,
  BookOpen,
  Edit2,
  Trash2,
  WalletIcon,
} from "lucide-react";

const FREQUENCIES = ["per month", "per 3 months", "per 6 months", "per year"];

import { createClient } from "@/lib/supabase/client";
import { Card, Modal } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Subscription() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const supabase = createClient();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);

  // Form State
  const [subName, setSubName] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [subFrequency, setSubFrequency] = useState("per month");
  const [subDate, setSubDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [subCategory, setSubCategory] = useState("");
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [allCategories, setAllCategories] = useState<any[]>([]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch Subscriptions
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .order("date", { ascending: true });

    if (!subError && subData) {
      setSubscriptions(subData);
    }

    // 2. Fetch Categories
    const { data: catData } = await supabase
      .from("categories")
      .select("*")
      .eq("type", "expense")
      .order("name", { ascending: true });

    if (catData) {
      setAllCategories(catData);
      if (!subCategory && catData.length > 0) setSubCategory(catData[0].name);
    }

    setLoading(false);
  };

  const fetchWallets = async () => {
    const { data } = await supabase.from("wallets").select("*").order("name");
    if (data) {
      setWallets(data);
      const primary = data.find((w: any) => w.is_primary);
      if (primary) setSelectedWalletId(primary.id);
      else if (data.length > 0) setSelectedWalletId(data[0].id);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchWallets();
  }, []);

  useEffect(() => {
    setTitle("Subscriptions");
    setSubtitle("Manage your recurring bills");

    setTopContent(
      <div className="w-full mt-4 md:mt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              Recurring Expenses
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              You have {subscriptions.length} active subscriptions.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary hover:bg-[#00d6a3] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <Plus size={20} className="stroke-[3]" />
            Add Subscription
          </button>
        </motion.div>
      </div>,
    );
  }, [setTitle, setSubtitle, setTopContent, subscriptions.length]);

  const handleOpenModal = (sub: any = null) => {
    setEditingSub(sub);
    if (sub) {
      setSubName(sub.name);
      setSubAmount(sub.amount.toString());
      setSubFrequency(sub.frequency);
      setSubDate(sub.date);
      setSubCategory(sub.category);
      setSelectedWalletId(sub.wallet_id || "");
    } else {
      setSubName("");
      setSubAmount("");
      setSubFrequency("per month");
      setSubDate(new Date().toISOString().split("T")[0]);
      setSubCategory(allCategories.length > 0 ? allCategories[0].name : "");
      const primary = wallets.find((w: any) => w.is_primary);
      if (primary) setSelectedWalletId(primary.id);
      else if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
    }
    setIsModalOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!subName || !subAmount) return;
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const subData = {
      name: subName,
      amount: parseFloat(subAmount),
      date: subDate,
      frequency: subFrequency,
      category: subCategory,
      user_id: user.id,
      wallet_id: selectedWalletId || null,
      icon_name: "Tag",
    };

    let error;
    if (editingSub) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update(subData)
        .eq("id", editingSub.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert(subData);
      error = insertError;

      // Also create a transaction record if it's a new subscription
      if (!error) {
        const transData = {
          title: `Subscription: ${subName}`,
          amount: parseFloat(subAmount), // Use positive amount, type defines direction
          category: subCategory,
          type: "expense",
          date: subDate,
          wallet_id: selectedWalletId || null,
          user_id: user.id,
        };
        await supabase.from("transactions").insert(transData);
      }
    }

    if (!error) {
      setIsModalOpen(false);
      fetchSubscriptions();
      fetchWallets(); // Refresh balances
    }
    setIsSubmitting(false);
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);
    if (!error) fetchSubscriptions();
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    if (sub.frequency === "per month") return acc + sub.amount;
    if (sub.frequency === "per 3 months") return acc + sub.amount / 3;
    if (sub.frequency === "per 6 months") return acc + sub.amount / 6;
    if (sub.frequency === "per year") return acc + sub.amount / 12;
    return acc;
  }, 0);

  const getSubStyle = (category: string) => {
    const defaultStyle = {
      icon: CreditCard,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    };
    const styles: Record<string, any> = {
      Entertainment: {
        icon: Tv,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
      },
      Utilities: {
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      Music: {
        icon: Music,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      Gaming: {
        icon: Gamepad,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
      },
      Health: {
        icon: Heart,
        color: "text-pink-500",
        bg: "bg-pink-500/10",
      },
      Education: {
        icon: BookOpen,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
    };
    return styles[category] || defaultStyle;
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 flex items-center gap-4 transition-all hover:scale-105">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <RefreshCw size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Avg. Monthly
              </p>
              <p className="text-2xl font-black text-slate-800">
                {currency}
                {totalMonthly.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 transition-all hover:scale-105">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Count
              </p>
              <p className="text-2xl font-black text-slate-800">
                {subscriptions.length}
              </p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 transition-all hover:scale-105">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Annually
              </p>
              <p className="text-2xl font-black text-slate-800">
                {currency}
                {(totalMonthly * 12).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </Card>
        </div>

        {/* Subscriptions List */}
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
          {subscriptions.map((sub) => {
            const style = getSubStyle(sub.category);
            const Icon = style.icon;
            return (
              <motion.div
                key={sub.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 10 },
                  visible: { opacity: 1, scale: 1, y: 0 },
                }}
              >
                <Card className="group p-5 overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div
                        className={cn(
                          "size-12 sm:size-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0",
                          style.bg,
                          style.color,
                        )}
                      >
                        <Icon className="size-6 sm:size-7" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-base sm:text-xl truncate">
                          {sub.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          {sub.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-lg sm:text-2xl text-slate-800">
                        {currency}
                        {sub.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-[10px] sm:text-xs font-bold text-primary flex items-center justify-end gap-1 mt-0.5">
                        <RefreshCw
                          size={10}
                          className="sm:size-3"
                          strokeWidth={3}
                        />
                        {sub.frequency}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} strokeWidth={2.5} />
                      <span className="text-[11px] sm:text-sm font-bold">
                        Started:{" "}
                        <span className="text-slate-600">
                          {new Date(sub.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(sub)}
                        className="flex items-center gap-1 text-[11px] sm:text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} strokeWidth={3} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(sub.id)}
                        className="flex items-center gap-1 text-[11px] sm:text-sm font-bold text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {/* Add Sub Card */}
          <button
            onClick={() => handleOpenModal()}
            className="w-full border-2 border-dashed border-slate-200 bg-white/50 hover:bg-white p-8 rounded-[2rem] flex items-center justify-center gap-4 text-slate-400 hover:text-primary hover:border-primary/50 transition-all group shadow-sm hover:shadow-md"
          >
            <PlusCircle
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-bold text-lg">Add New Subscription</span>
          </button>
        </motion.div>
      </div>

      {/* Add Subscription Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSub ? "Edit Subscription" : "New Subscription"}
        description="Add your recurring bills to keep track of spending."
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-slate-400" />
                Subscription Name
              </label>
              <input
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="e.g. Netflix, Amazon Prime"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign size={14} className="text-slate-400" />
                  Price ({currency})
                </label>
                <input
                  type="number"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={subDate}
                  onChange={(e) => setSubDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                <RefreshCw size={14} className="text-slate-400" />
                Frequency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setSubFrequency(freq)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-bold text-xs transition-all border-2",
                      subFrequency === freq
                        ? "bg-primary/5 border-primary text-primary"
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200",
                    )}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                <WalletIcon size={14} className="text-slate-400" />
                Paid From
              </label>
              <div className="relative">
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Wallet</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({currency}
                      {w.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {allCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSubCategory(cat.name)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-2xl border-2 cursor-pointer transition-all",
                      subCategory === cat.name
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white",
                    )}
                  >
                    <Tag
                      size={18}
                      strokeWidth={subCategory === cat.name ? 2.5 : 2}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-center truncate w-full">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveSubscription}
              disabled={
                isSubmitting || !subName || !subAmount || !selectedWalletId
              }
              className="w-full bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 disabled:shadow-none text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <PlusCircle size={20} strokeWidth={2.5} />
                  {editingSub ? "Save Changes" : "Add Subscription"}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
