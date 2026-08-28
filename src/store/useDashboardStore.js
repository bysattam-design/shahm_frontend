import { create } from "zustand";
import { getDashboardStats } from "../api/dashboardApi";
import { parseApiError } from "../utils/apiErrors";

/**
 * The figures the home screen opens on.
 *
 * `loadStats` had no catch at all: a refused answer threw into nothing and
 * left `stats` null, and the screen renders its spinner whenever `stats` is
 * null. So a dropped connection put the first screen an editor sees on a
 * spinner that never stopped, with no reason and no way to ask again.
 */
export const useDashboardStore = create((set) => ({
  stats: null,
  status: "loading",
  error: "",

  loadStats: async () => {
    set((state) => ({ status: state.stats ? state.status : "loading", error: "" }));

    try {
      const res = await getDashboardStats();
      set({ stats: res.data, status: "ready", error: "" });
      return { success: true };
    } catch (error) {
      const parsed = parseApiError(error);

      // A request that was replaced by a newer one is not a failure.
      if (parsed.canceled) return { success: false, canceled: true };

      set({ status: "failed", error: parsed.message });
      return { success: false, message: parsed.message };
    }
  },
}));
