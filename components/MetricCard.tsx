"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  className,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}
      className={cn(
        "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group transition-all",
        className,
      )}
    >
      <div
        className={cn(
          "p-3 rounded-2xl group-hover:scale-110 transition-transform",
          iconBg,
          iconColor,
        )}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-xl font-black text-slate-800 tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
