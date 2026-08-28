import {
  clampPage,
  fold,
  filterRows,
  matches,
  pageCount,
  pageSlice,
  pageWindow,
  runQuery,
  searchRows,
  sortRows,
} from "./listQuery";

const ROWS = [
  { id: 3, name: "سطام الحازمي", email: "s@example.test", role: "super_admin", active: true },
  { id: 12, name: "أحمد", email: "a@example.test", role: "editor", active: false },
  { id: 7, name: "بدر", email: "b@example.test", role: "admin", active: true },
];

describe("how a search reads Arabic", () => {
  test("a word found without its hamza is the same word", () => {
    expect(fold("أحمد")).toBe(fold("احمد"));
    expect(fold("إبراهيم")).toBe(fold("ابراهيم"));
  });

  test("ة and ه, ى and ي, are one letter to a search", () => {
    expect(fold("مكتبة")).toBe(fold("مكتبه"));
    expect(fold("مصطفى")).toBe(fold("مصطفي"));
  });

  test("the harakat a reader may or may not type do not decide the answer", () => {
    expect(fold("مُحَمَّد")).toBe(fold("محمد"));
  });

  test("Arabic-Indic digits find Latin ones", () => {
    expect(fold("١٢")).toBe("12");
  });

  test("a row is found by any of the searched fields", () => {
    expect(matches(ROWS[0], "احمد", ["name", "email"])).toBe(false);
    expect(matches(ROWS[1], "احمد", ["name", "email"])).toBe(true);
    expect(matches(ROWS[1], "12", ["name", "email", "id"])).toBe(true);
  });

  test("two words match in either order and across two fields", () => {
    expect(matches(ROWS[0], "سطام example", ["name", "email"])).toBe(true);
    expect(matches(ROWS[0], "example سطام", ["name", "email"])).toBe(true);
  });

  test("an empty term narrows nothing", () => {
    expect(searchRows(ROWS, "   ", ["name"])).toHaveLength(3);
  });
});

describe("what narrows a list", () => {
  const tests = {
    role: (row, value) => row.role === value,
    state: (row, value) => (value === "active" ? row.active : !row.active),
  };

  test("a filter set to all is not a filter", () => {
    expect(filterRows(ROWS, { role: "all", state: "" }, tests)).toHaveLength(3);
  });

  test("two filters both hold", () => {
    expect(filterRows(ROWS, { role: "admin", state: "active" }, tests)).toEqual([ROWS[2]]);
  });

  test("a filter nobody defined is ignored rather than emptying the list", () => {
    expect(filterRows(ROWS, { colour: "green" }, tests)).toHaveLength(3);
  });
});

describe("ordering", () => {
  test("numbers order as numbers, not as text", () => {
    expect(sortRows(ROWS, "id", "asc").map((r) => r.id)).toEqual([3, 7, 12]);
    expect(sortRows(ROWS, "id", "desc").map((r) => r.id)).toEqual([12, 7, 3]);
  });

  test("Arabic orders by the collator, not by code point", () => {
    const names = sortRows(ROWS, "name", "asc").map((r) => r.name);
    expect(names).toEqual(["أحمد", "بدر", "سطام الحازمي"]);
  });

  test("a column sorts on what its cell means, not on what it prints", () => {
    const ranks = { super_admin: 4, admin: 3, editor: 2 };
    const order = sortRows(ROWS, "role", "desc", { role: (r) => ranks[r.role] });
    expect(order.map((r) => r.role)).toEqual(["super_admin", "admin", "editor"]);
  });

  test("sorting leaves the caller's array alone", () => {
    const before = [...ROWS];
    sortRows(ROWS, "id", "desc");
    expect(ROWS).toEqual(before);
  });

  test("an empty cell sinks rather than leading the list", () => {
    const rows = [{ v: "ب" }, { v: "" }, { v: "ا" }];
    expect(sortRows(rows, "v", "asc").map((r) => r.v)).toEqual(["ا", "ب", ""]);
  });
});

describe("paging", () => {
  test("a list that fits is still one page", () => {
    expect(pageCount(0, 10)).toBe(1);
    expect(pageCount(10, 10)).toBe(1);
    expect(pageCount(11, 10)).toBe(2);
  });

  test("a page past the end lands on the last one", () => {
    expect(clampPage(9, 12, 10)).toBe(2);
    expect(clampPage(0, 12, 10)).toBe(1);
    expect(clampPage("x", 12, 10)).toBe(1);
  });

  test("the slice follows the clamped page, so an emptied page is not blank", () => {
    const rows = Array.from({ length: 12 }, (_, i) => i);
    expect(pageSlice(rows, 2, 10)).toEqual([10, 11]);
    expect(pageSlice(rows, 9, 10)).toEqual([10, 11]);
  });

  test("a short run of pages is offered whole", () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test("a long run keeps the ends and the neighbourhood, and marks the break", () => {
    expect(pageWindow(9, 20)).toEqual([1, "gap", 8, 9, 10, "gap", 20]);
  });
});

describe("the pipeline", () => {
  test("narrow, then order, then cut — in that order", () => {
    const out = runQuery(ROWS, {
      term: "example",
      fields: ["email"],
      filters: { state: "active" },
      definitions: { state: (row, value) => (value === "active" ? row.active : !row.active) },
      sort: "id",
      direction: "desc",
      page: 1,
      size: 1,
    });

    expect(out.total).toBe(2);
    expect(out.pages).toBe(2);
    expect(out.rows.map((r) => r.id)).toEqual([7]);
    expect(out.all.map((r) => r.id)).toEqual([7, 3]);
  });

  test("a list with nothing in it does not throw", () => {
    const out = runQuery(undefined, { term: "x", fields: ["name"], page: 1, size: 10 });
    expect(out).toMatchObject({ total: 0, page: 1, pages: 1, rows: [] });
  });
});
