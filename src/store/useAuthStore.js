import { create } from "zustand";
import { getCurrentUser, login as loginApi } from "../api/authApi";
import {
  clearTokens,
  readAccessToken,
  readRefreshToken,
  saveTokens,
} from "../utils/tokenStorage";

/**
 * Who is signed in.
 *
 * The account used to be learned only from the sign-in answer and held in
 * memory, so a reload left the app with a valid token and no idea whose it
 * was. Every role check then read `undefined` — which is why the guard was
 * never switched on, and why every screen was offered to everyone.
 *
 * `identityStatus` says where the answer stands, so a screen can wait for it
 * rather than deciding permission against a blank.
 *
 *   unknown  — no token; nobody is signed in
 *   loading  — a token is stored and the account is being fetched
 *   ready    — the account is known
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: readAccessToken(),
  refreshToken: readRefreshToken(),
  isAuthenticated: !!readAccessToken(),
  identityStatus: readAccessToken() ? "loading" : "unknown",

  /**
   * Fetches the account behind the stored token. Runs once when the app opens.
   * A refused answer means the token is no longer good for anything, so the
   * session is dropped rather than left half-signed-in.
   */
  loadUser: async () => {
    if (!get().accessToken) {
      set({ user: null, identityStatus: "unknown", isAuthenticated: false });
      return null;
    }

    try {
      const res = await getCurrentUser();

      set({ user: res.data, identityStatus: "ready", isAuthenticated: true });

      return res.data;
    } catch (error) {
      // A cancelled or offline request is not a refusal: keep the session and
      // let the caller try again, rather than signing an editor out for a
      // dropped connection.
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        get().logout();
        return null;
      }

      set({ identityStatus: "unknown" });
      return null;
    }
  },

  login: async (credentials) => {
    try {
      const res = await loginApi(credentials);

      const { access, refresh, user } = res.data;

      saveTokens({ access, refresh });

      set({
        accessToken: access,
        refreshToken: refresh,
        user,
        isAuthenticated: true,
        identityStatus: "ready",
      });

      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    clearTokens();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      identityStatus: "unknown",
    });
  },
}));
