import React from "react";

export function Spinner({ size = 16, label }) {
  return (
    <span
      className="ui-spinner"
      style={{ "--spinner-size": `${size}px` }}
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    />
  );
}

/**
 * A loading state that keeps the shape of what is coming, so the page does not
 * jump when it arrives.
 */
export function Skeleton({ width = "100%", height = 14, radius }) {
  return (
    <span
      className="ui-skeleton"
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export default Spinner;
