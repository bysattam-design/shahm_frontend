// src/router/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "../store/useAuthStore";
import { roleCan, requiredRole } from "../utils/capabilities";
import DashboardLayout from "../components/layout/dashboard/DashboardLayout";
import { EmptyState, Spinner } from "../components/ui";

/**
 * What a reader sees when they are signed in and the screen is not theirs.
 *
 * Sending them to the sign-in page was the old answer, and it reads as being
 * signed out: they try their password again, it works, and they land back
 * here. A refusal has to say it is a refusal, and say what is missing.
 */
function NotYours({ capability }) {
  const { t } = useTranslation();
  const needed = requiredRole(capability);

  return (
    <EmptyState
      title={t("permissions.denied_title", "هذه الشاشة ليست ضمن صلاحيتك")}
      hint={
        needed
          ? t("permissions.denied_hint", "تحتاج صلاحية {{role}}. راجع المدير العام.").replace(
              "{{role}}",
              t(`permissions.role.${needed}`, needed)
            )
          : t("permissions.denied_hint_plain", "راجع المدير العام لطلب الصلاحية.")
      }
    />
  );
}

export default function ProtectedRoute({ capability = null }) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const identityStatus = useAuthStore((state) => state.identityStatus);
  const role = useAuthStore((state) => state.user?.role);
  const loadUser = useAuthStore((state) => state.loadUser);

  // The account behind the stored token, fetched once. Without it the guard
  // has no role to read and every screen opens for everyone.
  useEffect(() => {
    if (isAuthenticated && identityStatus === "loading") loadUser();
  }, [isAuthenticated, identityStatus, loadUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Deciding permission before the account is known would refuse the reader
  // their own screens for a moment on every reload.
  if (identityStatus !== "ready") {
    return (
      <DashboardLayout>
        <div style={{ padding: "48px 0", textAlign: "center" }}>
          <Spinner size={20} label={t("states.loading", "جار التحميل")} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {capability && !roleCan(role, capability) ? (
        <NotYours capability={capability} />
      ) : (
        <Outlet />
      )}
    </DashboardLayout>
  );
}
