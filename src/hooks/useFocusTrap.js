import { useCallback, useEffect, useRef } from "react";

/**
 * Whether an element is on screen, walking up to the dialog itself.
 *
 * `offsetParent` is the usual test and it cannot be used: it reads null for
 * every element under a test renderer, which has no layout, so the trap would
 * hold nothing there and pass its own tests by finding nothing to hold.
 * Reading the computed style answers the same question in both.
 */
function isShown(element, limit) {
  let node = element;

  while (node && node !== limit.parentNode) {
    if (node.hidden || node.getAttribute?.("aria-hidden") === "true") return false;

    if (typeof window !== "undefined" && window.getComputedStyle) {
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return false;
    }

    node = node.parentElement;
  }

  return true;
}

/**
 * Keeps the keyboard inside an open dialog, and gives it back when it closes.
 *
 * A dialog that does not hold the keyboard is a dialog only to the eye. The
 * panel's own modal put 7 controls on the screen and left 38 behind it still
 * reachable by Tab: a reader working by keyboard opened the dialog, pressed
 * Tab, and walked out of it into a sidebar they could not see under the
 * backdrop — still typing, with no way of knowing where they were.
 *
 * Three things have to happen, and the panel did none of them:
 *
 *   on open   — the keyboard moves into the dialog. Leaving it on the button
 *               behind means the reader has to hunt for what just appeared.
 *   while open — Tab and Shift+Tab wrap at the ends rather than leaving.
 *   on close  — the keyboard goes back to what opened it, so the next Tab
 *               carries on from where the reader was rather than from the top
 *               of the page.
 *
 * @param {object}   options
 * @param {boolean}  options.active   whether the dialog is open
 * @param {function} options.onEscape called when Escape is pressed; omit it
 *                                    for a dialog that must be answered
 * @returns {object} the ref to put on the dialog element
 */
export default function useFocusTrap({ active, onEscape } = {}) {
  const container = useRef(null);
  const opener = useRef(null);
  const escape = useRef(onEscape);

  escape.current = onEscape;

  /** Everything inside that the keyboard can currently reach. */
  const reachable = useCallback(() => {
    const node = container.current;
    if (!node) return [];

    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    return [...node.querySelectorAll(selector)].filter((el) => isShown(el, node));
  }, []);

  // ── Moving in, and giving back ──────────────────────────────────────
  useEffect(() => {
    if (!active) return undefined;

    opener.current = document.activeElement;

    // Wait a frame: the dialog's own content may still be mounting, and
    // focusing an element that is about to be replaced puts the keyboard back
    // on the body.
    const frame = requestAnimationFrame(() => {
      const first = reachable()[0];

      if (first) first.focus();
      else if (container.current) {
        container.current.setAttribute("tabindex", "-1");
        container.current.focus();
      }
    });

    return () => {
      cancelAnimationFrame(frame);

      const back = opener.current;
      opener.current = null;

      // Only give the keyboard back if it is still inside the dialog. A close
      // that followed the reader clicking something else must not drag them
      // away from it.
      if (back && typeof back.focus === "function" && document.contains(back)) {
        back.focus();
      }
    };
  }, [active, reachable]);

  // ── Holding it ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (escape.current) {
          event.stopPropagation();
          escape.current();
        }
        return;
      }

      if (event.key !== "Tab") return;

      const items = reachable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const here = document.activeElement;

      // Wrap at the ends, and pull the keyboard back in if it has already
      // slipped out — a click on the page behind can put it there.
      if (!container.current?.contains(here)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && here === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && here === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [active, reachable]);

  return container;
}
