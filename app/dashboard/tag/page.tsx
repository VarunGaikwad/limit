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
import { Card, Modal } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
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
        </motion.div>
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
      {!loading && categories.length === 0 && (
        <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">
            No custom categories yet. Start organizing!
          </p>
        </div>
      )}
      {/* Categories Grid */}
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 10 },
              visible: { opacity: 1, scale: 1, y: 0 },
            }}
          >
            <Card className="flex items-center justify-between p-5 group">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    cat.type === "expense"
                      ? "bg-rose-50 text-rose-500"
                      : "bg-emerald-50 text-emerald-500",
                  )}
                >
                  <Tag size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg leading-tight truncate max-w-[120px]">
                    {cat.name}
                  </h4>
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase tracking-wider mt-0.5",
                      cat.type === "expense"
                        ? "text-rose-400"
                        : "text-emerald-400",
                    )}
                  >
                    {cat.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(cat)}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Edit2 size={16} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} strokeWidth={2.5} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
        {/* Add Shortcut Card */}
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.95, y: 10 },
            visible: { opacity: 1, scale: 1, y: 0 },
          }}
        >
          <button
            onClick={() => handleOpenModal()}
            className="w-full h-full border-2 border-dashed border-slate-200 bg-white/50 hover:bg-white p-6 rounded-4xl flex items-center justify-center gap-3 text-slate-400 hover:text-primary hover:border-primary transition-all group shadow-sm hover:shadow-md min-h-20"
          >
            <PlusCircle
              size={22}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-bold">Add Category</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "New Category"}
        description="Organize your transactions with labels."
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-slate-400" />
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groceries, Salary"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1 uppercase tracking-wider">
                Type
              </label>
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    type === "expense"
                      ? "bg-white text-rose-500 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  Expense
                </button>
                <button
                  onClick={() => setType("income")}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    type === "income"
                      ? "bg-white text-emerald-500 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  Income
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveCategory}
            disabled={isSubmitting || !name}
            className="w-full bg-primary hover:bg-[#00d6a3] disabled:bg-slate-300 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,184,142,0.25)] hover:shadow-[0_12px_25px_rgba(0,184,142,0.35)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : editingCategory ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </button>
        </div>
      </Modal>
    </>
  );
}
