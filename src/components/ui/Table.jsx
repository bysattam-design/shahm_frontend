import React from "react";

/**
 * A table that scrolls inside its own frame rather than pushing the page
 * sideways, and that keeps its head in place while the rows move.
 */
export function Table({ children, className = "" }) {
  return (
    <div className="ui-table-frame">
      <table className={`ui-table ${className}`.trim()}>{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return <thead className="ui-table__head">{children}</thead>;
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, selected = false, ...rest }) {
  return (
    <tr className={`ui-table__row${selected ? " ui-table__row--selected" : ""}`} {...rest}>
      {children}
    </tr>
  );
}

/**
 * A column head, and where a column can be ordered, the control that orders
 * it.
 *
 * The button is inside the `th` rather than the `th` being clickable, so the
 * keyboard reaches it in the ordinary way and the screen reader is told the
 * column is sortable. `aria-sort` on the cell carries the current order, which
 * is what a reader who cannot see the arrow has to go on.
 */
export function TH({ children, sortable = false, sorted = null, onSort, label, ...rest }) {
  if (!sortable) {
    return (
      <th className="ui-table__th" scope="col" {...rest}>
        {children}
      </th>
    );
  }

  return (
    <th
      className="ui-table__th ui-table__th--sortable"
      scope="col"
      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
      {...rest}
    >
      <button type="button" className="ui-table__sort" onClick={onSort} aria-label={label}>
        <span>{children}</span>
        <span className={`ui-table__arrow${sorted ? " ui-table__arrow--on" : ""}`} aria-hidden="true">
          {sorted === "desc" ? "\u25BE" : "\u25B4"}
        </span>
      </button>
    </th>
  );
}

export function TD({ children, muted = false, ...rest }) {
  return (
    <td className={`ui-table__td${muted ? " ui-table__td--muted" : ""}`} {...rest}>
      {children}
    </td>
  );
}

/**
 * The two-line cell the references use for a record: what it is, then what
 * distinguishes it, in a quieter voice.
 */
export function CellStack({ title, sub, media = null }) {
  return (
    <div className="ui-cell-stack">
      {media}
      <span className="ui-cell-stack__text">
        <span className="ui-cell-stack__title">{title}</span>
        {sub && <span className="ui-cell-stack__sub">{sub}</span>}
      </span>
    </div>
  );
}
