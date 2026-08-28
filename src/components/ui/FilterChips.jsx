import React from "react";

const IcoRemove = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 2.5 9.5 9.5M9.5 2.5 2.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * What is currently narrowing the list, said in words and liftable one at a
 * time.
 *
 * A filter held only inside a dropdown is invisible once the dropdown closes,
 * and an empty table under an unseen filter reads as an empty table. Each
 * constraint is shown, and each comes off on its own — the reader who wants
 * one of three filters gone should not have to rebuild the other two.
 */
export default function FilterChips({ chips = [], onClearAll, labels = {} }) {
  if (chips.length === 0) return null;

  return (
    <div className="ui-chips" role="group" aria-label={labels.group}>
      {chips.map((chip) => (
        <span className="ui-chip" key={chip.key}>
          <span className="ui-chip__text">{chip.label}</span>
          <button
            type="button"
            className="ui-chip__remove"
            onClick={chip.onRemove}
            aria-label={chip.removeLabel || labels.remove}
            title={chip.removeLabel || labels.remove}
          >
            <IcoRemove />
          </button>
        </span>
      ))}

      {chips.length > 1 && onClearAll && (
        <button type="button" className="ui-chips__clear" onClick={onClearAll}>
          {labels.clearAll}
        </button>
      )}
    </div>
  );
}
