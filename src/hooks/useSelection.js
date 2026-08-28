import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * The rows a bulk action will reach.
 *
 * Two selections look alike and are not: the fifty rows on this page, and the
 * four hundred rows that match the filter. A panel that offers only the first
 * makes the reader page through eight screens ticking boxes; one that silently
 * means the second deletes rows nobody looked at. So the two are separate
 * states here, and the bar says which one is in force.
 *
 * The selection is dropped whenever the narrowing changes. A row that no
 * longer matches the filter is a row the reader can no longer see, and an
 * action must not reach it.
 */
export default function useSelection({ pageIds = [], matchingIds = [], resetKey = "" }) {
  const [ids, setIds] = useState(() => new Set());
  const [scope, setScope] = useState("some"); // "some" | "matching"

  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setIds(new Set());
    setScope("some");
  }, [resetKey]);

  const clear = useCallback(() => {
    setIds(new Set());
    setScope("some");
  }, []);

  const toggle = useCallback((id) => {
    setScope("some");
    setIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const pageKey = pageIds.join(",");

  /* The header box is a three-way control: it fills the page, and once the
     page is full it empties it again. */
  const togglePage = useCallback(() => {
    setScope("some");
    setIds((previous) => {
      const onPage = pageKey ? pageKey.split(",") : [];
      const covered = onPage.length > 0 && onPage.every((id) => previous.has(id));
      const next = new Set(previous);

      onPage.forEach((id) => (covered ? next.delete(id) : next.add(id)));
      return next;
    });
  }, [pageKey]);

  const selectAllMatching = useCallback(() => {
    setScope("matching");
    setIds(new Set());
  }, []);

  const selectedIds = useMemo(
    () => (scope === "matching" ? matchingIds.map(String) : [...ids]),
    [scope, ids, matchingIds]
  );

  const isSelected = useCallback(
    (id) => (scope === "matching" ? true : ids.has(String(id))),
    [scope, ids]
  );

  const onPage = pageKey ? pageKey.split(",") : [];
  const chosenOnPage = onPage.filter((id) => isSelected(id)).length;

  return {
    scope,
    count: selectedIds.length,
    selectedIds,
    isSelected,
    toggle,
    togglePage,
    selectAllMatching,
    clear,
    pageState:
      chosenOnPage === 0 ? "none" : chosenOnPage === onPage.length ? "all" : "some",
    /* Worth offering only when the filter holds more than this page shows. */
    canSelectAllMatching: scope !== "matching" && matchingIds.length > onPage.length,
  };
}
