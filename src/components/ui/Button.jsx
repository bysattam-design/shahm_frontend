import React from "react";

/**
 * The one button.
 *
 * Three intents and two sizes. A button that is working shows it and refuses
 * a second press, because the screens used to leave a save button live while
 * the request was in flight.
 */
export default function Button({
  children,
  intent = "primary",
  size = "md",
  icon = null,
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...rest
}) {
  const classes = [
    "ui-btn",
    `ui-btn--${intent}`,
    size === "sm" ? "ui-btn--sm" : "",
    loading ? "ui-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="ui-btn__spinner" aria-hidden="true" /> : icon}
      <span className="ui-btn__label">{children}</span>
    </button>
  );
}
