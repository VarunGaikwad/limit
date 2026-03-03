"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
import {
  Plus,
  Landmark,
  CircleDollarSign,
  X,
  WalletIcon,
  Trash2,
  Star,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function Wallet() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchWallets = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setWallets(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    setTitle("My Wallet");
    setSubtitle("Manage your accounts and balances");

    const displayWallets = wallets;

    setTopContent(
      <div className="w-full relative overflow-hidden mt-4 md:mt-2">
        <div
          className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayWallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`shrink-0 snap-center w-[85%] sm:w-85 h-50 rounded-4xl p-6 xl:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] bg-linear-to-br ${wallet.gradient || "from-slate-900 to-slate-800"} transition-transform hover:-translate-y-1 duration-300 group`}
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
            </div>
          ))}

          <div
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 snap-center w-[85%] sm:w-85 h-50 rounded-4xl border-2 border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-white transition-all cursor-pointer group"
          >
            <div className="p-4 bg-slate-100 rounded-full group-hover:bg-primary/10 transition-colors mb-2">
              <Plus size={28} />
            </div>
            <p className="font-semibold">Add New Account</p>
          </div>
        </div>
      </div>,
    );
  }, [setTitle, setSubtitle, setTopContent, wallets, currency]);

  async function handleSetPrimary(id: string, e: React.MouseEvent) {
    e.stopPropagation();

    // First, set all user's wallets to not primary
    await supabase
      .from("wallets")
      .update({ is_primary: false })
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

    // Then set the selected one as primary
    const { error } = await supabase
      .from("wallets")
      .update({ is_primary: true })
      .eq("id", id);

    if (!error) {
      fetchWallets();
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

    if (!error) {
      fetchWallets();
    }
  }

  const [name, setName] = useState("");
  const [type, setType] = useState("Personal");
  const [balance, setBalance] = useState("");
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateAccount() {
    if (!name || !balance) return;
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("wallets").insert({
        name,
        type,
        balance: parseFloat(balance),
        user_id: user.id,
      });

      if (!error) {
        setIsModalOpen(false);
        setName("");
        setBalance("");
        fetchWallets();
      }
    }
    setIsSubmitting(false);
  }

  async function handleTopUp() {
    if (!selectedWalletId || !topUpAmount) return;
    setIsSubmitting(true);

    const wallet = wallets.find((w) => w.id === selectedWalletId);
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
        fetchWallets();
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
            <div onClick={() => setIsModalOpen(true)}>
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

          <div className="space-y-3">
            {wallets.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">
                  No accounts found. Add one to get started!
                </p>
              </div>
            )}
            {wallets.map((acc) => (
              <div
                key={acc.id}
                className={`flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border transition-all duration-300 group cursor-pointer ${acc.is_primary ? "border-primary shadow-[0_8px_30px_rgba(0,208,158,0.12)]" : "border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5"}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3.5 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border ${acc.is_primary ? "bg-primary/10 text-primary border-primary/20" : "bg-slate-50 text-slate-600 border-slate-100"}`}
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
                    {!acc.is_primary && (
                      <button
                        onClick={(e) => handleSetPrimary(acc.id, e)}
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
                        title="Set as Primary"
                      >
                        <Star size={18} strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteAccount(acc.id, e)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh] overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="overflow-y-auto pr-2 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Add New Account
                </h2>
                <p className="text-slate-500 text-sm">
                  Create a new wallet to separate your funds.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 pl-1">
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
                  <label className="text-sm font-semibold text-slate-600 pl-1">
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
                  <label className="text-sm font-semibold text-slate-600 pl-1">
                    Initial Balance ({currency})
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
                    "Create Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Top Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh] overflow-hidden">
            <button
              onClick={() => {
                setIsTopUpOpen(false);
                setTopUpAmount("");
                setSelectedWalletId("");
              }}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="overflow-y-auto pr-2 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Top Up Wallet
                </h2>
                <p className="text-slate-500 text-sm">
                  Add funds to one of your accounts.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 pl-1">
                    Select Account
                  </label>
                  <div className="relative">
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
                    >
                      <option value="">Choose an account...</option>
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({currency}
                          {w.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Landmark size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 pl-1">
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
                    "Confirm Top Up"
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
