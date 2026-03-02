"use client";

import { DashboardContext } from "@/context";
import { useState, ReactNode } from "react";

export default function DashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [title, setTitle] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState("");
  const [topContent, setTopContent] = useState<ReactNode>(null);

  return (
    <DashboardContext.Provider
      value={{
        title,
        subtitle,
        topContent,
        setTitle,
        setSubtitle,
        setTopContent,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
