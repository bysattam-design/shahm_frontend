// src/components/modals/WelcomeModal.jsx
// Language selector modal — shown on first visit to every user.
// Blocks all page interaction until a language is chosen.
// Logo is imported directly from assets — no prop needed.

import React, { useEffect } from "react";
import useFocusTrap from "../../hooks/useFocusTrap";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/images/logo/WelcomeModal.png";
import "../../styles/common/welcome-modal.css"; // adjust path to your styles folder

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────────
const LANG_KEY = "shahm_selected_lang";

/** Returns true if the visitor has already chosen a language */
export function hasSelectedLanguage() {
  return !!localStorage.getItem(LANG_KEY);
}

/** Clears the saved choice (useful for testing) */
export function clearLanguageChoice() {
  localStorage.removeItem(LANG_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────
// WelcomeModal
// Props:
//   onSelect {fn} — called with "ar" | "en" after the user picks
// ─────────────────────────────────────────────────────────────────────────────
export default function WelcomeModal({ onSelect }) {
  const { t, i18n } = useTranslation();

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Block Escape — modal must not be dismissible without choosing
  useEffect(() => {
    const block = (e) => { if (e.key === "Escape") e.preventDefault(); };
    window.addEventListener("keydown", block, { capture: true });
    return () => window.removeEventListener("keydown", block, { capture: true });
  }, []);

  // The keyboard is held inside: this one has to be answered, so Tab must not
  // be able to leave it for a page the reader has not chosen a language for.
  // No `onEscape` — refusing Escape is the point of the dialog.
  const dialog = useFocusTrap({ active: true });

  const handleSelect = (lang) => {
    // 1. Persist choice
    localStorage.setItem(LANG_KEY, lang);
    // 2. Switch i18n language
    i18n.changeLanguage(lang);
    // 3. Sync document direction + lang attribute
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir  = dir;
    document.documentElement.lang = lang;
    document.body.dir             = dir;
    document.body.classList.remove("rtl", "ltr");
    document.body.classList.add(dir);
    // 4. Notify parent to unmount
    onSelect(lang);
  };

  return (
    // Backdrop — blocks all clicks behind the modal
    <div className="wlc-backdrop" onClick={(e) => e.stopPropagation()}>
      <div
        ref={dialog}
        className="wlc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wlc-title-en wlc-title-ar"
      >

        {/* Logo — imported from assets */}
        <img
          src={Logo}
          alt={t("welcome.logo_alt")}
          className="wlc-logo"
          draggable={false}
        />

        {/* Divider 1 — 44px below logo */}
        <div className="wlc-divider" aria-hidden="true" />

        {/* Bilingual grid: EN left | AR right */}
        <div className="wlc-content-grid">

          {/* EN column */}
          <div className="wlc-col-en">
            <p id="wlc-title-en" className="wlc-title-en">
              {t("welcome.title_en")}
            </p>
            <p className="wlc-subtitle-en">
              {t("welcome.subtitle_en")}
            </p>
          </div>

          {/* Vertical separator — CSS pseudo-element, no DOM node needed */}

          {/* AR column */}
          <div className="wlc-col-ar">
            <p id="wlc-title-ar" className="wlc-title-ar">
              {t("welcome.title_ar")}
            </p>
            <p className="wlc-subtitle-ar">
              {t("welcome.subtitle_ar")}
            </p>
          </div>

        </div>

        {/* Divider 2 — between content and buttons */}
        <div className="wlc-divider-mid" aria-hidden="true" />

        {/* Language buttons */}
        <div className="wlc-buttons">

          <button
            className="wlc-btn"
            onClick={() => handleSelect("ar")}
            lang="ar"
            dir="rtl"
          >
            {t("welcome.btn_ar")}
          </button>

          <button
            className="wlc-btn"
            onClick={() => handleSelect("en")}
            lang="en"
            dir="ltr"
          >
            {t("welcome.btn_en")}
          </button>

        </div>
      </div>
    </div>
  );
}