import DashboardContext from "@/context/dashboard/context";
import { useContext } from "react";

export default function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
