import React from "react";
import { pageWindow } from "../../utils/listQuery";

const Chevron = ({ back }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d={back ? "M7.5 2 3.5 6l4 4" : "M4.5 2 8.5 6l-4 4"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The one pager, at the foot of the list and nowhere else.
 *
 * The panel had three of these — one shared component and two written again
 * inside screens — and one screen showed its pager twice on the same list, so
 * the reader had two controls for one position. There is one here, it is the
 * only one, and it carries the count as well as the pages: a reader who cannot
 * see how many rows there are cannot tell a filter that narrowed the list from
 * a list that is short.
 *
 * The arrows are mirrored by the writing direction rather than by a language
 * check, so «previous» points backwards in both directions.
 */
export default function Pager({
  page = 1,
  pages = 1,
  total = 0,
  size,
  sizes = [10, 25, 50],
  onPage,
  onSize,
  labels = {},
}) {
  if (total === 0) return null;

  const go = (next) => {
    if (next < 1 || next > pages || next === page) return;
    onPage && onPage(next);
  };

  return (
    <div className="ui-pager">
      <p className="ui-pager__count">{labels.range}</p>

      {pages > 1 && (
        <nav className="ui-pager__pages" aria-label={labels.navigation}>
          <button
            type="button"
            className="ui-pager__step"
            onClick={() => go(page - 1)}
            disabled={page === 1}
            aria-label={labels.previous}
            title={labels.previous}
          >
            <Chevron back />
          </button>

          {pageWindow(page, pages).map((entry, index) =>
            entry === "gap" ? (
              <span className="ui-pager__gap" key={`gap-${index}`} aria-hidden="true">…</span>
            ) : (
              <button
                type="button"
                key={entry}
                className={`ui-pager__page${entry === page ? " ui-pager__page--here" : ""}`}
                onClick={() => go(entry)}
                aria-current={entry === page ? "page" : undefined}
                aria-label={labels.pageLabel ? labels.pageLabel(entry) : undefined}
              >
                {entry}
              </button>
            )
          )}

          <button
            type="button"
            className="ui-pager__step"
            onClick={() => go(page + 1)}
            disabled={page === pages}
            aria-label={labels.next}
            title={labels.next}
          >
            <Chevron />
          </button>
        </nav>
      )}

      {onSize && (
        <label className="ui-pager__size">
          <span className="ui-pager__size-label">{labels.size}</span>
          <select
            className="ui-list-filter__select"
            value={size}
            onChange={(event) => onSize(Number.parseInt(event.target.value, 10))}
          >
            {sizes.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
