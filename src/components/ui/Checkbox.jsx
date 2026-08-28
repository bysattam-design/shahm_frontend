import React from "react";

/**
 * A box that is filled when it is chosen, the way the references have it:
 * solid mark, not a tinted outline. The native input stays underneath, so the
 * keyboard and the screen reader get the real control.
 */
export default function Checkbox({ checked = false, onChange, label, disabled = false, id }) {
  return (
    <label className={`ui-check${disabled ? " ui-check--disabled" : ""}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="ui-check__input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange && onChange(event.target.checked, event)}
      />
      <span className="ui-check__box" aria-hidden="true">
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
      </span>
      {label && <span className="ui-check__label">{label}</span>}
    </label>
  );
}
