/**
 * The arithmetic behind every list in the panel: search, sort, page.
 *
 * It is kept here, free of React and of any screen, for two reasons. A list
 * that filters in a component filters differently in each component — the
 * dashboard had a `.filter()` written by hand in one screen, a second copy of
 * pagination in another, and no search at all in the rest. And a pure function
 * can be measured: every rule below is held by a test rather than by a reading
 * of the screen.
 *
 * Nothing here talks to the server. The lists the panel shows are small enough
 * to hold, and moving the work to the server would change an API contract that
 * is deliberately frozen.
 */

/* ── Arabic, as it is actually typed ──────────────────────────────
   A reader looking for «احمد» must find «أحمد», and one who types the
   Arabic-Indic ١٢ must find the record numbered 12. Search that compares raw
   code points fails both, silently, and reads to the user as missing data.  */

const TASHKEEL = /[ً-ْٰـ]/g;
const ARABIC_INDIC = /[٠-٩]/g;
const EASTERN_INDIC = /[۰-۹]/g;

const FOLDED = {
  "أ": "ا", // أ
  "إ": "ا", // إ
  "آ": "ا", // آ
  "ٱ": "ا", // ٱ
  "ة": "ه", // ة
  "ى": "ي", // ى
  "ؤ": "و", // ؤ
  "ئ": "ي", // ئ
};

/** One spelling of a string, so two spellings of the same word meet. */
export function fold(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(TASHKEEL, "")
    .replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(EASTERN_INDIC, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[أإآٱةىؤئ]/g, (c) => FOLDED[c])
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Whether a row answers a search term.
 *
 * Every word of the term must appear somewhere in the searched fields, in any
 * order — «سطام محامي» finds a row that carries the two words in either
 * column, which is how a person actually searches a table.
 */
export function matches(row, term, fields) {
  const wanted = fold(term);
  if (!wanted) return true;

  const hay = fields
    .map((field) => fold(typeof field === "function" ? field(row) : row[field]))
    .join(" ");

  return wanted.split(" ").every((word) => hay.includes(word));
}

export function searchRows(rows, term, fields) {
  if (!fold(term)) return rows;
  return rows.filter((row) => matches(row, term, fields));
}

/**
 * Apply the active filters. A filter whose value is empty or `all` is not a
 * filter, so a screen may pass its whole filter object without sifting first.
 */
export function filterRows(rows, filters, definitions) {
  return Object.entries(filters || {}).reduce((kept, [key, value]) => {
    if (value === "" || value === null || value === undefined || value === "all") {
      return kept;
    }

    const test = definitions[key];
    if (!test) return kept;

    return kept.filter((row) => test(row, value));
  }, rows);
}

/* ── Sorting ─────────────────────────────────────────────────────
   Arabic does not sort by code point: «ا» before «ب» is an accident of the
   encoding, and «١٠» before «٩» is a wrong answer a byte comparison gives
   confidently. The collator settles both.  */

let collator = null;

function compare(a, b) {
  if (a === null || a === undefined || a === "") return 1;
  if (b === null || b === undefined || b === "") return -1;

  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return (a ? 1 : 0) - (b ? 1 : 0);

  if (!collator) {
    collator = new Intl.Collator("ar", { numeric: true, sensitivity: "base" });
  }

  return collator.compare(String(a), String(b));
}

/**
 * Sort by one column. `accessors` maps a column key to the value that column
 * actually sorts on, so a cell that renders a badge still sorts on its rank.
 */
export function sortRows(rows, key, direction, accessors = {}) {
  if (!key) return rows;

  const read = accessors[key] || ((row) => row[key]);
  const sign = direction === "desc" ? -1 : 1;

  return [...rows].sort((a, b) => sign * compare(read(a), read(b)));
}

/* ── Paging ──────────────────────────────────────────────────── */

export function pageCount(total, size) {
  return Math.max(1, Math.ceil((total || 0) / (size || 1)));
}

/** A page number that exists: deleting the last row of page 9 lands on page 8. */
export function clampPage(page, total, size) {
  const last = pageCount(total, size);
  const asked = Number.parseInt(page, 10);

  if (!Number.isFinite(asked) || asked < 1) return 1;
  return Math.min(asked, last);
}

export function pageSlice(rows, page, size) {
  const safe = clampPage(page, rows.length, size);
  const start = (safe - 1) * size;
  return rows.slice(start, start + size);
}

/**
 * The page numbers a pager should offer: the ends, the neighbourhood of the
 * current page, and a gap where the run is broken. Returned as numbers and
 * the string "gap", so the caller decides how a gap looks.
 */
export function pageWindow(current, last, span = 1) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const wanted = new Set([1, last, current]);
  for (let step = 1; step <= span; step += 1) {
    wanted.add(current - step);
    wanted.add(current + step);
  }

  const shown = [...wanted].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);

  return shown.reduce((out, page, index) => {
    if (index > 0 && page - shown[index - 1] > 1) out.push("gap");
    out.push(page);
    return out;
  }, []);
}

/**
 * The whole pipeline in the one order that is correct: narrow, then order,
 * then cut. Sorting before filtering wastes the sort; paging before either
 * pages the wrong rows.
 */
export function runQuery(rows, { term, fields = [], filters, definitions = {}, sort, direction, accessors, page, size }) {
  const narrowed = filterRows(searchRows(rows || [], term, fields), filters, definitions);
  const ordered = sortRows(narrowed, sort, direction, accessors);

  return {
    total: ordered.length,
    page: clampPage(page, ordered.length, size),
    pages: pageCount(ordered.length, size),
    rows: pageSlice(ordered, page, size),
    all: ordered,
  };
}
