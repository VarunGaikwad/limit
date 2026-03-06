"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  Plus,
  Landmark,
  CircleDollarSign,
  X,
  WalletIcon,
  Trash2,
  Star,
  CheckCircle,
  Edit2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Card, Modal } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Wallet() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const { mutate: globalMutate } = useSWRConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Unified fetcher for Wallets using SWR
  const {
    data: wallets = [],
    error: fetchError,
    isLoading,
    mutate,
  } = useSWR("user-wallets", async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  });

  const memoizedTopContent = useMemo(
    () => (
      <div className="w-full relative overflow-hidden mt-4 md:mt-2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {wallets.map((wallet: any) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={wallet.id}
              className={cn(
                "shrink-0 snap-center w-[85%] sm:w-85 h-50 rounded-4xl p-6 xl:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] bg-linear-to-br transition-all duration-300 group cursor-default",
                wallet.gradient || "from-slate-900 to-slate-800",
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-white/20 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-y-8 -translate-x-8" />

              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-white/70 text-sm font-medium">
                    Total Balance
                  </p>
                  <p className="font-bold text-3xl sm:text-4xl tracking-tight">
                    {currency}
                    {wallet.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl shadow-inner border border-white/10">
                  <span className="font-bold text-xs uppercase tracking-wider opacity-90">
                    {wallet.type}
                  </span>
                </div>
              </div>

              <div className="relative z-10">
                <p className="font-semibold text-lg uppercase tracking-wider opacity-90">
                  {wallet.name}
                </p>
              </div>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 snap-center w-[85%] sm:w-85 h-50 rounded-4xl border-2 border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-white transition-all cursor-pointer group"
          >
            <div className="p-4 bg-slate-100 rounded-full group-hover:bg-primary/10 transition-colors mb-2">
              <Plus size={28} />
            </div>
            <p className="font-semibold">Add New Account</p>
          </motion.div>
        </motion.div>
      </div>
    ),
    [wallets, currency],
  );

  useEffect(() => {
    setTitle("My Wallet");
    setSubtitle("Manage your accounts and balances");
    setTopContent(memoizedTopContent);
  }, [setTitle, setSubtitle, setTopContent, memoizedTopContent]);

  async function handleSetPrimary(id: string, e: React.MouseEvent) {
    e.stopPropagation();

    // First, set all user's wallets to not primary
    await supabase
      .from("wallets")
      .update({ is_primary: false })
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

    const { error } = await supabase
      .from("wallets")
      .update({ is_primary: true })
      .eq("id", id);

    if (!error) {
      mutate(); // Refresh local SWR cache
    }
  }

  async function handleDeleteAccount(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure you want to delete this account? This will not delete your transactions.",
      )
    )
      return;

    const { error } = await supabase.from("wallets").delete().eq("id", id);

    if (error) {
      alert(
        "Cannot delete account. Make sure it has no active transactions or recurring bills.",
      );
      console.error("Delete error:", error);
    } else {
      mutate();
    }
  }

  const handleOpenModal = (wallet: any = null) => {
    setEditingWallet(wallet);
    if (wallet) {
      setName(wallet.name);
      setType(wallet.type);
      setBalance(wallet.balance.toString());
      setIsPrimary(wallet.is_primary);
    } else {
      setName("");
      setType("Personal");
      setBalance("");
      setIsPrimary(false);
    }
    setIsModalOpen(true);
  };

  const [name, setName] = useState("");
  const [type, setType] = useState("Personal");
  const [balance, setBalance] = useState("");
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);

  async function handleCreateAccount() {
    if (!name || !balance) return;
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // If setting this one as primary, unset others first
      if (isPrimary) {
        await supabase
          .from("wallets")
          .update({ is_primary: false })
          .eq("user_id", user.id);
      }

      // If setting this one as primary, unset others first
      if (isPrimary) {
        await supabase
          .from("wallets")
          .update({ is_primary: false })
          .eq("user_id", user.id);
      }

      let error;
      if (editingWallet) {
        const { error: updateError } = await supabase
          .from("wallets")
          .update({
            name,
            type,
            balance: parseFloat(balance),
            is_primary: isPrimary,
          })
          .eq("id", editingWallet.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("wallets").insert({
          name,
          type,
          balance: parseFloat(balance),
          user_id: user.id,
          is_primary: isPrimary || wallets.length === 0,
        });
        error = insertError;
      }

      if (!error) {
        setIsModalOpen(false);
        setEditingWallet(null);
        setName("");
        setBalance("");
        setIsPrimary(false);
        mutate();
      } else {
        console.error("Save error:", error);
        alert("Error saving account.");
      }
    }
    setIsSubmitting(false);
  }

  async function handleTopUp() {
    if (!selectedWalletId || !topUpAmount) return;
    setIsSubmitting(true);

    const wallet = wallets.find((w: any) => w.id === selectedWalletId);
    if (wallet) {
      const newBalance = wallet.balance + parseFloat(topUpAmount);
      const { error } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", selectedWalletId);

      if (!error) {
        setIsTopUpOpen(false);
        setTopUpAmount("");
        setSelectedWalletId("");
        mutate();
      }
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">
        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2">
            Quick Actions
          </h3>
          <div className="flex gap-4 sm:gap-6">
            <div onClick={() => setIsTopUpOpen(true)}>
              <ActionBtn icon={Plus} label="Top Up" />
            </div>
            <div onClick={() => handleOpenModal()}>
              <ActionBtn icon={WalletIcon} label="Add Account" />
            </div>
          </div>
        </section>

        {/* Connected Accounts List (Dynamic) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Connected Accounts
            </h3>
            <button className="text-sm text-primary font-semibold hover:opacity-80">
              Manage
            </button>
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
            className="space-y-3"
          >
            {isLoading || !mounted ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 w-full bg-slate-100 animate-pulse rounded-3xl"
                  />
                ))}
              </div>
            ) : wallets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">
                  No accounts found. Add one to get started!
                </p>
              </div>
            ) : (
              wallets.map((acc: any) => (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  key={acc.id}
                >
                  <Card
                    className={cn(
                      "flex items-center justify-between p-4 sm:p-5 transition-all duration-300",
                      acc.is_primary &&
                        "border-primary shadow-[0_8px_30px_rgba(0,208,158,0.12)]",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-3.5 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border",
                          acc.is_primary
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-slate-50 text-slate-600 border-slate-100",
                        )}
                      >
                        <Landmark size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-base sm:text-lg">
                            {acc.name}
                          </h4>
                          {acc.is_primary && (
                            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">
                          {acc.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-lg sm:text-xl tracking-tight text-slate-800 text-right">
                        {currency}
                        {acc.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(acc);
                          }}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Edit Account"
                        >
                          <Edit2 size={18} strokeWidth={2.5} />
                        </button>
                        {!acc.is_primary && (
                          <button
                            onClick={(e) => handleSetPrimary(acc.id, e)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            title="Set as Primary"
                          >
                            <Star size={18} strokeWidth={2.5} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteAccount(acc.id, e)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Account"
                        >
                          <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </section>
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWallet ? "Edit Account" : "Add New Account"}
        description={
          editingWallet
            ? "Update your account details."
            : "Create a new wallet to separate your funds."
        }
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Account Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vacation Fund"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Account Type
              </label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="Personal">Personal Account</option>
                  <option value="Working">Working / Business</option>
                  <option value="Savings">Savings / Investment</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Plus size={16} className="rotate-45" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                {editingWallet ? "Current Balance" : "Initial Balance"} (
                {currency})
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono text-lg"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCreateAccount}
              disabled={isSubmitting || !name || !balance}
              className="w-full bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle size={20} strokeWidth={2.5} />
                  {editingWallet ? "Save Changes" : "Create Account"}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Top Up Modal */}
      <Modal
        isOpen={isTopUpOpen}
        onClose={() => {
          setIsTopUpOpen(false);
          setTopUpAmount("");
          setSelectedWalletId("");
        }}
        title="Top Up Wallet"
        description="Add funds to one of your accounts."
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Select Account
              </label>
              <div className="relative">
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="">Choose an account...</option>
                  {wallets.map((wallet: any) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} ({currency}
                      {wallet.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Landmark size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Amount to Add ({currency})
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono text-lg"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleTopUp}
              disabled={isSubmitting || !selectedWalletId || !topUpAmount}
              className="w-full bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle size={20} strokeWidth={2.5} />
                  Confirm Top Up
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Helper Component for Quick Action Buttons
function ActionBtn({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:shadow-[0_8px_25px_rgba(0,184,142,0.3)] group-hover:-translate-y-1">
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <span className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
}
