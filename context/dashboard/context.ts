import { DashboardContextType } from "@/interface";
import { createContext } from "react";

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export default DashboardContext;
