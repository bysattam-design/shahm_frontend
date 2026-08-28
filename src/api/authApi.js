import api from "./axiosClient";
import { API_PATHS } from "./routes";

export const login = (data) => api.post(API_PATHS.auth.login, data);

/** Who the stored token belongs to. Called once when the app opens. */
export const getCurrentUser = () => api.get(API_PATHS.auth.me);

export const getUsers = () => api.get(API_PATHS.auth.users);
export const createUser = (data) => api.post(API_PATHS.auth.createUser, data);

export const updateUser = (id, data) =>
  api.patch(API_PATHS.auth.user(id), data);

export const deleteUser = (id) =>
  api.delete(API_PATHS.auth.user(id));
