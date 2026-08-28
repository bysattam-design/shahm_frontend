import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import useListState from "./useListState";

const FILTERS = { role: "all" };

function Probe({ namespace }) {
  const list = useListState({ namespace, filters: FILTERS, sort: "id", size: 10 });
  const location = useLocation();

  return (
    <div>
      <input
        aria-label="search"
        value={list.draft}
        onChange={(event) => list.setDraft(event.target.value)}
      />
      <button onClick={() => list.setFilter("role", "admin")}>filter</button>
      <button onClick={() => list.toggleSort("name")}>sort-name</button>
      <button onClick={() => list.setPage(4)}>page-4</button>
      <button onClick={list.reset}>reset</button>

      <p data-testid="url">{location.search}</p>
      <p data-testid="term">{list.term}</p>
      <p data-testid="page">{String(list.page)}</p>
      <p data-testid="sort">{`${list.sort}:${list.direction}`}</p>
      <p data-testid="narrowed">{String(list.isNarrowed)}</p>
    </div>
  );
}

function mount(entry = "/users", props = {}) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Probe {...props} />
    </MemoryRouter>
  );
}

const url = () => screen.getByTestId("url").textContent;

describe("a list holds its state in the address bar", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("what the URL carries is what the list shows", () => {
    mount("/users?q=%D8%A8%D8%AF%D8%B1&role=admin&page=3&sort=name&dir=desc");

    expect(screen.getByTestId("term")).toHaveTextContent("بدر");
    expect(screen.getByTestId("page")).toHaveTextContent("3");
    expect(screen.getByTestId("sort")).toHaveTextContent("name:desc");
    expect(screen.getByTestId("narrowed")).toHaveTextContent("true");
  });

  test("typing reaches the URL once, after the reader stops", () => {
    mount();

    userEvent.type(screen.getByLabelText("search"), "بدر");

    // Mid-flight the box has the letters and the address bar still has nothing:
    // three keystrokes are not three queries.
    expect(url()).toBe("");

    act(() => { jest.advanceTimersByTime(300); });

    expect(url()).toContain("q=");
    expect(screen.getByTestId("term")).toHaveTextContent("بدر");
  });

  test("a new search returns to the first page", () => {
    mount("/users?page=5");

    userEvent.type(screen.getByLabelText("search"), "x");
    act(() => { jest.advanceTimersByTime(300); });

    expect(screen.getByTestId("page")).toHaveTextContent("1");
    expect(url()).not.toContain("page=");
  });

  test("a filter returns to the first page too", () => {
    mount("/users?page=5");

    userEvent.click(screen.getByText("filter"));

    expect(url()).toContain("role=admin");
    expect(screen.getByTestId("page")).toHaveTextContent("1");
  });

  test("a value that is the default is not written into the URL", () => {
    mount();

    userEvent.click(screen.getByText("page-4"));
    expect(url()).toContain("page=4");

    userEvent.click(screen.getByText("reset"));
    expect(url()).toBe("");
  });

  test("a column sorts up, then down, then back to the natural order", () => {
    mount();

    userEvent.click(screen.getByText("sort-name"));
    expect(screen.getByTestId("sort")).toHaveTextContent("name:asc");

    userEvent.click(screen.getByText("sort-name"));
    expect(screen.getByTestId("sort")).toHaveTextContent("name:desc");

    userEvent.click(screen.getByText("sort-name"));
    expect(screen.getByTestId("sort")).toHaveTextContent("id:asc");
    expect(url()).toBe("");
  });

  test("two lists on one screen do not read each other's parameters", () => {
    mount("/messages?q=one&msg_q=two", { namespace: "msg" });

    expect(screen.getByTestId("term")).toHaveTextContent("two");
  });

  test("a namespaced list writes under its own prefix and leaves the rest alone", () => {
    mount("/messages?q=one", { namespace: "msg" });

    userEvent.click(screen.getByText("filter"));

    expect(url()).toContain("q=one");
    expect(url()).toContain("msg_role=admin");
  });
});
