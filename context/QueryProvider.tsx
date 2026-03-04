"use client";

import { SWRConfig } from "swr";
import { useEffect } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log(
              "Service Worker registration successful with scope: ",
              registration.scope,
            );
          },
          function (err) {
            console.log("Service Worker registration failed: ", err);
          },
        );
      });
    }
  }, []);

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 5000,
        provider: () => {
          // Initialize SWR cache from localStorage if possible
          const map = new Map();
          if (typeof window !== "undefined") {
            try {
              const cached = localStorage.getItem("swr-cache");
              if (cached) {
                const parsed = JSON.parse(cached);
                Object.entries(parsed).forEach(([key, value]) =>
                  map.set(key, value),
                );
              }
            } catch (e) {
              console.error("Could not load cache", e);
            }

            // Sync cache to localStorage on update
            window.addEventListener("beforeunload", () => {
              const appCache = Object.fromEntries(map.entries());
              localStorage.setItem("swr-cache", JSON.stringify(appCache));
            });
          }
          return map;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
