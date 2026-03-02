"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
import { Plus, Landmark, CircleDollarSign, X, WalletIcon } from "lucide-react";

// Mock Wallets Data (No sensitive CC info)
const WALLETS = [
  {
    id: 1,
    balance: "12,450.00",
    name: "Main Wallet",
    type: "Personal",
    gradient: "from-slate-900 to-slate-800",
  },
  {
    id: 2,
    balance: "3,210.50",
    name: "Business Funds",
    type: "Working",
    gradient: "from-primary to-[#009b75]",
  },
];

// Mock Connected Accounts
const ACCOUNTS = [
  { id: 1, name: "Chase Checking", number: "**** 8821", amount: 8450.00, icon: Landmark },
  { id: 2, name: "Savings Account", number: "**** 1192", amount: 25000.00, icon: CircleDollarSign },
];

export default function Wallet() {
  const { setTitle, setSubtitle, setTopContent } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setTitle("My Wallet");
    setSubtitle("Manage your accounts and balances");
    
    // Top Content: Horizontal Scrollable Accounts
    setTopContent(
      <div className="w-full relative overflow-hidden mt-4 md:mt-2">
        <div 
          className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" 
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {WALLETS.map((wallet) => (
            <div 
              key={wallet.id}
              className={`shrink-0 snap-center w-[85%] sm:w-[340px] h-[200px] rounded-[2rem] p-6 xl:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] bg-gradient-to-br ${wallet.gradient} transition-transform hover:-translate-y-1 duration-300 group`}
            >
              {/* Decorative Glass Overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-white/20 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-y-8 -translate-x-8" />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-white/70 text-sm font-medium">Total Balance</p>
                  <p className="font-bold text-3xl sm:text-4xl tracking-tight">${wallet.balance}</p>
                </div>
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl shadow-inner border border-white/10">
                  <span className="font-bold text-xs uppercase tracking-wider opacity-90">{wallet.type}</span>
                </div>
              </div>

              <div className="relative z-10">
                <p className="font-semibold text-lg uppercase tracking-wider opacity-90">{wallet.name}</p>
              </div>
            </div>
          ))}
          
          {/* Add New Account Button */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 snap-center w-[85%] sm:w-[340px] h-[200px] rounded-[2rem] border-2 border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-white transition-all cursor-pointer group"
          >
            <div className="p-4 bg-slate-100 rounded-full group-hover:bg-primary/10 transition-colors mb-3">
              <Plus size={28} />
            </div>
            <p className="font-semibold">Add New Account</p>
          </div>
        </div>
      </div>
    );
  }, [setTitle, setSubtitle, setTopContent]);

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        
        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2">Quick Actions</h3>
          <div className="flex gap-4 sm:gap-6">
            <ActionBtn icon={Plus} label="Top Up" />
            <div onClick={() => setIsModalOpen(true)}>
              <ActionBtn icon={WalletIcon} label="Add Account" />
            </div>
          </div>
        </section>

        {/* Connected Accounts */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Connected Accounts</h3>
            <button className="text-sm text-primary font-semibold hover:opacity-80">Manage</button>
          </div>
          
          <div className="space-y-3">
            {ACCOUNTS.map((acc) => (
              <div 
                key={acc.id} 
                className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border border-slate-100">
                    <acc.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base sm:text-lg">{acc.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium font-mono">{acc.number}</p>
                  </div>
                </div>
                <div className="font-bold text-lg sm:text-xl tracking-tight text-slate-800">
                  ${acc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 fade-in duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Add New Account</h2>
                <p className="text-slate-500 text-sm">Create a new wallet to separate your funds.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 pl-1">Account Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Vacation Fund" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 pl-1">Account Type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer">
                    <option value="personal">Personal</option>
                    <option value="working">Working</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 pl-1">Initial Balance ($)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-primary hover:bg-[#00d6a3] text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300"
                >
                  Create Account
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
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:shadow-[0_8px_25px_rgba(0,184,142,0.3)] group-hover:-translate-y-1">
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <span className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">{label}</span>
    </div>
  );
}
