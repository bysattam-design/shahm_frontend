import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import api from "../../../api/axiosClient";
import FooterCms from "./Footer";

const COLUMNS = [
  {
    id: 1,
    key: "company_links",
    title_ar: "روابط الشركة",
    title_en: "Company",
    order: 0,
    is_active: true,
    links: [
      {
        id: 11,
        label_ar: "من نحن",
        label_en: "About",
        url: "/about",
        resolved_url: "/about",
        order: 0,
        is_active: true,
        parent: null,
        children: [],
      },
    ],
  },
];

const FOOTER_SETTINGS = {
  newsletter_title_ar: "اشترك",
  newsletter_title_en: "Subscribe",
  copyright_ar: "جميع الحقوق محفوظة",
  copyright_en: "All rights reserved",
  logo_ar: null,
  logo_en: null,
  vat_logo: null,
};

// `t` answers with the key in tests, and the language is English, so a control
// is addressed by its key and a link by its English label.
const LINK_AR = "cms.footer.link_label_ar_placeholder";
const LINK_EN = "cms.footer.link_label_en_placeholder";
const COLUMN_KEY = "company_links";
const LINK_URL = "/about-us";
const LINK_ORDER = "cms.footer.order — About";

/** A rejected write, shaped the way the backend shapes one. */
function rejection(fields, message = "تعذر الحفظ") {
  return {
    response: { status: 400, data: { success: false, message, errors: fields } },
  };
}

// react-scripts runs with resetMocks, so the shared client is answered afresh
// inside every test.
function serve({ columnsFail = false } = {}) {
  api.get.mockImplementation((url) => {
    if (columnsFail && String(url).includes("columns")) {
      return Promise.reject({
        response: { status: 500, data: { detail: "تعذر جلب البيانات." } },
      });
    }
    if (String(url).includes("columns")) return Promise.resolve({ data: COLUMNS });
    if (String(url).includes("footer/settings")) return Promise.resolve({ data: FOOTER_SETTINGS });
    if (String(url).includes("footer/cta")) return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
  api.post.mockResolvedValue({ data: {} });
  api.patch.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
}

async function renderScreen(options) {
  serve(options);
  render(<FooterCms />);
}

/** Waits until the first load has put the columns tab on the screen. */
async function settled() {
  await screen.findByPlaceholderText(LINK_AR);
}

/** Fills the add-link form with a link's own three values. */
function fillLink() {
  userEvent.type(screen.getByPlaceholderText(LINK_AR), "الشروط");
  userEvent.type(screen.getByPlaceholderText(LINK_EN), "Terms");
  userEvent.type(screen.getByPlaceholderText(LINK_URL), "/terms");
}

function saveLink() {
  userEvent.click(screen.getByRole("button", { name: /save_link/i }));
}

beforeEach(() => {
  localStorage.clear();
});

describe("the footer screen", () => {
  test("the add-link form asks for nothing that belongs to another form", async () => {
    await renderScreen();
    await settled();

    // There used to be a «المفتاح» box in every add-link form as well as in the
    // add-column form, and all of them were bound to the same value: typing a
    // key while adding a link quietly rewrote the key of the column form.
    expect(screen.getAllByPlaceholderText(COLUMN_KEY)).toHaveLength(1);
  });

  test("a link is saved with only a link's own fields filled", async () => {
    await renderScreen();
    await settled();

    fillLink();
    saveLink();

    // The stray key box was marked required, so the browser refused to submit
    // this form until it was filled — a link could not be added at all.
    await waitFor(() => expect(api.post).toHaveBeenCalled());
  });

  test("what the server refused reaches the field it refused", async () => {
    await renderScreen();
    await settled();

    fillLink();
    api.post.mockRejectedValueOnce(
      rejection({ url: ["الرابط غير صالح."], label_ar: ["الاسم العربي مطلوب."] })
    );
    saveLink();

    // The server's own words, on the screen — not one vanishing «فشل الحفظ».
    expect(await screen.findByText("الرابط غير صالح.")).toBeInTheDocument();
    expect(screen.getByText("الاسم العربي مطلوب.")).toBeInTheDocument();
    expect(screen.getByText("تعذر الحفظ")).toBeInTheDocument();
  });

  test("what the editor typed survives a refusal", async () => {
    await renderScreen();
    await settled();

    fillLink();
    api.post.mockRejectedValueOnce(rejection({ url: ["الرابط غير صالح."] }));
    saveLink();

    await screen.findByText("الرابط غير صالح.");
    expect(screen.getByPlaceholderText(LINK_AR)).toHaveValue("الشروط");
    expect(screen.getByPlaceholderText(LINK_URL)).toHaveValue("/terms");
  });

  test("correcting a field clears the complaint about it", async () => {
    await renderScreen();
    await settled();

    fillLink();
    api.post.mockRejectedValueOnce(rejection({ url: ["الرابط غير صالح."] }));
    saveLink();

    await screen.findByText("الرابط غير صالح.");
    userEvent.type(screen.getByPlaceholderText(LINK_URL), "-and-conditions");

    await waitFor(() =>
      expect(screen.queryByText("الرابط غير صالح.")).not.toBeInTheDocument()
    );
  });

  test("the order box sends nothing until the editor is done with it", async () => {
    await renderScreen();
    await settled();

    const box = screen.getByLabelText(LINK_ORDER);
    api.patch.mockClear();

    box.focus();
    userEvent.type(box, "12");

    // Two characters used to be two writes, each followed by a full reload of
    // the screen that destroyed the very box the caret was sitting in.
    expect(api.patch).not.toHaveBeenCalled();
    expect(box).toHaveFocus();
    expect(box).toHaveValue(12);
  });

  test("the order reaches the server once, when the box is left", async () => {
    await renderScreen();
    await settled();

    const box = screen.getByLabelText(LINK_ORDER);
    api.patch.mockClear();

    box.focus();
    userEvent.type(box, "12");
    fireEvent.blur(box);

    await waitFor(() => expect(api.patch).toHaveBeenCalledTimes(1));
    expect(api.patch.mock.calls[0][1]).toEqual({ order: "012" });
  });

  test("every order box says whose order it is", async () => {
    await renderScreen();
    await settled();

    // A row of boxes all called «الترتيب» told a screen reader nothing.
    expect(screen.getByLabelText(LINK_ORDER)).toBeInTheDocument();
    expect(screen.getByLabelText("cms.footer.order — Company")).toBeInTheDocument();
  });

  test("a failed load says so and offers the way back", async () => {
    await renderScreen({ columnsFail: true });

    // The screen used to render its forms over an empty list, so an outage
    // looked exactly like a footer with nothing in it.
    expect(await screen.findByText("تعذر جلب البيانات")).toBeInTheDocument();
    expect(screen.getByText("تعذر جلب البيانات.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "أعد المحاولة" })).toBeInTheDocument();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  test("retrying after a failed load brings the screen back", async () => {
    await renderScreen({ columnsFail: true });

    const retry = await screen.findByRole("button", { name: "أعد المحاولة" });
    serve();
    userEvent.click(retry);

    await waitFor(() => expect(screen.getAllByRole("tab")).toHaveLength(3));
  });

  test("an interrupted edit is kept for the next visit", async () => {
    await renderScreen();
    await settled();

    userEvent.type(screen.getByPlaceholderText(COLUMN_KEY), "legal_links");

    // Nothing on this screen survived a reload before: a stray refresh took
    // the whole edit with it and the screen never said one was pending.
    await waitFor(
      () => expect(localStorage.getItem("shahm:draft:footer:column:new")).toBeTruthy(),
      { timeout: 3000 }
    );

    const stored = JSON.parse(localStorage.getItem("shahm:draft:footer:column:new"));
    expect(stored.values.key).toBe("legal_links");
  });

  test("a pending edit is said in words", async () => {
    await renderScreen();
    await settled();

    expect(screen.queryByText("تعديل غير محفوظ")).not.toBeInTheDocument();

    userEvent.type(screen.getByPlaceholderText(COLUMN_KEY), "legal_links");

    expect(await screen.findByText("تعديل غير محفوظ")).toBeInTheDocument();
  });
});
