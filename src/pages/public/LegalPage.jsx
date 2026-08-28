// src/pages/public/LegalPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { formatDate } from "../../utils/format";
import { getPublicLegal } from "../../api/legalApi";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import "../../styles/pages/legalpage.css";
import { sanitizeCmsHtml } from "../../utils/sanitizeHtml";
import LogoImage from "../../assets/images/logo/About&Legal.png";

export default function LegalPage() {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.language === "en";

  const [page, setPage] = useState(null);

  // openClause: pure UX accordion — does NOT affect content rendering
  const [openClause, setOpenClause] = useState(0);

  // Which sub-element is currently highlighted after a scroll-jump
  const [highlightedSubId, setHighlightedSubId] = useState(null);

  // Active subclause in sidebar (for visual indicator)
  const [activeSubId, setActiveSubId] = useState(null);

  const highlightTimerRef = useRef(null);

  useEffect(() => {
    loadPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when the route slug changes.
  }, [slug]);

  // Open first clause by default once page loads
  useEffect(() => {
    if (page?.sections?.length > 0) {
      setOpenClause(0);
    }
  }, [page]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(highlightTimerRef.current);
    };
  }, []);

  async function loadPage() {
    try {
      const res = await getPublicLegal(slug);
      setPage(res.data);
    } catch (err) {
      console.error("Legal load error:", err);
    }
  }

  // Scroll to a section or subsection anchor, then apply a temporary highlight
  const scrollToElement = useCallback((id, isSection = false) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    if (!isSection) {
      // Set sidebar active indicator
      setActiveSubId(id);

      // Apply content highlight
      setHighlightedSubId(id);
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedSubId(null);
      }, 2200);
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: page?.title_en || page?.title_ar,
        url: window.location.href,
      });
    }
  };

  const handlePrint = () => window.print();

  if (!page) return null;

  const title = isEnglish && page.title_en ? page.title_en : page.title_ar;

  // FIRST section title — fixed, never changes (req #3)
  const firstSectionTitle =
    page.sections?.[0]
      ? isEnglish
        ? page.sections[0].title_en
        : page.sections[0].title_ar
      : "";

  // Date formatted from page.created_at (req #6)
  const createdDate = page.created_at
    ? formatDate(page.created_at, isEnglish ? "en" : "ar")
    : null;

  return (
    <div className="legalpage-wrapper" dir={isEnglish ? "ltr" : "rtl"}>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content={isEnglish ? page.meta_description_en : page.meta_description_ar}
        />
      </Helmet>

      {/* ================= TITLE ================= */}
      <h1 className="legalpage-title">{title}</h1>

      {/* ================= BANNER (fixed 1100×330, centered) ================= */}
      <div className="legalpage-banner">
        <img src={LogoImage} alt="Logo" className="legalpage-banner-logo" />
      </div>

      {/* ================= HEADER ROW ================= */}
      <div className="legalpage-header-row">
        {/* Left: "Clauses" label */}
        <div className="legalpage-header-col">
          <h3 className="legalpage-header-title">{t("legalpage.clauses")}</h3>
          <div className="legalpage-header-divider" />
        </div>
        {/* Right: ALWAYS first section title — never changes (req #3) */}
        <div className="legalpage-header-col">
          <h3 className="legalpage-header-title">{firstSectionTitle}</h3>
          <div className="legalpage-header-divider legalpage-header-divider--right" />
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="legalpage-grid">

        {/* ===== SIDEBAR ===== */}
        <aside className="legalpage-sidebar">
          <div className="legalpage-clauses-list">
            {page.sections?.map((section, index) => {
              const sectionTitle =
                isEnglish && section.title_en ? section.title_en : section.title_ar;
              const isOpen = openClause === index;

              return (
                <div key={section.id} className="legalpage-clause-item">
                  {/* Main clause button — UX expand only, also scrolls to section */}
                  <button
                    className={`legalpage-clause-button${isOpen ? " legalpage-clause-button--active" : ""}`}
                    onClick={() => {
                      // Toggle accordion (pure UX — does NOT affect content rendering)
                      setOpenClause(isOpen ? null : index);
                      // Scroll to the matching section in the right column
                      scrollToElement(`section-${section.id}`, true);
                    }}
                  >
                    <span className="legalpage-clause-title">{sectionTitle}</span>
                    <svg
                      className={`legalpage-clause-arrow${isOpen ? " open" : ""}`}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Sub-divider */}
                  <div className="legalpage-clause-subdivider" />

                  {/* Subclauses — visible when section is open */}
                  {isOpen && (
                    <div className="legalpage-subclauses">
                      {section.subsections?.map((sub) => {
                        const subTitle =
                          isEnglish && sub.title_en ? sub.title_en : sub.title_ar;
                        const isActiveSub = activeSubId === `sub-${sub.id}`;
                        return (
                          <div
                            key={sub.id}
                            className={`legalpage-subclause-item${isActiveSub ? " legalpage-subclause-item--active" : ""}`}
                            onClick={() => scrollToElement(`sub-${sub.id}`, false)}
                          >
                            {subTitle}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ===== OPTION BY TOPIC ===== */}
          <div className="legalpage-option-section">
            <h4 className="legalpage-option-title">
              {t("legalpage.option_by_topic")}
            </h4>

            {/* Share + Print — identical to blogdetails action buttons */}
            <div className="legalpage-action-buttons">
              <button className="legalpage-action-btn" onClick={handleShare}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path
                    d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path
                    d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path
                    d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                <span className="legalpage-action-label">{t("legalpage.share")}</span>
              </button>

              <div className="legalpage-actions-divider" />

              <button className="legalpage-action-btn" onClick={handlePrint}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9V2H18V9M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path
                    d="M18 14H6V22H18V14Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                <span className="legalpage-action-label">{t("legalpage.print")}</span>
              </button>
            </div>

            {/* Date — from page.created_at, locale-aware */}
            {createdDate && (
              <div className="legalpage-option-date">{createdDate}</div>
            )}
          </div>
        </aside>

        {/* ===== CONTENT — ALL SECTIONS RENDERED AT ONCE (req #1) ===== */}
        <main className="legalpage-content">
          {page.sections?.map((section, index) => {
            const sectionTitle =
              isEnglish && section.title_en ? section.title_en : section.title_ar;

            return (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="legalpage-section"
              >
                {/* Section heading */}
                {index !== 0 && (
  <h2 className="legalpage-section-heading">
    {sectionTitle}
  </h2>
)}
                <div className="legalpage-section-divider" />

                {/* All subsections */}
                <div className="legalpage-section-content">
                  {section.subsections?.map((sub) => {
                    const subTitle =
                      isEnglish && sub.title_en ? sub.title_en : sub.title_ar;
                    const subContent =
                      isEnglish && sub.content_en ? sub.content_en : sub.content_ar;
                    const isHighlighted = highlightedSubId === `sub-${sub.id}`;

                    return (
                      <div
                        key={sub.id}
                        id={`sub-${sub.id}`}
                        className={`legalpage-subsection${isHighlighted ? " legalpage-subsection--target" : ""}`}
                      >
                        {subTitle && (
                          <h4 className="legalpage-subsection-title">{subTitle}</h4>
                        )}
                        {subContent && (
                          <div
                            className="legalpage-subsection-content"
                            dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(subContent) }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
