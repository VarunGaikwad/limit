"use client";

import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";

export default function SplashScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const navEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    const isReload = navEntries[0]?.type === "reload";

    if (isReload) {
      setLoading(true);

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-primary grid place-content-center z-50">
          <div className="text-center space-y-2.5 animate-pulse">
            <Landmark className="size-40 text-white" />
            <span className="font-extrabold text-5xl text-white">LIMIT</span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
