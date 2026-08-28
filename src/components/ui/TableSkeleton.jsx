import React from "react";
import { Skeleton } from "./Spinner";
import { TBody, TD, TR } from "./Table";

/* A row of a table is mostly one wide cell and several narrow ones. Holding
   the widths steady down the rows keeps the wait from looking like noise. */
const WIDTHS = ["38%", "72%", "54%", "46%", "60%", "44%", "58%"];

/**
 * The wait, in the shape of what is coming.
 *
 * A spinner in the middle of an empty card says only that something is
 * happening; the table then arrives and pushes the page down. Rows of the
 * right height and the right column count hold the space, so nothing jumps
 * when the data lands.
 *
 * The rows are hidden from the screen reader, which is told what is happening
 * in words by the screen instead — a reader who cannot see the bars gains
 * nothing from six empty rows being read out.
 */
export default function TableSkeleton({ columns = 4, rows = 6 }) {
  return (
    <TBody>
      {Array.from({ length: rows }, (_, row) => (
        <TR key={row} aria-hidden="true">
          {Array.from({ length: columns }, (_, column) => (
            <TD key={column}>
              <Skeleton width={WIDTHS[column % WIDTHS.length]} height={13} />
            </TD>
          ))}
        </TR>
      ))}
    </TBody>
  );
}
