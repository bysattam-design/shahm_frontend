import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * A list's state — what is searched, what is filtered, how it is ordered and
 * where it is paged — held in the address bar rather than in the component.
 *
 * Three things follow from that, and none of them is available to a list that
 * keeps this in `useState`: a view can be sent to a colleague as a link, it
 * survives a refresh, and returning from a record lands on the page and the
 * filter the reader left rather than at the top of an unfiltered list.
 *
 * Every write replaces the history entry instead of pushing one. A filter is
 * not a place the reader navigated to, and pushing per keystroke would make
 * the back button walk backwards through a search term letter by letter.
 * Leaving the list for a record is a real navigation, so the state is still
 * there on the way back.
 *
 * `namespace` lets one screen hold several lists — the messages screen carries
 * three — without their parameters colliding.
 */
export default function useListState({
  namespace = "",
  filters: filterDefaults = {},
  sort: defaultSort = "",
  direction: defaultDirection = "asc",
  size: defaultSize = 10,
  delay = 250,
} = {}) {
  const [params, setParams] = useSearchParams();

  const name = useCallback(
    (key) => (namespace ? `${namespace}_${key}` : key),
    [namespace]
  );

  /* A parameter that holds the default is not written, so a URL carries the
     narrowing and nothing else. */
  const write = useCallback(
    (changes) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);

          Object.entries(changes).forEach(([key, entry]) => {
            const param = name(key);
            const isDefault =
              entry.value === entry.fallback ||
              entry.value === "" ||
              entry.value === null ||
              entry.value === undefined;

            if (isDefault) next.delete(param);
            else next.set(param, String(entry.value));
          });

          return next;
        },
        { replace: true }
      );
    },
    [name, setParams]
  );

  /* ── search ─────────────────────────────────────────────────
     The box holds the letters; the address bar holds the term. They meet
     after the reader stops typing, so a search of eight letters is one
     query and one history entry rather than eight of each. */

  const term = params.get(name("q")) || "";
  const [draft, setDraft] = useState(term);
  const committed = useRef(term);

  useEffect(() => {
    if (term !== committed.current) {
      committed.current = term;
      setDraft(term);
    }
  }, [term]);

  useEffect(() => {
    if (draft === committed.current) return undefined;

    const timer = setTimeout(() => {
      committed.current = draft;
      write({ q: { value: draft, fallback: "" }, page: { value: 1, fallback: 1 } });
    }, delay);

    return () => clearTimeout(timer);
  }, [draft, delay, write]);

  const clearTerm = useCallback(() => {
    committed.current = "";
    setDraft("");
    write({ q: { value: "", fallback: "" }, page: { value: 1, fallback: 1 } });
  }, [write]);

  /* ── filters ────────────────────────────────────────────── */

  const defaultKeys = useMemo(() => Object.keys(filterDefaults), [filterDefaults]);

  const filters = useMemo(() => {
    const out = {};
    defaultKeys.forEach((key) => {
      out[key] = params.get(name(key)) ?? filterDefaults[key];
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, defaultKeys, name]);

  const setFilter = useCallback(
    (key, value) => {
      write({
        [key]: { value, fallback: filterDefaults[key] },
        page: { value: 1, fallback: 1 },
      });
    },
    [write, filterDefaults]
  );

  const clearFilter = useCallback(
    (key) => setFilter(key, filterDefaults[key]),
    [setFilter, filterDefaults]
  );

  /* ── order ──────────────────────────────────────────────────
     A third press on the same column returns to the natural order, so the
     reader can undo a sort without knowing which column was the original. */

  const sort = params.get(name("sort")) || defaultSort;
  const direction = params.get(name("dir")) || defaultDirection;

  const toggleSort = useCallback(
    (key) => {
      if (sort !== key) {
        write({
          sort: { value: key, fallback: defaultSort },
          dir: { value: "asc", fallback: defaultDirection },
        });
        return;
      }

      if (direction === "asc") {
        write({ dir: { value: "desc", fallback: defaultDirection } });
        return;
      }

      write({
        sort: { value: defaultSort, fallback: defaultSort },
        dir: { value: defaultDirection, fallback: defaultDirection },
      });
    },
    [sort, direction, write, defaultSort, defaultDirection]
  );

  /* ── page ───────────────────────────────────────────────── */

  const page = Number.parseInt(params.get(name("page")), 10) || 1;
  const size = Number.parseInt(params.get(name("size")), 10) || defaultSize;

  const setPage = useCallback(
    (value) => write({ page: { value, fallback: 1 } }),
    [write]
  );

  const setSize = useCallback(
    (value) =>
      write({
        size: { value, fallback: defaultSize },
        page: { value: 1, fallback: 1 },
      }),
    [write, defaultSize]
  );

  /* ── the whole narrowing ────────────────────────────────── */

  const isNarrowed =
    Boolean(term) || defaultKeys.some((key) => filters[key] !== filterDefaults[key]);

  const reset = useCallback(() => {
    committed.current = "";
    setDraft("");

    const changes = { q: { value: "", fallback: "" }, page: { value: 1, fallback: 1 } };
    defaultKeys.forEach((key) => {
      changes[key] = { value: filterDefaults[key], fallback: filterDefaults[key] };
    });

    write(changes);
  }, [write, defaultKeys, filterDefaults]);

  /* Changes whenever the set of matching rows can have changed. A screen that
     holds a selection watches this and lets the selection go, so a bulk action
     can never reach a row the reader can no longer see. */
  const narrowingKey = `${term}|${defaultKeys.map((key) => filters[key]).join("|")}`;

  return {
    term,
    draft,
    setDraft,
    clearTerm,
    filters,
    setFilter,
    clearFilter,
    sort,
    direction,
    toggleSort,
    page,
    size,
    setPage,
    setSize,
    isNarrowed,
    reset,
    narrowingKey,
  };
}
