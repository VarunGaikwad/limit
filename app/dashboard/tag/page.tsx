"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";
import {
  Plus,
  Coffee,
  ShoppingCart,
  Activity,
  ShoppingBag,
  Car,
  Home as HomeIcon,
  Smartphone,
  Zap,
  Briefcase,
  Tag,
  PlusCircle,
  X,
  Edit2,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function Category() {
  const { setTitle, setSubtitle, setTopContent, currency } = useDashboard();
  const supabase = createClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  const fetchCategories = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (!error && data) setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setTitle("Categories");
    setSubtitle("Manage your transaction tags");

    setTopContent(
      <div className="w-full mt-4 md:mt-2">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              Organize Finances
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Add or edit tags used for mapping your transactions.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary hover:bg-[#00d6a3] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <Plus size={20} className="stroke-3" />
            New Category
          </button>
        </div>
      </div>,
    );
  }, [setTitle, setSubtitle, setTopContent]);

  const handleOpenModal = (cat: any = null) => {
    setEditingCategory(cat);
    if (cat) {
      setName(cat.name);
      setType(cat.type);
    } else {
      setName("");
      setType("expense");
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!name) return;
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const catData = {
      name,
      type,
      user_id: user.id,
    };

    let error;
    if (editingCategory) {
      const { error: updateError } = await supabase
        .from("categories")
        .update(catData)
        .eq("id", editingCategory.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("categories")
        .insert(catData);
      error = insertError;
    }

    if (!error) {
      setIsModalOpen(false);
      fetchCategories();
    }
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This will not delete transactions using this category.",
      )
    )
      return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) fetchCategories();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pb-20">
        {!loading && categories.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">
              No custom categories yet. Start organizing!
            </p>
          </div>
        )}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-4 position-relative z-10">
              <div
                className={`p-3.5 rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110 bg-primary/10 text-primary border border-primary/20`}
              >
                <Tag size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base sm:text-lg leading-tight transition-colors">
                  {cat.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    {cat.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Management Actions */}
            <div className="flex items-center gap-1 sm:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => handleOpenModal(cat)}
                className="p-2 sm:p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                aria-label="Edit Category"
              >
                <Edit2 size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                aria-label="Delete Category"
              >
                <Trash2 size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}

        {/* Add Category Card (Inline) */}
        <div
          onClick={() => handleOpenModal()}
          className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white p-4 sm:p-5 rounded-3xl flex items-center gap-4 text-slate-400 hover:text-primary hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="p-3.5 rounded-[1.25rem] flex items-center justify-center bg-transparent group-hover:bg-primary/10 transition-colors">
            <PlusCircle
              size={22}
              className="group-hover:scale-110 transition-transform"
              strokeWidth={2.5}
            />
          </div>
          <h4 className="font-bold text-lg leading-tight">Add New Category</h4>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 fade-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {editingCategory ? "Edit Category" : "New Category"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {editingCategory
                    ? "Update the details for this tag."
                    : "Create a custom tag for your transactions."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 pl-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Travel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="text-sm font-semibold text-slate-600 pl-1">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Plus size={16} className="rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={handleSaveCategory}
                  disabled={isSubmitting || !name}
                  className="w-full bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : editingCategory ? (
                    "Save Changes"
                  ) : (
                    "Create Category"
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
