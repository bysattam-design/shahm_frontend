import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Avatar, AvatarStack, Badge, Button, Checkbox, EmptyState } from "./index";

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
