import { ReactNode } from "react";

export interface DashboardContextType {
  title: string;
  subtitle: string;
  topContent: ReactNode;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setTopContent: (content: ReactNode) => void;
}
