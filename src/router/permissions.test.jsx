import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import api from "../api/axiosClient";
import { useAuthStore } from "../store/useAuthStore";
import { roleCan, requiredRole } from "../utils/capabilities";
import ProtectedRoute from "./ProtectedRoute";
import DashboardSidebar from "../components/layout/dashboard/DashboardSidebar";

function signedInAs(role) {
  useAuthStore.setState({
    user: role ? { id: 1, name: "من يعمل", email: "a@b.c", role } : null,
    accessToken: "probe",
    refreshToken: "probe",
    isAuthenticated: true,
    identityStatus: role ? "ready" : "loading",
  });
}

function renderGuarded(capability) {
  return render(
    <MemoryRouter initialEntries={["/screen"]}>
      <Routes>
        <Route element={<ProtectedRoute capability={capability} />}>
          <Route path="/screen" element={<p>محتوى الشاشة</p>} />
        </Route>
        <Route path="/login" element={<p>صفحة الدخول</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderSidebar() {
  render(
    <MemoryRouter>
      <DashboardSidebar isOpen onClose={() => {}} />
    </MemoryRouter>
  );
}

/** Every destination the sidebar is currently offering. */
function offeredLinks() {
  return screen.getAllByRole("link").map((link) => link.getAttribute("href"));
}

beforeEach(() => {
  api.get.mockResolvedValue({ data: { id: 1, name: "من يعمل", email: "a@b.c", role: "viewer" } });
});

afterEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    identityStatus: "unknown",
  });
});

describe("who may do what", () => {
  test("a role holds only what its rank reaches", () => {
    expect(roleCan("viewer", "messages.read")).toBe(true);
    expect(roleCan("viewer", "content.edit")).toBe(false);
    expect(roleCan("editor", "content.edit")).toBe(true);
    expect(roleCan("editor", "users.manage")).toBe(false);
    expect(roleCan("admin", "users.manage")).toBe(true);
    expect(roleCan("admin", "integrations.manage")).toBe(false);
    expect(roleCan("super_admin", "integrations.manage")).toBe(true);
  });

  test("a capability nobody declared is refused, not granted", () => {
    // A typo has to close a door, never open one.
    expect(roleCan("super_admin", "made.up")).toBe(false);
    expect(requiredRole("made.up")).toBeNull();
  });

  test("an unknown role holds nothing", () => {
    expect(roleCan(undefined, "messages.read")).toBe(false);
    expect(roleCan("", "dashboard.view")).toBe(false);
  });
});

describe("the guard on a screen", () => {
  test("a reader who may use the screen sees it", async () => {
    signedInAs("admin");
    renderGuarded("users.manage");

    expect(await screen.findByText("محتوى الشاشة")).toBeInTheDocument();
  });

  test("a reader who may not is refused, and told why", async () => {
    signedInAs("viewer");
    renderGuarded("users.manage");

    // The screen used to open for everyone; the server then refused the
    // requests behind it and the reader was left with a blank page.
    expect(await screen.findByText("هذه الشاشة ليست ضمن صلاحيتك")).toBeInTheDocument();
    expect(screen.queryByText("محتوى الشاشة")).not.toBeInTheDocument();
  });

  test("the refusal names the role that is missing", async () => {
    signedInAs("editor");
    renderGuarded("settings.manage");

    expect(await screen.findByText(/مدير/)).toBeInTheDocument();
  });

  test("a refusal is not a sign-out", async () => {
    signedInAs("viewer");
    renderGuarded("users.manage");

    // Sending a signed-in reader to the sign-in page reads as being signed
    // out: they enter the password again, it works, and they land back here.
    await screen.findByText("هذه الشاشة ليست ضمن صلاحيتك");
    expect(screen.queryByText("صفحة الدخول")).not.toBeInTheDocument();
  });

  test("nobody is judged before the account is known", async () => {
    signedInAs(null);
    renderGuarded("users.manage");

    // Deciding against a blank would refuse a reader their own screens for a
    // moment on every reload.
    expect(screen.queryByText("هذه الشاشة ليست ضمن صلاحيتك")).not.toBeInTheDocument();
    expect(screen.queryByText("محتوى الشاشة")).not.toBeInTheDocument();
  });

  test("the account is fetched once when the app opens with a stored token", async () => {
    signedInAs(null);
    renderGuarded("messages.read");

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/accounts/me/"));
  });

  test("a connection that drops while opening is said, not spun on for good", async () => {
    api.get.mockRejectedValue({
      response: { status: 500, data: { detail: "تعذر الوصول إلى الخادم." } },
    });
    signedInAs(null);
    renderGuarded("messages.read");

    // The fetch only runs while the status reads `loading`. A failure used to
    // settle on `unknown`, which nothing ever moved off, so every screen span
    // for good with nothing said.
    expect(await screen.findByText("تعذر جلب البيانات")).toBeInTheDocument();
    expect(screen.getByText("تعذر الوصول إلى الخادم.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "أعد المحاولة" })).toBeInTheDocument();
  });

  test("asking again after a dropped connection brings the screen back", async () => {
    api.get.mockRejectedValueOnce({ response: { status: 500, data: {} } });
    signedInAs(null);
    renderGuarded("messages.read");

    const retry = await screen.findByRole("button", { name: "أعد المحاولة" });
    api.get.mockResolvedValue({
      data: { id: 1, name: "من يعمل", email: "a@b.c", role: "editor" },
    });
    userEvent.click(retry);

    expect(await screen.findByText("محتوى الشاشة")).toBeInTheDocument();
  });

  test("a refused token still signs the reader out", async () => {
    api.get.mockRejectedValue({ response: { status: 401, data: {} } });
    signedInAs(null);
    renderGuarded("messages.read");

    // A dropped connection keeps the session; a token the server refuses does
    // not.
    expect(await screen.findByText("صفحة الدخول")).toBeInTheDocument();
  });
});

describe("the sidebar", () => {
  test("a viewer is offered only what a viewer may open", async () => {
    signedInAs("viewer");
    renderSidebar();

    const hrefs = offeredLinks();

    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/dashboard/messages");
    expect(hrefs).not.toContain("/dashboard/users");
    expect(hrefs).not.toContain("/dashboard/settings");
    expect(hrefs).not.toContain("/dashboard/cms/footer");
  });

  test("an editor is offered the content screens and not the account ones", async () => {
    signedInAs("editor");
    renderSidebar();

    const hrefs = offeredLinks();

    expect(hrefs).toContain("/dashboard/cms/footer");
    expect(hrefs).toContain("/dashboard/blog");
    expect(hrefs).not.toContain("/dashboard/users");
    expect(hrefs).not.toContain("/dashboard/email-templates");
  });

  test("the general manager is offered everything", async () => {
    signedInAs("super_admin");
    renderSidebar();

    const hrefs = offeredLinks();

    expect(hrefs).toContain("/dashboard/users");
    expect(hrefs).toContain("/dashboard/settings");
    expect(hrefs).toContain("/dashboard/email-templates");
  });

  test("a group left with no item disappears with its heading", async () => {
    signedInAs("viewer");
    renderSidebar();

    // «الإعدادات» holds nothing a viewer may open, so the heading goes too
    // rather than standing over an empty space.
    expect(screen.queryByText("sidebar.settings")).not.toBeInTheDocument();
    expect(screen.getByText("sidebar.general")).toBeInTheDocument();
  });
});
