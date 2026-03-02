"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
import { Plus, Target, Car, Coffee, Home as HomeIcon, ShoppingBag, Zap, Briefcase, PlusCircle, X, Check, Edit2, Trash2, PieChart } from "lucide-react";

const AVAILABLE_CATEGORIES = [
  "Food & Drink", "Groceries", "Entertainment", "Shopping", 
  "Transport", "Housing", "Utilities", "Subscriptions"
];

const INITIAL_BUDGETS = [
  { 
    id: 1, 
    name: "Living Costs", 
    totalAmount: 2500, 
    spentAmount: 1850, 
    categories: ["Housing", "Utilities", "Groceries"],
    icon: HomeIcon, color: "text-indigo-500", bg: "bg-indigo-500/10", fill: "bg-indigo-500"
  },
  { 
    id: 2, 
    name: "Transport & Travel", 
    totalAmount: 400, 
    spentAmount: 320, 
    categories: ["Transport"],
    icon: Car, color: "text-blue-500", bg: "bg-blue-500/10", fill: "bg-blue-500"
  },
  { 
    id: 3, 
    name: "Fun Money", 
    totalAmount: 300, 
    spentAmount: 280, 
    categories: ["Entertainment", "Shopping", "Food & Drink"],
    icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/10", fill: "bg-orange-500"
  },
];

export default function Budget() {
  const { setTitle, setSubtitle, setTopContent } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  // Modal State
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    setTitle("Budgets");
    setSubtitle("Track your spending limits");
    
    setTopContent(
      <div className="w-full mt-4 md:mt-2">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Goals</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Set monthly limits across multiple categories to stay on track.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary hover:bg-[#00d6a3] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <Plus size={20} className="stroke-[3]" />
            New Budget
          </button>
        </div>
      </div>
    );
  }, [setTitle, setSubtitle, setTopContent]);

  const handleOpenModal = (budget: any = null) => {
    setEditingBudget(budget);
    if (budget) {
      setBudgetName(budget.name);
      setBudgetAmount(budget.totalAmount.toString());
      setSelectedCategories([...budget.categories]);
    } else {
      setBudgetName("");
      setBudgetAmount("");
      setSelectedCategories([]);
    }
    setIsModalOpen(true);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Budgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {INITIAL_BUDGETS.map((budget) => {
            const percentage = Math.min((budget.spentAmount / budget.totalAmount) * 100, 100);
            const isWarning = percentage >= 90;
            const remaining = budget.totalAmount - budget.spentAmount;

            return (
              <div 
                key={budget.id} 
                className="bg-white p-6 sm:p-7 rounded-[2rem] shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group flex flex-col gap-6 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-[1.25rem] flex items-center justify-center ${budget.bg} ${budget.color}`}>
                      <budget.icon size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xl leading-tight">{budget.name}</h4>
                      <p className="text-sm font-semibold text-slate-400 mt-1">
                        ${budget.spentAmount.toLocaleString()} of ${budget.totalAmount.toLocaleString()}
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
                      className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3 z-10">
                  <div className="flex justify-between items-end">
                    <span className={`text-sm font-bold ${isWarning ? 'text-rose-500' : 'text-slate-500'}`}>
                      {remaining >= 0 ? `$${remaining.toLocaleString()} left` : `-$${Math.abs(remaining).toLocaleString()} over`}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isWarning ? 'bg-rose-500' : budget.fill}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Categories Chips */}
                <div className="pt-5 border-t border-slate-100/80 z-10">
                  <div className="flex flex-wrap gap-2">
                    {budget.categories.map(cat => (
                      <span key={cat} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold rounded-lg tracking-wide uppercase">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Budget Card */}
          <div 
            onClick={() => handleOpenModal()}
            className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-primary hover:border-primary/50 transition-all cursor-pointer group min-h-[280px]"
          >
            <div className="p-4 rounded-[1.25rem] flex items-center justify-center bg-transparent group-hover:bg-primary/10 transition-colors">
              <PlusCircle size={36} className="group-hover:scale-110 transition-transform" strokeWidth={2} />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-xl text-slate-600 group-hover:text-primary transition-colors">Create New Budget</h4>
              <p className="text-sm font-medium mt-1">Group multiple categories under one limit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {editingBudget ? "Edit Budget" : "New Budget"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {editingBudget ? "Update grouping and limits." : "Group transactions and set a spending limit."}
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">Budget Name</label>
                  <input 
                    type="text" 
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    placeholder="e.g. Vacation Fund" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">Total Amount ($)</label>
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
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Included Categories</label>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {selectedCategories.length} Selected
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_CATEGORIES.map(cat => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <div 
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className={`flex items-center justify-center w-5 h-5 rounded-[0.4rem] transition-colors ${
                            isSelected ? "bg-primary text-white" : "border-2 border-slate-300 bg-transparent"
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="text-sm font-bold truncate">{cat}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  disabled={!budgetName || !budgetAmount || selectedCategories.length === 0}
                  className="w-full bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 disabled:shadow-none text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
                >
                  <Target size={20} strokeWidth={2.5} />
                  {editingBudget ? "Save Changes" : "Create Budget"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
