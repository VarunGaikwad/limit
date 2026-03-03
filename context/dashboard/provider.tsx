"use client";

import { DashboardContext } from "@/context";
import { useState, ReactNode, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [title, setTitle] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState("");
  const [topContent, setTopContent] = useState<ReactNode>(null);
  const [currency, setCurrency] = useState("$");

  useEffect(() => {
    async function fetchCurrency() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("currency")
          .eq("id", user.id)
          .single();

        if (!error && data?.currency) {
          setCurrency(data.currency);
        }
      }
    }
    fetchCurrency();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        title,
        subtitle,
        topContent,
        currency,
        setTitle,
        setSubtitle,
        setTopContent,
        setCurrency,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
