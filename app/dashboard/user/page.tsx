"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/hook";
import {
  User as UserIcon,
  Mail,
  LogOut,
  Shield,
  Bell,
  Smartphone,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export default function UserProfile() {
  const { setTitle, setSubtitle, setTopContent, currency, setCurrency } =
    useDashboard();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const CURRENCIES = ["$", "€", "£", "₹", "¥", "Rp"];

  useEffect(() => {
    setTitle("Profile");
    setSubtitle("Manage your account settings");
    setTopContent(null);

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }

    getUser();
  }, [setTitle, setSubtitle, setTopContent, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleCurrencyChange(newCurrency: string) {
    if (isUpdating || currency === newCurrency) return;
    setIsUpdating(true);

    setCurrency(newCurrency); // Optimistic update

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ currency: newCurrency })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating currency:", error);
      }
    }
    setIsUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* User Header Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center gap-8">
        <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
          <UserIcon size={48} strokeWidth={1.5} />
        </div>
        <div className="text-center md:text-left space-y-2 flex-1">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {user?.user_metadata?.full_name || "Limit User"}
          </h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium text-sm">
            <Mail size={16} />
            {user?.email}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100 flex items-center gap-1">
              <UserCheck size={12} />
              Verified Account
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-rose-50 hover:bg-rose-100 text-rose-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:-translate-y-1"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">
            Security & Identity
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
            <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-700">
                    Password & Security
                  </p>
                  <p className="text-xs text-slate-400">Update your password</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
            <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Two-Factor Auth</p>
                  <p className="text-xs text-slate-400">Secure your account</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">
            Preferences
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
            <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Notifications</p>
                  <p className="text-xs text-slate-400">Management alerts</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>

            {/* Preferred Currency Section */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                  <span className="text-xl font-bold">{currency}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-700">Preferred Currency</p>
                  <p className="text-xs text-slate-400">
                    For all transactions & budgets
                  </p>
                </div>
                {isUpdating && (
                  <div className="ml-auto animate-spin h-4 w-4 border-b-2 border-primary rounded-full" />
                )}
              </div>
              <div className="grid grid-cols-6 gap-2 pt-2">
                {CURRENCIES.map((cur) => (
                  <button
                    key={cur}
                    onClick={() => handleCurrencyChange(cur)}
                    disabled={isUpdating}
                    className={`h-10 rounded-xl font-bold transition-all border-2 flex items-center justify-center ${
                      currency === cur
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110"
                        : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
