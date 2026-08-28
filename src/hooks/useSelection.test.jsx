import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import useSelection from "./useSelection";

const PAGE = ["1", "2", "3"];
const MATCHING = ["1", "2", "3", "4", "5"];

function Probe({ pageIds = PAGE, matchingIds = MATCHING, resetKey = "" }) {
  const selection = useSelection({ pageIds, matchingIds, resetKey });

  return (
    <div>
      <button onClick={() => selection.toggle("2")}>row-2</button>
      <button onClick={selection.togglePage}>page</button>
      <button onClick={selection.selectAllMatching}>all</button>
      <button onClick={selection.clear}>clear</button>

      <p data-testid="count">{String(selection.count)}</p>
      <p data-testid="scope">{selection.scope}</p>
      <p data-testid="page-state">{selection.pageState}</p>
      <p data-testid="offer-all">{String(selection.canSelectAllMatching)}</p>
      <p data-testid="ids">{selection.selectedIds.join(",")}</p>
    </div>
  );
}

const read = (id) => screen.getByTestId(id).textContent;

describe("the rows a bulk action will reach", () => {
  test("nothing is chosen until something is chosen", () => {
    render(<Probe />);

    expect(read("count")).toBe("0");
    expect(read("page-state")).toBe("none");
  });

  test("one row, then the whole page, then the page again empties it", () => {
    render(<Probe />);

    userEvent.click(screen.getByText("row-2"));
    expect(read("count")).toBe("1");
    expect(read("page-state")).toBe("some");

    userEvent.click(screen.getByText("page"));
    expect(read("count")).toBe("3");
    expect(read("page-state")).toBe("all");

    userEvent.click(screen.getByText("page"));
    expect(read("count")).toBe("0");
  });

  test("everything matching is a different count from everything on the page", () => {
    render(<Probe />);

    userEvent.click(screen.getByText("all"));

    expect(read("scope")).toBe("matching");
    expect(read("count")).toBe("5");
    expect(read("ids")).toBe("1,2,3,4,5");
  });

  test("the wider selection is only offered when it is wider", () => {
    render(<Probe />);
    expect(read("offer-all")).toBe("true");

    render(<Probe matchingIds={PAGE} />);
    expect(screen.getAllByTestId("offer-all")[1].textContent).toBe("false");
  });

  test("changing the narrowing lets the selection go", () => {
    const { rerender } = render(<Probe resetKey="role=all" />);

    userEvent.click(screen.getByText("page"));
    expect(read("count")).toBe("3");

    // A row that no longer matches the filter is a row the reader can no longer
    // see, and a bulk action must not reach it.
    rerender(<Probe resetKey="role=admin" />);

    expect(read("count")).toBe("0");
    expect(read("scope")).toBe("some");
  });

  test("a first render does not throw the selection away", () => {
    render(<Probe resetKey="steady" />);

    userEvent.click(screen.getByText("row-2"));
    expect(read("count")).toBe("1");
  });
});
