import React from "react";

const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IcoClear = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 2.5 9.5 9.5M9.5 2.5 2.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * The one bar above every list: what is searched, what narrows it, and the
 * actions that belong to the list rather than to a row.
 *
 * The bar carries no wording of its own. A component that holds its own text
 * holds it in one language, and the panel is read in two.
 *
 * The field says which columns it looks in. A search box that silently covers
 * two of the seven columns reads, to someone whose row does not come back, as
 * a record that is missing.
 */
export default function ListToolbar({
  value = "",
  onChange,
  onClear,
  labels = {},
  hintId = "list-search-hint",
  filters = null,
  actions = null,
  disabled = false,
}) {
  const hasText = value !== "";

  return (
    <div className="ui-list-bar">
      <div className="ui-list-bar__row">
        <div className="ui-list-search" role="search">
          <span className="ui-list-search__icon"><IcoSearch /></span>

          <input
            type="text"
            className="ui-list-search__input"
            value={value}
            disabled={disabled}
            placeholder={labels.placeholder}
            aria-label={labels.search}
            aria-describedby={labels.searchIn ? hintId : undefined}
            onChange={(event) => onChange && onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && hasText) {
                event.stopPropagation();
                onClear && onClear();
              }
            }}
          />

          {hasText && (
            <button
              type="button"
              className="ui-list-search__clear"
              onClick={onClear}
              aria-label={labels.clear}
              title={labels.clear}
            >
              <IcoClear />
            </button>
          )}
        </div>

        {filters && <div className="ui-list-bar__filters">{filters}</div>}
        {actions && <div className="ui-list-bar__actions">{actions}</div>}
      </div>

      {labels.searchIn && (
        <p className="ui-list-bar__hint" id={hintId}>{labels.searchIn}</p>
      )}
    </div>
  );
}

/**
 * A named choice in the bar. It is a `select` and not a menu of our own so it
 * keeps the platform's keyboard, its type-ahead and its screen reader.
 */
export function ListFilter({ label, value, onChange, options = [], id }) {
  return (
    <label className="ui-list-filter" htmlFor={id}>
      <span className="ui-list-filter__label">{label}</span>
      <select
        id={id}
        className="ui-list-filter__select"
        value={value}
        onChange={(event) => onChange && onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
