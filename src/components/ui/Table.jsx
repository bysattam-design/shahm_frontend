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

export function TH({ children, ...rest }) {
  return (
    <th className="ui-table__th" scope="col" {...rest}>
      {children}
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
