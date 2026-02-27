"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
  title: string;
  subtitle: string;
  topContent: ReactNode;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setTopContent: (content: ReactNode) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
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

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
