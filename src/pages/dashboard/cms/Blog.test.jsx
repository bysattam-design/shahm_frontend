import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import toast from "react-hot-toast";

import api from "../../../api/axiosClient";
import { useBlogStore } from "../../../store/useBlogStore";
import BlogCms from "./Blog";

// The notices are the whole point of this screen's failures, so they are
// watched rather than left to a Toaster that is not mounted here.
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const CATEGORIES = [
  { id: 1, name_ar: "مقالات", name_en: "Articles", slug: "articles", color: "#353C3C", icon: null },
];
const TAGS = [{ id: 5, name_ar: "نظام", name_en: "Law", slug: "law" }];
const POSTS = [
  { id: 9, title_ar: "مقال", title_en: "Post", status: "draft", slug: "post", sections: [], tags: [], category: 1 },
];
const SETTINGS = {
  title_ar: "المدونة", title_en: "Blog",
  description_ar: "وصف", description_en: "desc",
};

/** A refusal shaped the way the backend shapes one. */
function rejection(fields, message = "تعذر الحفظ", status = 400) {
  return { response: { status, data: { success: false, message, errors: fields } } };
}

function serve({ listsFail = false } = {}) {
  api.get.mockImplementation((url) => {
    const path = String(url);
    if (listsFail && path.includes("categories")) {
      return Promise.reject({ response: { status: 500, data: { detail: "تعذر جلب التصنيفات." } } });
    }
    if (path.includes("categories")) return Promise.resolve({ data: CATEGORIES });
    if (path.includes("tags")) return Promise.resolve({ data: TAGS });
    if (path.includes("posts")) return Promise.resolve({ data: POSTS });
    if (path.includes("settings")) return Promise.resolve({ data: SETTINGS });
    return Promise.resolve({ data: [] });
  });
  api.post.mockResolvedValue({ data: {} });
  api.patch.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
}

async function renderScreen(options) {
  serve(options);
  render(<BlogCms />);
}

/** Waits until the first load has put the tabs on the screen. */
async function settled() {
  await screen.findByRole("tab", { name: /cms\.blog\.tabs\.categories/ });
}

function openTab(key) {
  userEvent.click(screen.getByRole("tab", { name: new RegExp(`cms\\.blog\\.tabs\\.${key}`) }));
}

beforeEach(() => {
  toast.success.mockClear();
  toast.error.mockClear();
  useBlogStore.setState({ categories: [], tags: [], posts: [] });
});

describe("the blog screen", () => {
  test("a refused delete is not announced as a success", async () => {
    await renderScreen();
    await settled();
    openTab("categories");

    api.delete.mockRejectedValueOnce(
      rejection(null, "لا يمكن حذف تصنيف يحمل مقالات.", 409)
    );

    userEvent.click(await screen.findByTitle("messages.delete"));

    // The screen asks before it deletes; answer it.
    userEvent.click(await screen.findByText("cms.blog.actions.delete"));

    // The three delete handlers never looked at the answer: they announced
    // success either way, so a refused delete left the record on screen under
    // a notice saying it was gone.
    await waitFor(() => expect(api.delete).toHaveBeenCalled());
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("لا يمكن حذف تصنيف يحمل مقالات.")
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  test("a delete that goes through is announced once", async () => {
    await renderScreen();
    await settled();
    openTab("categories");

    userEvent.click(await screen.findByTitle("messages.delete"));
    userEvent.click(await screen.findByText("cms.blog.actions.delete"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("cms.blog.success.category_deleted")
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  test("what the server refused reaches the field it refused", async () => {
    await renderScreen();
    await settled();
    openTab("categories");

    const arabic = await screen.findByPlaceholderText("cms.blog.fields.category_ar_placeholder");
    userEvent.type(arabic, "أحكام");

    api.post.mockRejectedValueOnce(
      rejection({ name_ar: ["هذا الاسم مستعمل."], name_en: ["الاسم الإنجليزي مطلوب."] })
    );

    userEvent.click(screen.getByRole("button", { name: /cms\.blog\.actions\.create_category/ }));

    expect(await screen.findByText("هذا الاسم مستعمل.")).toBeInTheDocument();
    expect(screen.getByText("الاسم الإنجليزي مطلوب.")).toBeInTheDocument();
    expect(screen.getByText("تعذر الحفظ")).toBeInTheDocument();
  });

  test("what the editor typed survives a refusal", async () => {
    await renderScreen();
    await settled();
    openTab("categories");

    const arabic = await screen.findByPlaceholderText("cms.blog.fields.category_ar_placeholder");
    userEvent.type(arabic, "أحكام");

    api.post.mockRejectedValueOnce(rejection({ name_ar: ["هذا الاسم مستعمل."] }));
    userEvent.click(screen.getByRole("button", { name: /cms\.blog\.actions\.create_category/ }));

    await screen.findByText("هذا الاسم مستعمل.");
    expect(arabic).toHaveValue("أحكام");
  });

  test("a failed load says so and offers the way back", async () => {
    await renderScreen({ listsFail: true });

    // The screen used to render its forms over three empty lists whatever the
    // server answered.
    expect(await screen.findByText("تعذر جلب البيانات")).toBeInTheDocument();
    expect(screen.getByText("تعذر جلب التصنيفات.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "أعد المحاولة" })).toBeInTheDocument();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  test("retrying after a failed load brings the screen back", async () => {
    await renderScreen({ listsFail: true });

    const retry = await screen.findByRole("button", { name: "أعد المحاولة" });
    serve();
    userEvent.click(retry);

    await waitFor(() => expect(screen.queryAllByRole("tab").length).toBeGreaterThan(0));
  });
});

describe("the blog store", () => {
  test("a refused write hands back the server's message and its fields", async () => {
    api.post.mockRejectedValueOnce(
      rejection({ name_ar: ["مستعمل."] }, "تعذر الحفظ")
    );

    const result = await useBlogStore.getState().createCategory(new FormData());

    // The store held the answer and handed it over raw, so the screen had
    // nowhere to put it and dropped the lot.
    expect(result.success).toBe(false);
    expect(result.message).toBe("تعذر الحفظ");
    expect(result.fields).toEqual({ name_ar: "مستعمل." });
  });

  test("a cancelled request is not reported as a refusal", async () => {
    api.get.mockRejectedValueOnce({ code: "ERR_CANCELED", name: "CanceledError" });

    const result = await useBlogStore.getState().fetchCategories();

    expect(result.success).toBe(false);
    expect(result.canceled).toBe(true);
  });

  test("a refused load is reported rather than thrown into nothing", async () => {
    api.get.mockRejectedValueOnce({
      response: { status: 500, data: { detail: "تعذر جلب التصنيفات." } },
    });

    // The three fetchers had no catch at all.
    const result = await useBlogStore.getState().fetchCategories();

    expect(result.success).toBe(false);
    expect(result.message).toBe("تعذر جلب التصنيفات.");
  });

  test("a refused delete reports the refusal", async () => {
    api.delete.mockRejectedValueOnce(
      rejection(null, "لا يمكن حذف تصنيف يحمل مقالات.", 409)
    );

    const result = await useBlogStore.getState().deleteCategory(1);

    expect(result.success).toBe(false);
    expect(result.message).toBe("لا يمكن حذف تصنيف يحمل مقالات.");
  });
});
