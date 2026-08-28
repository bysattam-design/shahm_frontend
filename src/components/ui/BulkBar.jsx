import React from "react";

/**
 * The bar that appears when rows are chosen.
 *
 * It sits in the flow above the table rather than floating over it: a floating
 * bar covers the last row of the very list it is acting on, and on a short
 * screen it covers the action the reader was reaching for.
 *
 * It always says how many rows are in force, and it separates the rows on this
 * page from every row that matches the filter, so a bulk action can never be
 * larger than the reader thought.
 */
export default function BulkBar({
  count = 0,
  scope = "some",
  onClear,
  onSelectAllMatching,
  canSelectAllMatching = false,
  labels = {},
  children = null,
}) {
  if (count === 0) return null;

  return (
    <div className="ui-bulk" role="region" aria-label={labels.region}>
      <span className="ui-bulk__count">{labels.count}</span>

      {scope !== "matching" && canSelectAllMatching && onSelectAllMatching && (
        <button type="button" className="ui-bulk__link" onClick={onSelectAllMatching}>
          {labels.selectAllMatching}
        </button>
      )}

      <button type="button" className="ui-bulk__link" onClick={onClear}>
        {labels.clear}
      </button>

      {children && <span className="ui-bulk__actions">{children}</span>}
    </div>
  );
}
