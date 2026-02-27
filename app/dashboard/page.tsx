"use client";

import { useDashboard } from "@/components";
import { useEffect } from "react";

export default function Dashboard() {
  const { setTitle, setSubtitle, setTopContent } = useDashboard();

  useEffect(() => {
    setTitle("Hi, Welcome Back");
    setSubtitle("Good Morning");
    setTopContent(
      <div>
        <div>
          <div>Budget Name</div>
        </div>
      </div>,
    );
  }, [setTitle, setSubtitle, setTopContent]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary">
          Recent Transactions
        </h2>
        <button className="text-sm text-primary/60 font-medium">See All</button>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
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
