// src/router/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "../store/useAuthStore";
import { roleCan, requiredRole } from "../utils/capabilities";
import DashboardLayout from "../components/layout/dashboard/DashboardLayout";
import { Button, EmptyState, Spinner } from "../components/ui";

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
  const identityError = useAuthStore((state) => state.identityError);
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

  // A connection that dropped at the moment the dashboard opened used to leave
  // every screen spinning for good: the fetch above only runs while the status
  // reads `loading`, and a failure used to settle on `unknown`, which nothing
  // ever moved off. It is said now, with the reason and a way back.
  if (identityStatus === "failed") {
    return (
      <DashboardLayout>
        <EmptyState
          title={t("states.error_title", "تعذر جلب البيانات")}
          hint={identityError || t("states.error_hint", "تحقق من الاتصال ثم أعد المحاولة.")}
          action={
            <Button onClick={() => loadUser()}>
              {t("states.retry", "أعد المحاولة")}
            </Button>
          }
        />
      </DashboardLayout>
    );
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
