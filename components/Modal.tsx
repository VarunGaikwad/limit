"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  // Handle body scroll lock and ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              mass: 0.8,
            }}
            style={{
              clipPath: "inset(0 round 2.5rem)",
              willChange: "transform, opacity",
            }}
            className={cn(
              "bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative flex flex-col max-h-[90vh] overflow-hidden border border-slate-100",
              className,
            )}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 bg-slate-100/80 hover:bg-slate-200 text-slate-500 rounded-full transition-all duration-200 z-50 hover:scale-110 active:scale-95"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 space-y-8 custom-scrollbar relative">
              <div className="space-y-2 text-left pr-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {title}
                </h2>
                {description && (
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <div className="relative">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
