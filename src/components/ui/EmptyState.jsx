import React from "react";

/**
 * What a screen shows when there is nothing to show.
 *
 * It says what is missing and offers the one thing that fixes it, rather than
 * leaving an empty rectangle for the reader to interpret.
 */
export default function EmptyState({ icon = null, title, hint = null, action = null }) {
  return (
    <div className="ui-empty" role="status">
      {icon && <span className="ui-empty__icon" aria-hidden="true">{icon}</span>}
      <p className="ui-empty__title">{title}</p>
      {hint && <p className="ui-empty__hint">{hint}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}
