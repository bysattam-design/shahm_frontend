import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import api from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/useAuthStore";
import { useDashboardStore } from "../../../store/useDashboardStore";
import DashboardHome from "./DashboardHome";

const STATS = {
  visits: {
    today: 132,
    week: 940,
    top_pages: [{ path: "/services", count: 320 }],
  },
  messages: {
    total: 18,
    latest: [
      { id: 1, phone: "05xxxxxxxx", is_read: false, status: "new", created_at: "2026-08-28T10:00:00Z" },
    ],
  },
  subscribers: {
    total: 45,
    latest: [{ id: 2, email: "a@b.c", created_at: "2026-08-28T09:00:00Z" }],
  },
};

const EMPTY = {
  visits: { today: 0, week: 0, top_pages: [] },
  messages: { total: 0, latest: [] },
  subscribers: { total: 0, latest: [] },
};

function signedInAs(role) {
  useAuthStore.setState({
    user: { id: 1, name: "من يعمل", email: "a@b.c", role },
    accessToken: "probe",
    isAuthenticated: true,
    identityStatus: "ready",
    identityError: "",
  });
}

function serve(data) {
  api.get.mockResolvedValue({ data });
}

function renderHome() {
  render(
    <MemoryRouter>
      <DashboardHome />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useDashboardStore.setState({ stats: null, status: "loading", error: "" });
  signedInAs("super_admin");
});

describe("the home screen", () => {
  test("a refused load says why, instead of spinning for good", async () => {
    api.get.mockRejectedValue({
      response: { status: 500, data: { detail: "تعذر جلب الاحصاءات." } },
    });
    renderHome();

    // `loadStats` had no catch, so `stats` stayed null and the screen renders
    // its spinner whenever `stats` is null — for as long as the tab was open.
    expect(await screen.findByText("تعذر جلب البيانات")).toBeInTheDocument();
    expect(screen.getByText("تعذر جلب الاحصاءات.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "أعد المحاولة" })).toBeInTheDocument();
  });

  test("asking again after a refused load brings the figures", async () => {
    api.get.mockRejectedValueOnce({ response: { status: 500, data: {} } });
    renderHome();

    const retry = await screen.findByRole("button", { name: "أعد المحاولة" });
    serve(STATS);
    userEvent.click(retry);

    expect(await screen.findByText("dashboard.cards.total_messages")).toBeInTheDocument();
  });

  test("a figure that names a place leads there", async () => {
    serve(STATS);
    renderHome();

    // The screen stated four numbers and offered nothing to press, so an
    // editor who read «18 رسالة» had to leave and find the sidebar.
    const card = await screen.findByRole("link", { name: /dashboard\.cards\.total_messages/ });
    expect(card).toHaveAttribute("href", "/dashboard/messages");
  });

  test("a message row leads to that message", async () => {
    serve(STATS);
    renderHome();

    const row = await screen.findByRole("link", { name: /05xxxxxxxx/ });
    expect(row).toHaveAttribute("href", "/dashboard/messages/1");
  });

  test("a reader who may not open the messages is offered no link to them", async () => {
    signedInAs("viewer");
    useAuthStore.setState({ user: { id: 1, role: "viewer" }, identityStatus: "ready" });
    // A viewer holds messages.read, so take the capability away entirely.
    useAuthStore.setState({ user: { id: 1, role: "" }, identityStatus: "ready" });
    serve(STATS);
    renderHome();

    await screen.findByText("dashboard.cards.total_messages");
    expect(
      screen.queryByRole("link", { name: /dashboard\.cards\.total_messages/ })
    ).not.toBeInTheDocument();
  });

  test("the state of a message is written once, not twice", async () => {
    serve(STATS);
    renderHome();

    await screen.findByText("05xxxxxxxx");

    // The row carried the state as a badge and again as text beneath it.
    expect(screen.getAllByText("messages.status.new")).toHaveLength(1);
  });

  test("a moment is written the way the reader reads", async () => {
    serve(STATS);
    renderHome();

    await screen.findByText("05xxxxxxxx");

    // `toLocaleString()` with nothing said fell back to the browser's locale,
    // so an Arabic panel showed `8/28/2026, 1:00:00 PM`.
    expect(screen.queryByText(/^8\/28\/2026/)).not.toBeInTheDocument();
  });

  test("the top pages say when there are none", async () => {
    serve(EMPTY);
    renderHome();

    // The list rendered an empty rectangle under its heading and a «0 صفحة»
    // badge, and said nothing.
    await waitFor(() =>
      expect(screen.getAllByText("dashboard.no_data").length).toBeGreaterThanOrEqual(3)
    );
  });

  test("the screen no longer claims to be live", async () => {
    serve(STATS);
    renderHome();

    await screen.findByText("dashboard.cards.total_messages");

    // A pulsing dot said «مباشر» while the figures were fetched once and never
    // again. It says when they were read, and offers to read them afresh.
    expect(screen.queryByText("dashboard.live")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /حدث/ })).toBeInTheDocument();
  });
});

describe("the home store", () => {
  test("a refused load is reported rather than thrown into nothing", async () => {
    api.get.mockRejectedValueOnce({
      response: { status: 500, data: { detail: "تعذر جلب الاحصاءات." } },
    });

    const result = await useDashboardStore.getState().loadStats();

    expect(result.success).toBe(false);
    expect(useDashboardStore.getState().status).toBe("failed");
    expect(useDashboardStore.getState().error).toBe("تعذر جلب الاحصاءات.");
  });

  test("a cancelled request is not reported as a failure", async () => {
    api.get.mockRejectedValueOnce({ code: "ERR_CANCELED", name: "CanceledError" });

    const result = await useDashboardStore.getState().loadStats();

    expect(result.canceled).toBe(true);
    expect(useDashboardStore.getState().status).not.toBe("failed");
  });
});
