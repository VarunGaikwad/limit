"use client";

import { SWRConfig } from "swr";
import { useEffect } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const registerSW = () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered:", registration.scope);
          })
          .catch((err) => {
            console.log("SW registration failed:", err);
          });
      }
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
    }

    return () => window.removeEventListener("load", registerSW);
  }, []);

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 5000,
        provider: () => {
          // Initialize SWR cache from localStorage if possible
          if (typeof window === "undefined") return new Map();

          const localStorageKey = "swr-cache-v1";
          let initialData = {};
          try {
            const cached = localStorage.getItem(localStorageKey);
            if (cached) {
              initialData = JSON.parse(cached);
            }
          } catch (e) {
            console.error("Could not parse swr-cache", e);
          }

          const map = new Map(Object.entries(initialData));

          // Proxy set and delete to persistence
          const originalSet = map.set.bind(map);
          const originalDelete = map.delete.bind(map);

          map.set = (key, value) => {
            const result = originalSet(key, value);
            persistCache(map, localStorageKey);
            return result;
          };

          map.delete = (key) => {
            const result = originalDelete(key);
            persistCache(map, localStorageKey);
            return result;
          };

          return map;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}

function persistCache(map: Map<any, any>, key: string) {
  if (typeof window === "undefined") return;
  // Use a small delay/throttle if updates are very frequent, but for simple app its fine
  try {
    const data = Object.fromEntries(map.entries());
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Could not persist swr-cache", e);
  }
}
