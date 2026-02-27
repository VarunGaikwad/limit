"use client";

import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";

export default function SplashScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show splash screen for 1.5s
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setShow(false);
      }, 500); // fade duration
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return <>{children}</>;

  return (
    <>
      <div
        className={`fixed inset-0 bg-primary grid place-content-center z-50 transition-opacity duration-500 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="text-center space-y-4">
          <div className="relative">
            <Landmark className="size-40 text-white animate-bounce-subtle mx-auto" />
            <div className="absolute inset-0 bg-snow/20 blur-3xl rounded-full -z-10 animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-black text-6xl text-white tracking-widest animate-slide-up">
              LIMIT
            </h1>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="size-2 bg-snow/50 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={isFading ? "opacity-100" : "opacity-0"}>{children}</div>
    </>
  );
}
