"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({
  children,
  className,
  onClick,
  hover = true,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={cn(
        "bg-white p-6 rounded-4xl shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden",
        onClick && "cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
