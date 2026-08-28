import { useCallback } from "react";

import { useAuthStore } from "../store/useAuthStore";
import { requiredRole, roleCan } from "../utils/capabilities";

/**
 * The one question a screen asks about permission: may this reader do it?
 *
 * Screens name a capability, never a role, so the roles can be re-cut in
 * `utils/capabilities` without touching a screen.
 */
export default function useCan() {
  const role = useAuthStore((state) => state.user?.role);
  const ready = useAuthStore((state) => state.identityStatus === "ready");

  const can = useCallback(
    (capability) => (ready ? roleCan(role, capability) : false),
    [role, ready]
  );

  return {
    can,
    /** The role a capability needs, so a refusal can say what is missing. */
    needs: requiredRole,
    role,
    /** False while the account is still being fetched. */
    ready,
  };
}
