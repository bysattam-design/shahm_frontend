/**
 * How a figure and a moment are written, in one place.
 *
 * Eighteen places formatted their own, and most of them said nothing at all —
 * `toLocaleDateString()` with no locale follows whatever the browser is set
 * to, so the same record read `28/08/2026` on one machine and `8/28/2026` on
 * the next. The ones that did say something asked for `ar-SA`, which writes
 * its figures in Arabic-Indic digits: ٢٨ أغسطس ٢٠٢٦.
 *
 * The firm writes every figure in Latin digits — dates, counts, money, all of
 * them — so the locale carries `nu-latn` and the calendar is pinned to
 * Gregorian rather than left to the locale's default.
 */

/** Arabic wording, Latin figures, Gregorian calendar. */
const ARABIC = "ar-u-nu-latn-ca-gregory";
const ENGLISH = "en-GB-u-ca-gregory";

function localeFor(language) {
  return language === "ar" ? ARABIC : ENGLISH;
}

/**
 * The moment a value names, or null when it names none.
 *
 * `new Date(null)` is the epoch and `new Date("")` is the current moment, so
 * an empty field would otherwise be written out as a real date.
 */
function momentOf(value) {
  if (value === null || value === undefined || value === "") return null;

  const at = new Date(value);

  return Number.isNaN(at.getTime()) ? null : at;
}

/** A whole number, grouped, in Latin digits whatever the panel's language. */
export function formatNumber(value, language = "ar") {
  const number = Number(value);

  if (!Number.isFinite(number)) return "";

  return number.toLocaleString(localeFor(language));
}

/** A date: 28 أغسطس 2026 */
export function formatDate(value, language = "ar") {
  const at = momentOf(value);

  if (!at) return "";

  return at.toLocaleDateString(localeFor(language), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** A date and the time of day: 28 أغسطس 2026، 1:00 م */
export function formatDateTime(value, language = "ar") {
  const at = momentOf(value);

  if (!at) return "";

  return at.toLocaleString(localeFor(language), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** The time of day alone: 1:00 م */
export function formatTime(value, language = "ar") {
  const at = momentOf(value);

  if (!at) return "";

  return at.toLocaleTimeString(localeFor(language), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** A month and its year, for a calendar heading: أغسطس 2026 */
export function formatMonth(value, language = "ar") {
  const at = momentOf(value);

  if (!at) return "";

  return at.toLocaleDateString(localeFor(language), {
    month: "long",
    year: "numeric",
  });
}
