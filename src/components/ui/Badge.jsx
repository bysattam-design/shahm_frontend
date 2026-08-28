import React from "react";

/**
 * A state said in one word.
 *
 * The tone carries the meaning, so a reader who cannot tell the colours apart
 * still reads the word — the colour is never the only signal.
 */
export default function Badge({ children, tone = "neutral", dot = false, className = "" }) {
  return (
    <span className={`ui-badge ui-badge--${tone} ${className}`.trim()}>
      {dot && <span className="ui-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
