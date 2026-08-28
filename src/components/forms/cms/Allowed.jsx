import React from "react";
import { useTranslation } from "react-i18next";

import useCan from "../../../hooks/useCan";
import { requiredRole } from "../../../utils/capabilities";

/**
 * A control that is offered only to a reader who may use it — and when they
 * may not, is offered disabled with the reason beside it.
 *
 * Hiding it is the easier answer and the worse one. A reader who cannot see a
 * button does not learn that the act exists, so they ask a colleague to do
 * something they could have been given the right to do themselves; and a
 * reader who half-remembers it looks for it and concludes the screen is
 * broken. Showing it greyed with «يحتاج صلاحية مدير» tells them both what the
 * screen can do and what to ask for.
 *
 * The server decides; this only stops the reader finding out by pressing.
 *
 *   <Allowed capability="messages.delete">
 *     <button onClick={remove}>احذف</button>
 *   </Allowed>
 *
 * `children` may be an element, which is cloned with `disabled`, or a function
 * that is handed `{ allowed }` when the control needs to say more than that.
 */
export default function Allowed({ capability, children, hide = false, title }) {
  const { t } = useTranslation();
  const { can, ready } = useCan();

  const allowed = can(capability);

  // While the account is still being fetched, a control is neither offered nor
  // refused: deciding against a blank would grey out a reader's own buttons
  // for a moment on every reload.
  if (!ready) return null;

  if (typeof children === "function") return children({ allowed });

  if (allowed) return children;

  // A few places genuinely have to hide rather than grey — a destructive act
  // on a record the reader has no business knowing exists.
  if (hide) return null;

  const needed = requiredRole(capability);
  const reason = needed
    ? t("permissions.action_denied_needs", "يحتاج صلاحية {{role}}").replace(
        "{{role}}",
        t(`permissions.role.${needed}`, needed)
      )
    : t("permissions.action_denied", "لا تملك هذا الإجراء");

  return (
    <span className="sf-denied" title={title || reason}>
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            disabled: true,
            "aria-disabled": "true",
            onClick: undefined,
            tabIndex: -1,
          })
        : children}
      <span className="sf-denied__why">{reason}</span>
    </span>
  );
}
