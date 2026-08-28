// src/store/useUsersStore.js
import { create } from "zustand";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/authApi";
import { parseApiError } from "../utils/apiErrors";

/**
 * The users the panel administers.
 *
 * Two things were wrong here and both showed on the screen. The store spoke
 * English — `toast.error("Failed to load users")` — in a panel that is read in
 * Arabic, and it spoke at the same moment the screen did, so a saved user
 * raised two notices. And `removeUser` returned nothing at all while the screen
 * tested its answer, so every successful delete reported itself as a failure.
 *
 * The store now carries the outcome and the server's own words; the screen,
 * which holds the translation, does the talking.
 */
export const useUsersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });

    try {
      const res = await getUsers();
      set({ users: Array.isArray(res.data) ? res.data : [] });
      return true;
    } catch (err) {
      const { canceled, message } = parseApiError(err);
      /* A request the client itself aborted is not a failure to report. */
      if (!canceled) set({ error: message || true });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  addUser: async (data) => {
    try {
      const res = await createUser(data);
      set({ users: [...get().users, res.data] });
      return true;
    } catch (err) {
      return false;
    }
  },

  editUser: async (id, data) => {
    try {
      const res = await updateUser(id, data);
      set({ users: get().users.map((u) => (u.id === id ? res.data : u)) });
      return true;
    } catch (err) {
      return false;
    }
  },

  removeUser: async (id) => {
    try {
      await deleteUser(id);
      set({ users: get().users.filter((u) => u.id !== id) });
      return true;
    } catch (err) {
      return false;
    }
  },
}));
