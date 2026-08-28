import React, { useEffect, useRef } from "react";

/**
 * A box that is filled when it is chosen, the way the references have it:
 * solid mark, not a tinted outline. The native input stays underneath, so the
 * keyboard and the screen reader get the real control.
 *
 * `indeterminate` is the third state the head of a list needs: some of this
 * page is chosen, not none and not all. It cannot be set as an attribute, only
 * on the element, so it is written through the ref on every change.
 *
 * `ariaLabel` names a box that has no visible text — a row's own checkbox in a
 * table, where the name is the row and printing it beside the box would repeat
 * the whole line.
 */
export default function Checkbox({
  checked = false,
  onChange,
  label,
  ariaLabel,
  indeterminate = false,
  disabled = false,
  id,
}) {
  const input = useRef(null);

  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={`ui-check${disabled ? " ui-check--disabled" : ""}`} htmlFor={id}>
      <input
        id={id}
        ref={input}
        type="checkbox"
        className="ui-check__input"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange && onChange(event.target.checked, event)}
      />
      <span className="ui-check__box" aria-hidden="true">
        {indeterminate && !checked ? (
          <svg viewBox="0 0 12 12" width="12" height="12">
            <path d="M2.6 6h6.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" width="12" height="12">
            <path
              d="M2 6.2 4.6 8.8 10 3.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && <span className="ui-check__label">{label}</span>}
    </label>
  );
}
