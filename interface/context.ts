import { ReactNode } from "react";

export interface DashboardContextType {
  title: string;
  subtitle: string;
  topContent: ReactNode;
  currency: string;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setTopContent: (content: ReactNode) => void;
  setCurrency: (currency: string) => void;
}
