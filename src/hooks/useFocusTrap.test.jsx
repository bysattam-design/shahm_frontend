import React, { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import useFocusTrap from "./useFocusTrap";

/**
 * A page with something behind the dialog, so the escape route the panel
 * actually had is present to be closed.
 */
function Harness({ escapable = true }) {
  const [open, setOpen] = useState(false);
  const dialog = useFocusTrap({
    active: open,
    onEscape: escapable ? () => setOpen(false) : undefined,
  });

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        افتح
      </button>
      <button type="button">خلف النافذة</button>
      <a href="/somewhere">رابط خلفها</a>

      {open && (
        <div ref={dialog} role="dialog" aria-label="نافذة">
          <button type="button">الأول</button>
          <input aria-label="حقل" />
          <button type="button" onClick={() => setOpen(false)}>
            الأخير
          </button>
        </div>
      )}
    </div>
  );
}

function openIt() {
  userEvent.click(screen.getByText("افتح"));
  return screen.findByRole("dialog");
}

describe("the keyboard inside a dialog", () => {
  test("moves into the dialog when it opens", async () => {
    render(<Harness />);
    await openIt();

    // It used to stay on the button behind, so a reader working by keyboard
    // had to hunt for what had just appeared.
    await waitFor(() => expect(screen.getByText("الأول")).toHaveFocus());
  });

  test("wraps at the end instead of leaving", async () => {
    render(<Harness />);
    await openIt();
    await waitFor(() => expect(screen.getByText("الأول")).toHaveFocus());

    screen.getByText("الأخير").focus();
    userEvent.tab();

    // The panel's own modal put 7 controls on screen and left 38 behind it
    // still reachable: Tab walked out into a sidebar under the backdrop.
    await waitFor(() => expect(screen.getByText("الأول")).toHaveFocus());
  });

  test("wraps backwards at the start", async () => {
    render(<Harness />);
    await openIt();
    await waitFor(() => expect(screen.getByText("الأول")).toHaveFocus());

    userEvent.tab({ shift: true });

    await waitFor(() => expect(screen.getByText("الأخير")).toHaveFocus());
  });

  test("pulls the keyboard back in if it has slipped out", async () => {
    render(<Harness />);
    await openIt();
    await waitFor(() => expect(screen.getByText("الأول")).toHaveFocus());

    // A click on the page behind can put it there.
    screen.getByText("خلف النافذة").focus();
    userEvent.tab();

    await waitFor(() => expect(screen.getByText("الأول")).toHaveFocus());
  });

  test("gives the keyboard back to what opened it", async () => {
    render(<Harness />);
    const opener = screen.getByText("افتح");
    await openIt();
    await waitFor(() => expect(screen.getByText("الأول")).toHaveFocus());

    userEvent.click(screen.getByText("الأخير"));

    // Closing used to leave the keyboard on the body, so the next Tab started
    // again from the top of the page.
    await waitFor(() => expect(opener).toHaveFocus());
  });

  test("Escape closes a dialog that may be dismissed", async () => {
    render(<Harness />);
    await openIt();

    userEvent.type(document.body, "{esc}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  test("Escape does not close a dialog that must be answered", async () => {
    render(<Harness escapable={false} />);
    await openIt();

    userEvent.type(document.body, "{esc}");

    // The welcome dialog blocks Escape on purpose: a language has to be
    // chosen before the site can be read.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
