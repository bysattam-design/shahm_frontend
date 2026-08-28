/**
 * Guards the wording the panel shows.
 *
 * The two translation files had drifted three ways at once: English web jargon
 * carried into Arabic by sound (الهيرو، الهيدر، الفوتر، البانر، CTA، SEO)، the
 * firm called by a name that is not its name، and «العميل» where the firm's
 * standing term is «المستفيد». None of that shows up in a render test, because
 * every screen reads these files through a key.
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "public", "translation");

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
}

/** Every leaf string in the tree, with the key path that reaches it. */
function leaves(node, prefix = "") {
  if (typeof node === "string") return [[prefix, node]];
  if (!node || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([key, value]) =>
    leaves(value, prefix ? `${prefix}.${key}` : key)
  );
}

const arabic = load("ar.json");
const english = load("en.json");
const arabicLeaves = leaves(arabic);
const englishLeaves = leaves(english);

function offending(entries, needle) {
  return entries.filter(([, text]) => text.includes(needle)).map(([key]) => key);
}

describe("the wording the panel shows", () => {
  // A reader of the Arabic panel met words that are not Arabic and name
  // nothing: الهيرو for the opening section, الهيدر for the masthead, الفوتر
  // for the tail, البانر for a strip of image.
  test.each([
    ["هيرو", "الواجهة الرئيسية"],
    ["هيدر", "الترويسة"],
    ["فوتر", "التذييل"],
    ["بانر", "اللافتة"],
  ])("Arabic carries no «%s» — it says %s", (transliteration) => {
    expect(offending(arabicLeaves, transliteration)).toEqual([]);
  });

  // An English acronym inside an Arabic sentence is unreadable to a reader who
  // does not already know the English.
  test.each(["CTA", "SEO", "Slug"])(
    "Arabic carries no bare «%s»",
    (acronym) => {
      expect(offending(arabicLeaves, acronym)).toEqual([]);
    }
  );

  // The firm is «شركة شهم محامون ومستشارون», never «مكتب», and the English
  // side names it «Shahm Attorneys & Consultants».
  test("the firm is never called a مكتب", () => {
    const hits = arabicLeaves
      .filter(([, text]) => /مكتب\s*(شاهم|شهم)|عنوان المكتب/.test(text))
      .map(([key]) => key);
    expect(hits).toEqual([]);
  });

  test("the firm is not called by a name that is not its own", () => {
    expect(offending(englishLeaves, "Attorneys at Law")).toEqual([]);
    expect(offending(arabicLeaves, "شاهم")).toEqual([]);
  });

  // Arbitration was taken out of the firm's work, so the panel does not offer
  // an arbitration blog.
  test("nothing offers arbitration", () => {
    expect(offending(arabicLeaves, "التحكيم")).toEqual([]);
    expect(offending(englishLeaves, "arbitration")).toEqual([]);
  });

  // The firm's standing term for the person it serves.
  test("the person served is المستفيد, not العميل", () => {
    const hits = arabicLeaves
      .filter(([, text]) => /عميل|عملاء/.test(text))
      .map(([key]) => key);
    expect(hits).toEqual([]);
  });

  test("the English side says beneficiary as well", () => {
    const hits = englishLeaves
      .filter(([, text]) => /\bclients?\b/i.test(text))
      .map(([key]) => key);
    expect(hits).toEqual([]);
  });

  // The four states every screen owes its reader, in one place so no screen
  // has to invent its own wording for «it failed» or «there is nothing».
  test("both files carry the shared states section", () => {
    const wanted = [
      "loading",
      "empty",
      "empty_hint",
      "error_title",
      "error_hint",
      "retry",
      "save_failed",
      "field_rejected",
    ];
    expect(Object.keys(arabic.states).sort()).toEqual([...wanted].sort());
    expect(Object.keys(english.states).sort()).toEqual([...wanted].sort());
  });

  test("neither file lost a key", () => {
    expect(arabicLeaves.length).toBeGreaterThan(2400);
    expect(englishLeaves.length).toBeGreaterThan(2400);
  });
});
