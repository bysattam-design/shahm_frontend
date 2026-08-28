import React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import * as authApi from "../../../api/authApi";
import { useUsersStore } from "../../../store/useUsersStore";
import Users from "./Users";

jest.mock("../../../api/authApi");

/**
 * This screen is read in Arabic, so it is tested in Arabic: the wording comes
 * from the file the panel actually ships, and a key that does not exist there
 * surfaces as a bare key in an assertion rather than passing quietly.
 */
jest.mock("react-i18next", () => {
  const wording = require("../../../../public/translation/ar.json");

  const read = (key) =>
    String(key)
      .split(".")
      .reduce((node, part) => (node && typeof node === "object" ? node[part] : undefined), wording);

  return {
    useTranslation: () => ({
      t: (key, second) => {
        const found = read(key);
        const template =
          typeof found === "string" ? found : typeof second === "string" ? second : key;

        if (second && typeof second === "object") {
          return Object.entries(second).reduce(
            (text, [name, value]) =>
              text.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), String(value)),
            template
          );
        }

        return template;
      },
      i18n: { language: "ar", changeLanguage: jest.fn() },
    }),
  };
});

const ROLES = ["super_admin", "admin", "editor", "viewer"];

/** Fourteen accounts, so a page of ten leaves a second page to reach. */
const PEOPLE = Array.from({ length: 14 }, (_, index) => ({
  id: index + 1,
  name: `عضو ${index + 1}`,
  email: `member${index + 1}@example.test`,
  role: ROLES[index % 4],
  is_active: index % 3 !== 0,
}));

function serve(rows = PEOPLE) {
  authApi.getUsers.mockResolvedValue({ data: rows });
  authApi.deleteUser.mockResolvedValue({ data: {} });
}

function mount(entry = "/dashboard/users") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Users />
    </MemoryRouter>
  );
}

async function settled() {
  await screen.findByText("member1@example.test");
}

const rowsShown = () => screen.getAllByRole("row").length - 1; // the head is a row too
const search = () => screen.getByRole("textbox", { name: "البحث" });
const head = (index) => screen.getAllByRole("columnheader")[index];

beforeEach(() => {
  jest.clearAllMocks();
  useUsersStore.setState({ users: [], loading: false, error: null });
  serve();
});

describe("the users list", () => {
  test("the wait keeps the shape of what is coming", async () => {
    let release;
    authApi.getUsers.mockReturnValue(new Promise((resolve) => { release = resolve; }));

    mount();

    // Six rows of the right width under a real head, not a spinner in an empty
    // card, so nothing jumps when the data lands. The bars are hidden from the
    // screen reader — they are only reachable with `hidden` — and it is told
    // in words instead.
    expect(screen.getByRole("status")).toHaveTextContent("جار التحميل");
    expect(screen.getAllByRole("row", { hidden: true })).toHaveLength(7);
    expect(rowsShown()).toBe(0);

    release({ data: PEOPLE });
    await settled();
  });

  test("a failure says so and offers the way out of it", async () => {
    authApi.getUsers.mockRejectedValue({
      response: { status: 500, data: { detail: "تعذر الاتصال بقاعدة البيانات." } },
    });

    mount();

    // Three screens swallowed the server's own words and showed nothing.
    expect(await screen.findByText("تعذر جلب المستخدمين")).toBeInTheDocument();
    expect(screen.getByText("تعذر الاتصال بقاعدة البيانات.")).toBeInTheDocument();

    authApi.getUsers.mockResolvedValue({ data: PEOPLE });
    userEvent.click(screen.getByRole("button", { name: "أعد المحاولة" }));

    await settled();
  });

  test("an empty list is not offered a search box", async () => {
    serve([]);
    mount();

    // There is nothing to search, and a search box over an empty table reads
    // as a search that found nothing.
    expect(await screen.findByText(/لا مستخدم بعد/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "البحث" })).toBeNull();
  });

  test("the field says which columns it looks in", async () => {
    mount();
    await settled();

    expect(search()).toHaveAccessibleDescription("يبحث في: الاسم والبريد والمعرف");
  });

  test("a search narrows the list, and says so in a chip that lifts it", async () => {
    jest.useFakeTimers();
    mount();

    await waitFor(() => expect(useUsersStore.getState().users).toHaveLength(14));

    userEvent.type(search(), "member12");
    act(() => { jest.advanceTimersByTime(300); });

    await waitFor(() => expect(rowsShown()).toBe(1));
    expect(screen.getByText("member12@example.test")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: "ارفع هذا القيد" }));
    act(() => { jest.advanceTimersByTime(300); });

    await waitFor(() => expect(rowsShown()).toBe(10));
    jest.useRealTimers();
  });

  test("a filter is read from the address bar on arrival", async () => {
    mount("/dashboard/users?role=admin");
    await screen.findByText("member2@example.test");

    // Four of the fourteen are admins, and they all fit on one page.
    expect(rowsShown()).toBe(4);
    expect(screen.getByText("الدور: مدير")).toBeInTheDocument();
  });

  test("a filter that matches nothing says so, and lifts", async () => {
    serve(PEOPLE.filter((person) => person.role !== "admin"));
    mount("/dashboard/users?role=admin");

    expect(await screen.findByText("لا مستخدم يطابق ما رشحت")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: "ارفع الترشيح كله" }));

    await waitFor(() => expect(rowsShown()).toBe(10));
  });

  test("a column orders the list, and the order is carried in the head", async () => {
    mount();
    await settled();

    // The list arrives in its natural order, and the head says which order
    // that is — a reader who cannot see the arrow has only this to go on.
    expect(head(1)).toHaveAttribute("aria-sort", "ascending");
    expect(head(3)).toHaveAttribute("aria-sort", "none");

    userEvent.click(screen.getByRole("button", { name: "افرز بحسب المعرف" }));

    await waitFor(() => expect(head(1)).toHaveAttribute("aria-sort", "descending"));
    expect(within(screen.getAllByRole("row")[1]).getByText("#14")).toBeInTheDocument();

    // Ordering by another column releases the first.
    userEvent.click(screen.getByRole("button", { name: "افرز بحسب الدور" }));

    await waitFor(() => expect(head(3)).toHaveAttribute("aria-sort", "ascending"));
    expect(head(1)).toHaveAttribute("aria-sort", "none");
  });

  test("a third press on a column returns the list to its natural order", async () => {
    mount();
    await settled();

    const byRole = () => screen.getByRole("button", { name: "افرز بحسب الدور" });

    userEvent.click(byRole());
    await waitFor(() => expect(head(3)).toHaveAttribute("aria-sort", "ascending"));

    userEvent.click(byRole());
    await waitFor(() => expect(head(3)).toHaveAttribute("aria-sort", "descending"));

    // The reader can undo a sort without having to know which column the list
    // was in to begin with.
    userEvent.click(byRole());
    await waitFor(() => expect(head(3)).toHaveAttribute("aria-sort", "none"));
    expect(head(1)).toHaveAttribute("aria-sort", "ascending");
  });

  test("the roles order by rank, not by the alphabet of their names", async () => {
    mount();
    await settled();

    userEvent.click(screen.getByRole("button", { name: "افرز بحسب الدور" }));

    // The badge prints a word; the column sorts on what the word means.
    await waitFor(() =>
      expect(within(screen.getAllByRole("row")[1]).getByText("مشاهد")).toBeInTheDocument()
    );
  });

  test("there is one pager, and it reaches the rest of the rows", async () => {
    mount();
    await settled();

    expect(screen.getAllByLabelText("صفحات القائمة")).toHaveLength(1);
    expect(screen.getByText("1–10 من 14")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: "الصفحة 2" }));

    await waitFor(() => expect(rowsShown()).toBe(4));
    expect(screen.getByText("11–14 من 14")).toBeInTheDocument();
  });

  test("the page is chosen as a page, and everything matching is a separate act", async () => {
    mount();
    await settled();

    userEvent.click(screen.getByRole("checkbox", { name: "حدد صفوف هذه الصفحة" }));
    expect(await screen.findByText("المحدد: 10")).toBeInTheDocument();

    // Ten rows on this page and fourteen matching the filter are not the same
    // selection, and the bar says which one is in force.
    userEvent.click(screen.getByRole("button", { name: "حدد كل النتائج المطابقة (14)" }));
    expect(await screen.findByText("المحدد: كل المطابق (14)")).toBeInTheDocument();
  });

  test("the selection is dropped when the narrowing changes", async () => {
    mount();
    await settled();

    userEvent.click(screen.getByRole("checkbox", { name: "حدد صفوف هذه الصفحة" }));
    await screen.findByText("المحدد: 10");

    userEvent.selectOptions(screen.getAllByRole("combobox")[0], "admin");

    // A row that no longer matches is a row the reader can no longer see.
    await waitFor(() => expect(screen.queryByText(/^المحدد/)).toBeNull());
  });

  test("a deleted row reports that it was deleted", async () => {
    mount();
    await settled();

    // `removeUser` returned nothing while the screen tested its answer, so
    // every successful delete reported itself as a failure.
    await waitFor(async () => {
      expect(await useUsersStore.getState().removeUser(1)).toBe(true);
    });

    expect(authApi.deleteUser).toHaveBeenCalledWith(1);
  });
});
