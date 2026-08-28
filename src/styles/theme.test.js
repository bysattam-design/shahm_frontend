/**
 * The ratios the appearance layer promises, measured against the file that
 * makes them rather than against a note about it.
 *
 * The evening inks are translucent white. Measuring one of those as if it were
 * opaque is the mistake that was actually made here once: the faint ink
 * reported 10.56 and read at 3.47, which is under the line. So the alpha is
 * composited onto the ground first, and the test below also checks that the
 * two ways of measuring genuinely disagree — if they ever stop disagreeing,
 * the inks have quietly become opaque and this guard has stopped guarding.
 */
const fs = require("fs");
const path = require("path");

const CSS = fs.readFileSync(path.join(__dirname, "theme.css"), "utf8");

/** The declarations of one rule, by the selector that opens it. */
function block(selector) {
  const start = CSS.indexOf(selector);
  if (start < 0) throw new Error(`theme.css no longer carries ${selector}`);

  const open = CSS.indexOf("{", start);
  const close = CSS.indexOf("\n}", open);
  const body = CSS.slice(open, close);

  const out = {};
  const declaration = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let found = declaration.exec(body);

  while (found) {
    out[found[1]] = found[2].trim();
    found = declaration.exec(body);
  }

  return out;
}

/** `var(--x, #fff)` is read as its fallback: that is what ships unless the
    reader has chosen otherwise in the settings. */
function colour(value) {
  const indirect = /^var\(\s*--[a-z0-9-]+\s*,\s*(.+)\)$/i.exec(value);
  const text = indirect ? indirect[1].trim() : value;

  const hex = /^#([0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], alpha: 1 };
  }

  const functional = /^rgba?\(([^)]+)\)$/i.exec(text);
  if (functional) {
    const parts = functional[1].split(",").map((p) => parseFloat(p));
    return { rgb: [parts[0], parts[1], parts[2]], alpha: parts[3] === undefined ? 1 : parts[3] };
  }

  throw new Error(`not a colour this test can read: ${value}`);
}

function composite(ink, ground) {
  if (ink.alpha === 1) return ink;

  return {
    rgb: ink.rgb.map((channel, index) => channel * ink.alpha + ground.rgb[index] * (1 - ink.alpha)),
    alpha: 1,
  };
}

function luminance({ rgb }) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const one = luminance(a);
  const two = luminance(b);
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
}

function reads(tokens, inkName, groundName) {
  const ground = colour(tokens[groundName]);
  const ink = colour(tokens[inkName]);
  return ratio(composite(ink, ground), ground);
}

const DAY = block(":root {");
const EVENING = block(':root[data-theme="dark"]');

const INKS = ["--t-ink", "--t-ink-secondary", "--t-ink-muted"];
const GROUNDS = ["--t-surface", "--t-ground", "--t-surface-sunk"];

describe("every level of ink reads on every ground it is put on", () => {
  describe.each([
    ["day", DAY],
    ["evening", EVENING],
  ])("%s", (name, tokens) => {
    test.each(GROUNDS.flatMap((ground) => INKS.map((ink) => [ink, ground])))(
      "%s on %s clears 4.5",
      (ink, ground) => {
        expect(reads(tokens, ink, ground)).toBeGreaterThanOrEqual(4.5);
      }
    );
  });

  test("the evening inks are translucent, so the measurement must composite", () => {
    const ground = colour(EVENING["--t-surface"]);
    const faint = colour(EVENING["--t-ink-muted"]);

    expect(faint.alpha).toBeLessThan(1);

    const honest = ratio(composite(faint, ground), ground);
    const naive = ratio(faint, ground);

    // Ignoring the alpha flatters the ink by better than half again.
    expect(naive).toBeGreaterThan(honest * 1.5);
  });

  test("the three levels stay in order, loudest to faintest", () => {
    [DAY, EVENING].forEach((tokens) => {
      const [strong, second, faint] = INKS.map((ink) => reads(tokens, ink, "--t-surface"));

      expect(strong).toBeGreaterThan(second);
      expect(second).toBeGreaterThan(faint);
    });
  });

  test("the evening ink is pure white, not a grey leaning towards it", () => {
    expect(EVENING["--t-ink"]).toBe("#ffffff");
  });
});

describe("what the appearance layer refuses to do", () => {
  test("nothing casts a shadow", () => {
    // A surface is told from the one behind it by a hairline and by the glass.
    expect(DAY["--t-shadow-card"]).toBe("none");
    expect(DAY["--t-shadow-raised"]).toBe("none");
    expect(DAY["--t-shadow-chrome"]).toBe("none");
  });

  test("what is chosen is ringed rather than filled", () => {
    expect(DAY["--t-ring"]).toContain("inset");
  });
});

/**
 * The semantic tones — success, warning, danger, info — are marks as much as
 * words, and the two are held to different lines: 4.5 for text, 3.0 for a
 * shape a reader only has to see.
 */
describe("the semantic tones", () => {
  const TONES = ["--t-success", "--t-warning", "--t-danger", "--t-info"];

  test.each(TONES)("%s carries a mark on the day surface", (tone) => {
    expect(reads(DAY, tone, "--t-surface")).toBeGreaterThanOrEqual(3);
  });

  test.each(TONES)("%s carries a mark on the evening surface", (tone) => {
    expect(reads(EVENING, tone, "--t-surface")).toBeGreaterThanOrEqual(3);
  });

  /* A finding, pinned here so it is not rediscovered by eye a third time. Four
     of the sixteen tone-on-ground pairs sit between the two lines: they are
     usable as a mark and not as small text. That is why the delete control in
     the users screen writes its word in ink and gives the tone to its icon.

     Raising a tone touches the appearance layer, which is frozen, so the list
     below records the state rather than asserting a wish. Change a tone and
     this test fails, which is the point: somebody has to look at the list
     again. */
  test("which tones are marks only, and where, is a list somebody decided", () => {
    const shortfall = [];

    [["day", DAY], ["evening", EVENING]].forEach(([side, tokens]) => {
      TONES.forEach((tone) => {
        ["--t-surface", "--t-ground"].forEach((ground) => {
          if (reads(tokens, tone, ground) < 4.5) shortfall.push(`${side} ${tone} on ${ground}`);
        });
      });
    });

    expect(shortfall.sort()).toEqual(
      [
        "day --t-success on --t-surface",
        "day --t-success on --t-ground",
        "day --t-info on --t-ground",
        "evening --t-danger on --t-surface",
        "evening --t-danger on --t-ground",
        "evening --t-info on --t-surface",
        "evening --t-info on --t-ground",
      ].sort()
    );
  });
});
