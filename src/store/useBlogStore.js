import { create } from "zustand";
import {
  getBlogSettings,
  updateBlogSettings as apiUpdateBlogSettings,
  getCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,

  getTags,
  createTag as apiCreateTag,
  updateTag as apiUpdateTag,
  deleteTag as apiDeleteTag,

  getPosts,
  createPost as apiCreatePost,
  updatePost as apiUpdatePost,
  deletePost as apiDeletePost
} from "../api/blogApi";
import { parseApiError } from "../utils/apiErrors";

/**
 * Turns a rejected write into something the screen can put on its fields.
 *
 * The store already held the server's answer and handed it over raw as
 * `err.response.data`, so the screen had nowhere to put it and dropped the
 * lot for a generic toast. It now arrives split: one message for the form,
 * one per field, and a flag for a request that was merely cancelled.
 */
function refusal(error) {
  const parsed = parseApiError(error);

  return {
    success: false,
    canceled: parsed.canceled,
    message: parsed.message,
    fields: parsed.fields,
    status: parsed.status,
  };
}

export const useBlogStore = create((set, get) => ({

  // ==========================
  // BLOG PAGE SETTINGS
  // ==========================
  fetchBlogSettings: async () => {
    try {
      const res = await getBlogSettings();
      return { success: true, data: res.data };
    } catch (error) {
      return refusal(error);
    }
  },

  updateBlogSettings: async (data) => {
    try {
      const res = await apiUpdateBlogSettings(data);
      return { success: true, data: res.data };
    } catch (error) {
      return refusal(error);
    }
  },

  // ==========================
  // CATEGORIES
  // ==========================
  categories: [],

  // The three fetchers had no catch at all, so a refused load threw into
  // nothing and the screen rendered an empty list — an outage and an empty
  // blog looked exactly alike.
  fetchCategories: async () => {
    try {
      const res = await getCategories();
      set({ categories: res.data });
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  createCategory: async (data) => {
    try {
      await apiCreateCategory(data);
      await get().fetchCategories();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  updateCategory: async (id, data) => {
    try {
      await apiUpdateCategory(id, data);
      await get().fetchCategories();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  deleteCategory: async (id) => {
    try {
      await apiDeleteCategory(id);
      await get().fetchCategories();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  // ==========================
  // TAGS
  // ==========================
  tags: [],

  fetchTags: async () => {
    try {
      const res = await getTags();
      set({ tags: res.data });
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  createTag: async (data) => {
    try {
      await apiCreateTag(data);
      await get().fetchTags();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  updateTag: async (id, data) => {
    try {
      await apiUpdateTag(id, data);
      await get().fetchTags();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  deleteTag: async (id) => {
    try {
      await apiDeleteTag(id);
      await get().fetchTags();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  // ==========================
  // POSTS
  // ==========================
  posts: [],

  fetchPosts: async () => {
    try {
      const res = await getPosts();
      set({ posts: res.data });
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  createPost: async (formData) => {
    try {
      await apiCreatePost(formData);
      await get().fetchPosts();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  updatePost: async (id, formData) => {
    try {
      await apiUpdatePost(id, formData);
      await get().fetchPosts();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  },

  deletePost: async (id) => {
    try {
      await apiDeletePost(id);
      await get().fetchPosts();
      return { success: true };
    } catch (error) {
      return refusal(error);
    }
  }

}));
