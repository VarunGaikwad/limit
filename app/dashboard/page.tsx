"use client";

import { useDashboard } from "@/hook";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { setTitle, setSubtitle, setTopContent } = useDashboard();
  const [currentMenu, setCurrentMenu] = useState("All");

  useEffect(() => {
    setTitle("Hi, Welcome Back");
    setSubtitle("Good Morning");
    setTopContent(
      <div
        className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-5 md:gap-6 pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden pt-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-[85%] md:w-full shrink-0 snap-center md:snap-none bg-white rounded-3xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-transform hover:-translate-y-1 duration-300 group"
          >
            <div className="space-y-1">
              <div className="font-semibold text-slate-500 text-sm tracking-wide uppercase">
                Budget Name {i}
              </div>
              <div className="text-slate-900 font-bold text-2xl md:text-3xl tracking-tight">
                $8,250{" "}
                <span className="text-sm font-medium text-slate-400 block sm:inline mt-1 sm:mt-0">
                  left of $11,011
                </span>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="relative">
                <div className="h-3 w-full bg-slate-100 block rounded-full overflow-hidden shadow-inner">
                  <div
                    style={{ width: "80%" }}
                    className="h-full bg-primary rounded-full relative overflow-hidden transition-all duration-1000 ease-out group-hover:bg-[#00d6a3]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite_ease-in-out]" />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium inline-block bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  You can spend $8,026/day for 1 more day
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>,
    );
  }, [setTitle, setSubtitle, setTopContent]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Recent Transactions
        </h2>
        <div className="bg-gray-100/80 backdrop-blur-md p-1.5 rounded-2xl flex items-center gap-1 border border-gray-200/50">
          {["All", "Income", "Expense"].map((filter) => (
            <button
              key={filter}
              className={`w-fit md:w-28 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${currentMenu === filter ? "bg-white text-primary shadow-[0_2px_10px_rgb(0,0,0,0.06)]" : "text-gray-500 hover:text-gray-800"}`}
              onClick={() => setCurrentMenu(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="hidden sm:block text-primary font-semibold cursor-pointer hover:opacity-80 transition-opacity">
          View All
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-primary/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <div className="w-6 h-6 bg-primary rounded-lg" />
              </div>
              <div>
                <p className="font-semibold">Transaction {i}</p>
                <p className="text-xs text-black/40">Category • 2 hours ago</p>
              </div>
            </div>
            <p className="font-bold text-red-500">-$45.00</p>
          </div>
        ))}
      </div>
    </div>
  );
}
