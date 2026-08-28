import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Avatar,
  AvatarStack,
  Badge,
  BulkBar,
  Button,
  Checkbox,
  EmptyState,
  FilterChips,
  ListToolbar,
  Pager,
  THead,
  TH,
  TR,
  Table,
} from "./index";

describe("Button", () => {
  test("a working button says so and refuses a second press", () => {
    const onClick = jest.fn();
    render(<Button loading onClick={onClick}>حفظ</Button>);

    const button = screen.getByRole("button", { name: /حفظ/ });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("a quiet button is still a button", () => {
    const onClick = jest.fn();
    render(<Button intent="quiet" onClick={onClick}>الغاء</Button>);

    userEvent.click(screen.getByRole("button", { name: "الغاء" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Badge", () => {
  test("the state is readable as a word, not only as a colour", () => {
    render(<Badge tone="success" dot>نشط</Badge>);

    expect(screen.getByText("نشط")).toBeInTheDocument();
  });
});

describe("Avatar", () => {
  test("a person with no picture is their first letter", () => {
    render(<Avatar name="سطام" email="s@example.test" />);

    expect(screen.getByText("س")).toBeInTheDocument();
  });

  test("beyond the limit the rest become a count, not a longer row", () => {
    render(
      <AvatarStack
        max={2}
        people={[
          { id: 1, name: "أحمد" },
          { id: 2, name: "بدر" },
          { id: 3, name: "خالد" },
          { id: 4, name: "سعد" },
        ]}
      />
    );

    expect(screen.getByText("أ")).toBeInTheDocument();
    expect(screen.getByText("ب")).toBeInTheDocument();
    expect(screen.queryByText("خ")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});

describe("Checkbox", () => {
  test("it is the real control underneath, so the keyboard reaches it", () => {
    const onChange = jest.fn();
    render(<Checkbox id="pick" label="اختر" checked={false} onChange={onChange} />);

    const input = screen.getByRole("checkbox", { name: "اختر" });

    userEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  test("a disabled box does not change", () => {
    const onChange = jest.fn();
    render(<Checkbox id="pick" label="اختر" checked={false} disabled onChange={onChange} />);

    userEvent.click(screen.getByRole("checkbox", { name: "اختر" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("EmptyState", () => {
  test("it says what is missing and offers the thing that fixes it", () => {
    render(
      <EmptyState
        title="لا مستخدمين"
        hint="اضف اول مستخدم للبدء"
        action={<Button size="sm">اضافة</Button>}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("لا مستخدمين");
    expect(screen.getByText("اضف اول مستخدم للبدء")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "اضافة" })).toBeInTheDocument();
  });
});

/* ── the list layer ─────────────────────────────────────────── */

describe("ListToolbar", () => {
  test("the field says which columns it looks in", () => {
    render(
      <ListToolbar
        value=""
        labels={{ search: "بحث", searchIn: "يبحث في: الاسم والبريد" }}
      />
    );

    // A search that silently covers two of seven columns reads, to a reader
    // whose row does not come back, as a record that is missing.
    const field = screen.getByRole("textbox", { name: "بحث" });
    expect(screen.getByText("يبحث في: الاسم والبريد")).toBeInTheDocument();
    expect(field).toHaveAccessibleDescription("يبحث في: الاسم والبريد");
  });

  test("there is nothing to clear until something is typed", () => {
    const onClear = jest.fn();
    const { rerender } = render(
      <ListToolbar value="" onClear={onClear} labels={{ search: "بحث", clear: "امسح" }} />
    );

    expect(screen.queryByRole("button", { name: "امسح" })).toBeNull();

    rerender(
      <ListToolbar value="بدر" onClear={onClear} labels={{ search: "بحث", clear: "امسح" }} />
    );

    userEvent.click(screen.getByRole("button", { name: "امسح" }));
    expect(onClear).toHaveBeenCalled();
  });

  test("Escape in the field clears the search", () => {
    const onClear = jest.fn();
    render(<ListToolbar value="بدر" onClear={onClear} labels={{ search: "بحث" }} />);

    fireEvent.keyDown(screen.getByRole("textbox", { name: "بحث" }), { key: "Escape" });
    expect(onClear).toHaveBeenCalled();
  });
});

describe("FilterChips", () => {
  test("each constraint comes off on its own", () => {
    const removeRole = jest.fn();
    render(
      <FilterChips
        labels={{ remove: "ارفع", clearAll: "ارفع الكل" }}
        chips={[
          { key: "role", label: "الدور: مدير", onRemove: removeRole },
          { key: "state", label: "الحالة: مفعل", onRemove: jest.fn() },
        ]}
      />
    );

    expect(screen.getByText("الدور: مدير")).toBeInTheDocument();
    userEvent.click(screen.getAllByRole("button", { name: "ارفع" })[0]);
    expect(removeRole).toHaveBeenCalledTimes(1);
  });

  test("one constraint needs no «clear everything»", () => {
    render(
      <FilterChips
        labels={{ clearAll: "ارفع الكل" }}
        onClearAll={jest.fn()}
        chips={[{ key: "role", label: "الدور: مدير", onRemove: jest.fn() }]}
      />
    );

    expect(screen.queryByText("ارفع الكل")).toBeNull();
  });

  test("no constraint, no row", () => {
    const { container } = render(<FilterChips chips={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("BulkBar", () => {
  test("it is not there until rows are", () => {
    const { container } = render(<BulkBar count={0} labels={{ count: "المحدد: 0" }} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("it says how many rows are in force, and offers the wider selection", () => {
    const selectAll = jest.fn();
    render(
      <BulkBar
        count={3}
        canSelectAllMatching
        onSelectAllMatching={selectAll}
        onClear={jest.fn()}
        labels={{
          count: "المحدد: 3",
          selectAllMatching: "حدد كل النتائج المطابقة (42)",
          clear: "افك التحديد",
        }}
      />
    );

    expect(screen.getByText("المحدد: 3")).toBeInTheDocument();
    userEvent.click(screen.getByText("حدد كل النتائج المطابقة (42)"));
    expect(selectAll).toHaveBeenCalled();
  });

  test("once everything matching is chosen, it is not offered again", () => {
    render(
      <BulkBar
        count={42}
        scope="matching"
        canSelectAllMatching
        onSelectAllMatching={jest.fn()}
        onClear={jest.fn()}
        labels={{ count: "المحدد: كل المطابق (42)", selectAllMatching: "حدد الكل", clear: "افك" }}
      />
    );

    expect(screen.queryByText("حدد الكل")).toBeNull();
  });
});

describe("Pager", () => {
  const labels = {
    range: "1–10 من 42",
    previous: "السابقة",
    next: "التالية",
    pageLabel: (page) => `الصفحة ${page}`,
  };

  test("an empty list has no pager at all", () => {
    const { container } = render(<Pager total={0} labels={labels} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("a list that fits on one page still says how many rows there are", () => {
    render(<Pager page={1} pages={1} total={6} labels={{ ...labels, range: "1–6 من 6" }} />);

    expect(screen.getByText("1–6 من 6")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "السابقة" })).toBeNull();
  });

  test("the page in force is named as such, and there is no way back from the first", () => {
    render(<Pager page={1} pages={5} total={42} labels={labels} />);

    expect(screen.getByRole("button", { name: "الصفحة 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "السابقة" })).toBeDisabled();
  });

  test("a page is asked for once, and never for the page already shown", () => {
    const onPage = jest.fn();
    render(<Pager page={2} pages={5} total={42} onPage={onPage} labels={labels} />);

    userEvent.click(screen.getByRole("button", { name: "الصفحة 3" }));
    userEvent.click(screen.getByRole("button", { name: "الصفحة 2" }));

    expect(onPage).toHaveBeenCalledTimes(1);
    expect(onPage).toHaveBeenCalledWith(3);
  });
});

describe("a column that orders the list", () => {
  function head(props) {
    return render(
      <Table>
        <THead>
          <TR>
            <TH sortable label="افرز بالدور" {...props}>الدور</TH>
          </TR>
        </THead>
      </Table>
    );
  }

  test("the order in force is carried where a reader who cannot see it will find it", () => {
    const { rerender } = head({ sorted: null });
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "none");

    rerender(
      <Table>
        <THead>
          <TR>
            <TH sortable sorted="desc" label="افرز بالدور">الدور</TH>
          </TR>
        </THead>
      </Table>
    );

    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "descending");
  });

  test("the head is a button, so the keyboard reaches it", () => {
    const onSort = jest.fn();
    head({ onSort });

    userEvent.click(screen.getByRole("button", { name: "افرز بالدور" }));
    expect(onSort).toHaveBeenCalled();
  });
});

describe("a checkbox that has to say three things", () => {
  test("part of a page chosen is neither none nor all", () => {
    render(<Checkbox indeterminate onChange={jest.fn()} ariaLabel="حدد الصفحة" />);

    expect(screen.getByRole("checkbox", { name: "حدد الصفحة" }).indeterminate).toBe(true);
  });

  test("a box with no visible text is still named", () => {
    render(<Checkbox onChange={jest.fn()} ariaLabel="حدد هذا الصف" />);

    expect(screen.getByRole("checkbox", { name: "حدد هذا الصف" })).toBeInTheDocument();
  });
});
