import { formatDate, formatDateTime, formatMonth, formatNumber, formatTime } from "./format";

const MOMENT = "2026-08-28T10:00:00Z";

/** Arabic-Indic digits: the ones the firm does not use. */
const EASTERN = /[٠-٩۰-۹]/;

describe("how a figure is written", () => {
  test("in Latin digits, whatever the panel's language", () => {
    expect(formatNumber(1234567, "ar")).toBe("1,234,567");
    expect(formatNumber(1234567, "en")).toBe("1,234,567");
  });

  test("never in Arabic-Indic digits", () => {
    // `ar-SA` writes ١٢٣٤٥٦٧, and that is what the panel showed.
    expect(formatNumber(1234567, "ar")).not.toMatch(EASTERN);
  });

  test("a value that is not a number comes back empty, not as NaN", () => {
    expect(formatNumber(undefined)).toBe("");
    expect(formatNumber("not a number")).toBe("");
  });

  test("zero is written, not treated as nothing", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

describe("how a moment is written", () => {
  test("Arabic wording with Latin figures", () => {
    const written = formatDate(MOMENT, "ar");

    expect(written).toContain("2026");
    expect(written).toContain("أغسطس");
    expect(written).not.toMatch(EASTERN);
  });

  test("English wording when the panel is English", () => {
    expect(formatDate(MOMENT, "en")).toContain("August");
    expect(formatDate(MOMENT, "en")).toContain("2026");
  });

  test("the calendar is Gregorian, not left to the locale", () => {
    // `ar-SA` defaults to the Hijri calendar, so the same record read 1448
    // in one place and 2026 in another.
    expect(formatDate(MOMENT, "ar")).toContain("2026");
    expect(formatMonth(MOMENT, "ar")).toContain("2026");
  });

  test("a date and time carry both, in Latin figures", () => {
    const written = formatDateTime(MOMENT, "ar");

    expect(written).toContain("2026");
    expect(written).not.toMatch(EASTERN);
  });

  test("a time alone is written in Latin figures", () => {
    expect(formatTime(MOMENT, "ar")).not.toMatch(EASTERN);
  });

  test("a month heading names the month and its year", () => {
    expect(formatMonth(MOMENT, "ar")).toContain("أغسطس");
  });

  test("a value that is not a date comes back empty, not as Invalid Date", () => {
    expect(formatDate("not a date")).toBe("");
    expect(formatDateTime(null)).toBe("");
    expect(formatMonth(undefined)).toBe("");
    expect(formatTime("")).toBe("");
  });
});
