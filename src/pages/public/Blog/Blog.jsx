import React, { useEffect, useState, useRef, useCallback } from "react";
import { formatDate } from "../../../utils/format";
import { getPublicPosts, getPublicBlogSettings, getPublicCategories } from "../../../api/publicApi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../../styles/pages/blog.css";

// ─── Blog Card (shared) ───────────────────────────────────────────────────────
function BlogCard({ post, isEnglish, variant = "normal" }) {
  const title = isEnglish && post.title_en ? post.title_en : post.title_ar;
  const tagList = post.tags
    ?.map((tag) => (isEnglish ? tag.name_en : tag.name_ar))
    .join(", ");
  const category = isEnglish ? post.category?.name_en : post.category?.name_ar;
  const categoryColor = post.category?.color || "#353C3C";
  const date = formatDate(post.created_at, isEnglish ? "en" : "ar");
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`blog-card blog-card--${variant}`}
    >
      {post.cover_image_url && (
        <div className="blog-card__image">
          <img src={post.cover_image_url} alt={title} loading="lazy" />
        </div>
      )}
      <div className="blog-card__body">
        {tagList && <p className="blog-card__tags">{tagList}</p>}
        <h3 className="blog-card__title">{title}</h3>
        <div className="blog-card__meta">
          <div className="blog-card__category-group">
            <span
              className="blog-card__category-bar"
              style={{ backgroundColor: categoryColor }}
            />
            <span className="blog-card__category-name">{category}</span>
          </div>
          <span className="blog-card__date">{date}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Blog Component ──────────────────────────────────────────────────────
export default function Blog() {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.language === "en";
  const isRTL = i18n.dir() === "rtl";

  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageSettings, setPageSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const VISIBLE_CARDS = 3;

  // ── Responsive state ──────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [cardWidth, setCardWidth] = useState(0);
  const [cardGap, setCardGap] = useState(0);

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const progressTrackRef = useRef(null);

  // Touch / drag refs
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchStartSlide = useRef(0);
  const isDraggingProgress = useRef(false);
  // ── Measure real card dimensions from DOM ──────────────────────────────────
  const measureCards = useCallback(() => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll(".blog-card--hero");
    if (cards.length < 2) return;
    const r1 = cards[0].getBoundingClientRect();
    const r2 = cards[1].getBoundingClientRect();
    const w = r1.width;
    const gap = Math.abs(r2.left - r1.right);
    setCardWidth(w);
    setCardGap(gap);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      measureCards();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureCards]);

  useEffect(() => {
    // Measure after render / font load
    const timer = setTimeout(measureCards, 100);
    return () => clearTimeout(timer);
  }, [featuredPosts, measureCards]);


  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch page settings ────────────────────────────────────────────────────
  useEffect(() => {
    getPublicBlogSettings()
      .then((res) => setPageSettings(res.data))
      .catch(console.error);
  }, []);

  // ── Fetch categories ───────────────────────────────────────────────────────
  useEffect(() => {
    getPublicCategories()
      .then((res) => setCategories(res.data || []))
      .catch(console.error);
  }, []);

  // ── Fetch posts ───────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setCurrentSlide(0);
    getPublicPosts({
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(selectedCategory && { category_id: selectedCategory }),
      ...(selectedTag && { tag: selectedTag }),
    })
      .then((res) => {
        const allPosts = res.data || [];
        setPosts(allPosts);
        setFeaturedPosts(allPosts.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type, debouncedSearch, selectedCategory, selectedTag, i18n.language]);

  // ── Slider controls ────────────────────────────────────────────────────────
  const visibleCount = isMobile ? 1 : VISIBLE_CARDS;
  const maxSlide = Math.max(0, featuredPosts.length - visibleCount);

  const clampSlide = useCallback(
    (v) => Math.max(0, Math.min(maxSlide, v)),
    [maxSlide]
  );

  const prevSlide = () => setCurrentSlide((prev) => clampSlide(prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => clampSlide(prev + 1));

  // Step size for translation: card width + gap
  const stepSize = cardWidth + cardGap;


  const translateX =
    stepSize > 0
      ? (isRTL
        ? (currentSlide * stepSize)   // RTL
        : -(currentSlide * stepSize)) // LTR
      : 0;

  useEffect(() => {
    if (stepSize > 0) {
      setCurrentSlide(0);
    }
  }, [stepSize, isRTL]);

  useEffect(() => {
    if (!trackRef.current) return;

    const observer = new ResizeObserver(() => {
      measureCards();
    });

    observer.observe(trackRef.current);

    return () => observer.disconnect();
  }, [measureCards]);

  // ── Page body class ────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.add("blog-page-active");
    return () => document.body.classList.remove("blog-page-active");
  }, []);

  // ── Progress bar: click + drag ─────────────────────────────────────────────
  const getSlideFromPointer = useCallback((clientX) => {
    const track = progressTrackRef.current;
    if (!track || maxSlide === 0) return 0;
    const rect = track.getBoundingClientRect();
    let ratio;
    if (isRTL) {
      ratio = (rect.right - clientX) / rect.width;
    } else {
      ratio = (clientX - rect.left) / rect.width;
    }
    ratio = Math.max(0, Math.min(1, ratio));
    return Math.round(ratio * maxSlide);
  }, [maxSlide, isRTL]);

  const onProgressPointerDown = useCallback((e) => {
    isDraggingProgress.current = true;
    progressTrackRef.current?.classList.add("dragging");
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setCurrentSlide(getSlideFromPointer(clientX));
    e.preventDefault();
  }, [getSlideFromPointer]);

  const onProgressPointerMove = useCallback((e) => {
    if (!isDraggingProgress.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setCurrentSlide(getSlideFromPointer(clientX));
  }, [getSlideFromPointer]);

  const onProgressPointerUp = useCallback(() => {
    isDraggingProgress.current = false;
    progressTrackRef.current?.classList.remove("dragging");
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onProgressPointerMove);
    window.addEventListener("mouseup", onProgressPointerUp);
    window.addEventListener("touchmove", onProgressPointerMove, { passive: false });
    window.addEventListener("touchend", onProgressPointerUp);
    return () => {
      window.removeEventListener("mousemove", onProgressPointerMove);
      window.removeEventListener("mouseup", onProgressPointerUp);
      window.removeEventListener("touchmove", onProgressPointerMove);
      window.removeEventListener("touchend", onProgressPointerUp);
    };
  }, [onProgressPointerMove, onProgressPointerUp]);

  // ── Touch swipe on slider viewport ────────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartSlide.current = currentSlide;
    if (trackRef.current) {
      trackRef.current.classList.add("dragging");
    }
  }, [currentSlide]);

  const onTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return;

    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dx) < 10) return;

    e.preventDefault();

    if (trackRef.current && stepSize > 0) {
      const offset = -(touchStartSlide.current * stepSize) - dx;
      trackRef.current.style.transform = `translateX(${offset}px)`;
    }
  }, [stepSize]);



  const onTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;
    if (trackRef.current) {
      trackRef.current.classList.remove("dragging");
    }
    if (Math.abs(dx) > threshold) {
      // RTL: swipe right = next, swipe left = prev
      // LTR: swipe left = next, swipe right = prev
      const dir = dx < 0 ? 1 : -1;
      setCurrentSlide((prev) => clampSlide(prev + dir));
    } else {
      // Snap back
      setCurrentSlide(touchStartSlide.current);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [clampSlide]);

  // ── Progress bar position ──────────────────────────────────────────────────
  const progressPercent = featuredPosts.length > 1 && maxSlide > 0
    ? Math.max(4, (currentSlide / maxSlide) * 100)
    : 100;

  // Thumb position: left% or right% for RTL
  const thumbStyle = isRTL
    ? { right: `${progressPercent}%`, left: "auto" }
    : { left: `${progressPercent}%` };

  // ── RTL-aware arrows ───────────────────────────────────────────────────────
  // In RTL: the "previous" arrow visually points right (→) and the "next" arrow points left (←)
  const ArrowLeft = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 12H4M10 6L4 12L10 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const ArrowRight = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12H20M14 6L20 12L14 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // LTR: prev = left arrow, next = right arrow
  // RTL: prev = right arrow (go back in RTL direction), next = left arrow
  const PrevArrowIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const PrevArrow = (
    <button
      key="prev"
      className="blog-slider__arrow blog-slider__arrow--prev"
      onClick={prevSlide}
      disabled={currentSlide === 0}
      aria-label={t("blog.previous") || "Previous"}
    >
      {PrevArrowIcon}
    </button>
  );

  const NextArrow = (
    <button
      key="next"
      className="blog-slider__arrow blog-slider__arrow--next"
      onClick={nextSlide}
      disabled={currentSlide >= maxSlide}
      aria-label={t("blog.next") || "Next"}
    >
      {NextArrowIcon}
    </button>
  );

  const arrows = isRTL
    ? [NextArrow, PrevArrow]
    : [PrevArrow, NextArrow];
  // ── Progress bar element ───────────────────────────────────────────────────
  const progressBar = (
    <div
      className="blog-slider__progress-track"
      ref={progressTrackRef}
      onMouseDown={onProgressPointerDown}
      onTouchStart={onProgressPointerDown}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={maxSlide}
      aria-valuenow={currentSlide}
      aria-label={t("blog.slider_progress") || "Slider progress"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") isRTL ? prevSlide() : nextSlide();
        if (e.key === "ArrowLeft") isRTL ? nextSlide() : prevSlide();
      }}
    >
      <div
        className="blog-slider__progress-bar"
        style={isRTL
          ? { right: 0, width: `${progressPercent}%`, left: "auto" }
          : { width: `${progressPercent}%` }
        }
      />
      <div
        className="blog-slider__progress-thumb"
        style={thumbStyle}
      />
    </div>
  );

  return (
    <div className="blog-page" dir={isRTL ? "rtl" : "ltr"}>
      {/* ═══════════════════════════ HERO ══════════════════════════════════ */}
      <section className="blog-hero">
        <div className="blog-hero__inner">
          {/* Title */}
          <h1 className="blog-hero__title">
            {isEnglish
              ? pageSettings?.page_title_en
              : pageSettings?.page_title_ar}
          </h1>

          {/* Divider */}
          <div className="blog-hero__divider" />

          {/* Last Update */}
          <div className="blog-hero__last-update">
            <h2 className="blog-hero__last-update-title">
              {isEnglish
                ? pageSettings?.last_update_title_en
                : pageSettings?.last_update_title_ar}
            </h2>
            <p className="blog-hero__last-update-desc">
              {isEnglish
                ? pageSettings?.last_update_description_en
                : pageSettings?.last_update_description_ar}
            </p>
          </div>

          {/* Slider controls row */}
          <div className="blog-slider__controls-row">
            {progressBar}
            {!isMobile && (
              <div className="blog-slider__arrows">{arrows}</div>
            )}
          </div>

          {/* Slider viewport */}
          <div
            className="blog-slider__viewport"
            ref={viewportRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="blog-slider__track"
              ref={trackRef}
              style={{ transform: `translateX(${translateX}px)` }}
            >
              {featuredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  isEnglish={isEnglish}
                  variant="hero"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ BROWSE ═════════════════════════════════ */}
      <section className="blog-browse">
        <div className="blog-browse__inner">
          {/* Search */}
          <div className="blog-search">
            <svg
              className="blog-search__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M20 20L16.5 16.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              className="blog-search__input"
              placeholder={t("blog.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Browse by Topic label */}
          <p className="blog-browse__label">{t("blog.browse_by_topic")}</p>

          {/* Category filters */}
          <div className="blog-categories">
            {/* ALL */}
            <button
              className={`blog-categories__item ${selectedCategory === "" ? "blog-categories__item--active" : ""
                }`}
              onClick={() => setSelectedCategory("")}
            >
              <span className="blog-categories__icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              <span className="blog-categories__label">{t("blog.all")}</span>
            </button>

            {categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <div className="blog-categories__divider" />
                <button
                  className={`blog-categories__item ${selectedCategory === cat.id
                    ? "blog-categories__item--active"
                    : ""
                    }`}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? "" : cat.id
                    )
                  }
                >
                  {cat.icon_url && (
                    <span className="blog-categories__icon">
                      <img src={cat.icon_url} alt="" width="24" height="24" />
                    </span>
                  )}
                  <span className="blog-categories__label">
                    {isEnglish ? cat.name_en : cat.name_ar}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ GRID ═══════════════════════════════════ */}
      <section className="blog-grid-section">
        <div className="blog-grid__inner">
          {loading ? (
            <div className="blog-grid__loading">
              <span className="blog-grid__spinner" />
            </div>
          ) : posts.length === 0 ? (
            <p className="blog-grid__empty">{t("blog.no_posts")}</p>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  isEnglish={isEnglish}
                  variant="normal"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
