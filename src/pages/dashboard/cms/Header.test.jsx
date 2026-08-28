import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import api from "../../../api/axiosClient";
import HeaderCms from "./Header";

const ITEMS = [
  {
    id: 31, type: "link", label_ar: "من نحن", label_en: "About",
    url: "/about", slug: "about", page: null, parent: null,
    order: 0, is_active: true, description_ar: "", description_en: "",
  },
  { id: 32, type: "logo", logo_variant: "full_ar", logo: "/media/l.png", order: 0, is_active: true },
  {
    id: 33, type: "menu_image", label_ar: "صورة", label_en: "Image",
    image: "/media/m.png", url: "/x", page: null, order: 0, is_active: true,
  },
  {
    id: 34, type: "quick_access", label_ar: "وصول", label_en: "Quick",
    url: "/q", page: null, order: 0, is_active: true,
  },
];

/** A refusal shaped the way the backend shapes one. */
function rejection(fields, message = "تعذر الحفظ", status = 400) {
  return { response: { status, data: { success: false, message, errors: fields } } };
}

function serve({ loadFails = false } = {}) {
  api.get.mockImplementation((url) => {
    if (loadFails) {
      return Promise.reject({
        response: { status: 500, data: { detail: "تعذر جلب عناصر الترويسة." } },
      });
    }
    if (String(url).includes("header")) return Promise.resolve({ data: ITEMS });
    return Promise.resolve({ data: [] });
  });
  api.post.mockResolvedValue({ data: {} });
  api.patch.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
}

async function renderScreen(options) {
  serve(options);
  render(<HeaderCms />);
}

/** Waits until the first load has put the menu form on the screen. */
async function settled() {
  await screen.findByPlaceholderText("cms.header.placeholder_label_ar");
}

/** Fills the menu form and submits it. */
function addMenuItem() {
  userEvent.type(screen.getByPlaceholderText("cms.header.placeholder_label_ar"), "الخدمات");
  userEvent.type(screen.getByPlaceholderText("cms.header.placeholder_label_en"), "Services");
  userEvent.click(screen.getAllByRole("button", { name: /cms\.header\.(add|save|create)/ })[0]);
}

describe("the header screen", () => {
  test("what the server refused reaches the field it refused", async () => {
    await renderScreen();
    await settled();

    api.post.mockRejectedValueOnce(
      rejection({
        label_ar: ["هذا العنوان مستعمل."],
        url: ["الرابط غير صالح."],
      })
    );

    addMenuItem();

    // Twelve catch sites answered a refusal with «فشل الحفظ» and dropped both
    // the server's message and the name of the field it named.
    expect(await screen.findByText("هذا العنوان مستعمل.")).toBeInTheDocument();
    expect(screen.getByText("الرابط غير صالح.")).toBeInTheDocument();
    expect(screen.getByText("تعذر الحفظ")).toBeInTheDocument();
  });

  test("what the editor typed survives a refusal", async () => {
    await renderScreen();
    await settled();

    api.post.mockRejectedValueOnce(rejection({ url: ["الرابط غير صالح."] }));
    addMenuItem();

    await screen.findByText("الرابط غير صالح.");
    expect(screen.getByPlaceholderText("cms.header.placeholder_label_ar")).toHaveValue("الخدمات");
  });

  test("correcting a field clears the complaint about it", async () => {
    await renderScreen();
    await settled();

    api.post.mockRejectedValueOnce(rejection({ label_ar: ["هذا العنوان مستعمل."] }));
    addMenuItem();

    await screen.findByText("هذا العنوان مستعمل.");

    api.post.mockResolvedValueOnce({ data: {} });
    userEvent.click(screen.getAllByRole("button", { name: /cms\.header\.(add|save|create)/ })[0]);

    await waitFor(() =>
      expect(screen.queryByText("هذا العنوان مستعمل.")).not.toBeInTheDocument()
    );
  });

  test("a refusal with only a message still shows that message", async () => {
    await renderScreen();
    await settled();

    api.post.mockRejectedValueOnce({
      response: { status: 403, data: { detail: "لا تملك صلاحية تعديل الترويسة." } },
    });

    addMenuItem();

    expect(await screen.findByText("لا تملك صلاحية تعديل الترويسة.")).toBeInTheDocument();
  });

  test("a failed load says so and offers the way back", async () => {
    await renderScreen({ loadFails: true });

    // The failure used to go to the console and nowhere else.
    expect(await screen.findByText("تعذر جلب البيانات")).toBeInTheDocument();
    expect(screen.getByText("تعذر جلب عناصر الترويسة.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "أعد المحاولة" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("cms.header.placeholder_label_ar")).not.toBeInTheDocument();
  });

  test("retrying after a failed load brings the screen back", async () => {
    await renderScreen({ loadFails: true });

    const retry = await screen.findByRole("button", { name: "أعد المحاولة" });
    serve();
    userEvent.click(retry);

    await settled();
  });
});
