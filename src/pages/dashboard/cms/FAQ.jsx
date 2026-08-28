import React, { useEffect, useState, useRef } from "react";
import UploadLimits, { PICTURE_ACCEPT } from "../../../components/forms/cms/UploadLimits";
import { useTranslation } from "react-i18next";
import { useFaqCmsStore } from "../../../store/useFaqCmsStore";
import toast from "react-hot-toast";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import "../../../styles/dashboard/cms/faq.css";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";
import Editbtn from "../../../components/common/dashboard/Editbtn";

// ─── Icon Components ─────────────────────────────────────────────────────────
const Icon = {
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
    </svg>
  ),
  Folder: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1.5 3.75A1.5 1.5 0 013 2.25h4.5l1.5 2.25H15A1.5 1.5 0 0116.5 6v8.25A1.5 1.5 0 0115 15.75H3a1.5 1.5 0 01-1.5-1.5V3.75z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  QuestionMark: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.75 6.75a2.25 2.25 0 014.5 0c0 1.5-2.25 1.875-2.25 3.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="13.5" r=".75" fill="currentColor" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  /* ── Modern Edit pen icon ── */
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.2583 3.75L16.5 7.00001M2.25 21.75L3.64706 16.6765L15.5294 4.79412C15.7347 4.58881 16.0128 4.47354 16.3029 4.47354C16.5931 4.47354 16.8712 4.58881 17.0765 4.79412L19.2059 6.92353C19.4112 7.12882 19.5265 7.40693 19.5265 7.69706C19.5265 7.98719 19.4112 8.2653 19.2059 8.47059L7.32353 20.3529L2.25 21.75Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),
  /* ── Modern Trash bin icon (provided SVG) ── */
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 2 C 18.35503 2 17 3.3550302 17 5 L 17 7 L 4 7 A 1.0001 1.0001 0 1 0 4 9 L 17.832031 9 A 1.0001 1.0001 0 0 0 18.158203 9 L 29.832031 9 A 1.0001 1.0001 0 0 0 30.158203 9 L 44 9 A 1.0001 1.0001 0 1 0 44 7 L 31 7 L 31 5 C 31 3.3550302 29.64497 2 28 2 L 20 2 z M 20 4 L 28 4 C 28.56503 4 29 4.4349698 29 5 L 29 7 L 19 7 L 19 5 C 19 4.4349698 19.43497 4 20 4 z M 6.9804688 10.986328 A 1.0001 1.0001 0 0 0 5.9941406 12.09375 L 8.6640625 40.462891 C 8.900709 43.030242 11.061274 45 13.640625 45 L 34.359375 45 C 36.938726 45 39.099291 43.030242 39.335938 40.462891 L 39.335938 40.460938 L 42.005859 12.09375 A 1.0004955 1.0004955 0 1 0 40.013672 11.90625 L 37.34375 40.275391 A 1.0001 1.0001 0 0 0 37.34375 40.279297 C 37.199488 41.851004 35.939375 43 34.359375 43 L 13.640625 43 C 12.060625 43 10.800512 41.850998 10.65625 40.279297 A 1.0001 1.0001 0 0 0 10.65625 40.275391 L 7.9863281 11.90625 A 1.0001 1.0001 0 0 0 6.9804688 10.986328 z" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Save: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 2.5L11 1H3a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 003 15h10a1.5 1.5 0 001.5-1.5V4.5l-1-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <rect x="4.5" y="1" width="5" height="4" rx=".5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="3" y="9" width="10" height="6" rx=".5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  Image: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 10.5l4-3.5 3 2.5 2.5-2 3 4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  /* ChevronRight — CSS flips it in RTL via .faq-chevron-icon */
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="faq-chevron-icon">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Hash: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 5.5h9M2.5 8.5h9M5.5 2l-1 10M9.5 2l-1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Tag: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7.5 1.5H12.5V6.5L7 12a1 1 0 01-1.5 0L1 7.5a1 1 0 010-1.5L7.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="10" cy="4" r="1" fill="currentColor" />
    </svg>
  ),
  Layers: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l6 3-6 3-6-3 6-3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2 10l6 3 6-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 7.5l6 3 6-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 8h2.5l2-5 3 10 2-7 1.5 2H14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, delay = 0 }) {
  return (
    <div className={`faq-stat-card faq-stat-card--${accent}`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`faq-stat-icon faq-stat-icon--${accent}`}>{icon}</div>
      <div className="faq-stat-body">
        <span className="faq-stat-value">{value}</span>
        <span className="faq-stat-label">{label}</span>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function StatusBadge({ active, t }) {
  return (
    <span className={`faq-badge ${active ? "faq-badge--active" : "faq-badge--inactive"}`}>
      <span className="faq-badge-dot" />
      {active ? t("cms.faq.status.active") : t("cms.faq.status.inactive")}
    </span>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div className="faq-empty">
      <div className="faq-empty-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" opacity=".3" />
          <path d="M14 17a6 6 0 0112 0c0 4-6 5-6 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".5" />
          <circle cx="20" cy="31" r="1.5" fill="currentColor" opacity=".5" />
        </svg>
      </div>
      <p>{message}</p>
    </div>
  );
}

// ─── Form Section Divider ─────────────────────────────────────────────────────
function SectionDivider({ icon, label }) {
  return (
    <div className="faq-form-section-divider">
      <span className="faq-form-section-icon">{icon}</span>
      <span className="faq-form-section-label">{label}</span>
      <div className="faq-form-section-line" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FAQCms() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { alert, show } = useSweetAlert();

  const {
    faqs,
    fetchFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useFaqCmsStore();

  const [activeTab, setActiveTab] = useState("overview");

  const [faqEdit, setFaqEdit] = useState(null);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqForm, setFaqForm] = useState({
    category: "", question_ar: "", question_en: "",
    answer_ar: "", answer_en: "", order: 0, is_active: true,
  });

  const [catEdit, setCatEdit] = useState(null);
  const [catSaving, setCatSaving] = useState(false);
  const [catIconPreview, setCatIconPreview] = useState(null);
  const [catIconFile, setCatIconFile] = useState(null);
  const [catForm, setCatForm] = useState({
    title_ar: "", title_en: "", slug: "", order: 0, is_active: true,
  });

  const faqFormRef = useRef(null);
  const catFormRef = useRef(null);

  useEffect(() => { fetchFaqs(); fetchCategories(); }, [fetchFaqs, fetchCategories]);

  const totalCategories = categories.length;
  const totalQuestions = faqs.length;
  const activeQuestions = faqs.filter((f) => f.is_active).length;
  const inactiveQuestions = faqs.filter((f) => !f.is_active).length;

  // ─── FAQ Handlers ──────────────────────────────────────────────────────────
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    setFaqSaving(true);
    try {
      const res = faqEdit ? await updateFaq(faqEdit.id, faqForm) : await createFaq(faqForm);
      if (res.success) { toast.success(t("cms.faq.success.saved")); resetFaqForm(); }
    } catch { toast.error(t("cms.faq.error.save_failed")); }
    finally { setFaqSaving(false); }
  };

  const handleFaqEdit = (f) => {
    setFaqEdit(f);
    setFaqForm({
      category: f.category || "", question_ar: f.question_ar, question_en: f.question_en,
      answer_ar: f.answer_ar, answer_en: f.answer_en, order: f.order, is_active: f.is_active,
    });
    setActiveTab("questions");
    setTimeout(() => faqFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleFaqDelete = async (id) => {
    const confirmed = await show({
      type: "confirm",
      title: t("cms.faq.confirm_delete_title"),
      message: t("cms.faq.confirm_delete_text"),
      confirmText: t("cms.faq.delete_button"),
      cancelText: t("cms.faq.cancel_button"),
      showCancel: true,
    });
    if (confirmed) { const res = await deleteFaq(id); if (res.success) toast.success(t("cms.faq.success.deleted")); }
  };

  const resetFaqForm = () => {
    setFaqEdit(null);
    setFaqForm({ category: "", question_ar: "", question_en: "", answer_ar: "", answer_en: "", order: 0, is_active: true });
  };

  // ─── Category Handlers ─────────────────────────────────────────────────────
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setCatSaving(true);
    try {
      const fd = new FormData();
      fd.append("title_ar", catForm.title_ar);
      fd.append("title_en", catForm.title_en);
      if (catForm.slug) fd.append("slug", catForm.slug);
      fd.append("order", catForm.order);
      fd.append("is_active", catForm.is_active);
      if (catIconFile) fd.append("icon", catIconFile);
      const res = catEdit ? await updateCategory(catEdit.id, fd) : await createCategory(fd);
      if (res.success) { toast.success(t("cms.faq.success.saved")); resetCatForm(); }
    } catch { toast.error(t("cms.faq.error.save_failed")); }
    finally { setCatSaving(false); }
  };

  const handleCatEdit = (c) => {
    setCatEdit(c);
    setCatForm({ title_ar: c.title_ar, title_en: c.title_en, slug: c.slug || "", order: c.order, is_active: c.is_active });
    setCatIconPreview(c.icon_url || null);
    setCatIconFile(null);
    catFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCatDelete = async (id) => {
    const confirmed = await show({
      type: "confirm",
      title: t("cms.faq.category.confirm_delete_title"),
      message: t("cms.faq.category.confirm_delete_text"),
      confirmText: t("cms.faq.delete_button"),
      cancelText: t("cms.faq.cancel_button"),
      showCancel: true,
    });
    if (confirmed) { const res = await deleteCategory(id); if (res.success) toast.success(t("cms.faq.success.deleted")); }
  };

  const resetCatForm = () => {
    setCatEdit(null);
    setCatForm({ title_ar: "", title_en: "", slug: "", order: 0, is_active: true });
    setCatIconPreview(null); setCatIconFile(null);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCatIconFile(file);
    setCatIconPreview(URL.createObjectURL(file));
  };

  const tabs = [
    { key: "overview", label: t("cms.faq.tabs.overview"), icon: <Icon.Grid /> },
    { key: "categories", label: t("cms.faq.tabs.categories"), icon: <Icon.Folder /> },
    { key: "questions", label: t("cms.faq.tabs.questions"), icon: <Icon.QuestionMark /> },
  ];

  const getCatName = (id) => {
    const cat = categories.find((c) => String(c.id) === String(id));
    if (!cat) return "—";
    return isRtl ? cat.title_ar : cat.title_en;
  };

  return (
    <>
      {alert}

      <div className="faq-dashboard" dir={isRtl ? "rtl" : "ltr"}>

        {/* PAGE HEADER */}
        <div className="faq-page-header">
          <div className="faq-page-header-left">
            <div className="faq-page-header-icon"><Icon.Layers /></div>
            <div>
              <h1 className="faq-page-title">{t("cms.faq.title")}</h1>
              <p className="faq-page-subtitle">{t("cms.faq.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="faq-tabs-bar">
          <div className="faq-tabs-inner">
            {tabs.map((tab) => (
              <button key={tab.key}
                className={`faq-tab-btn ${activeTab === tab.key ? "faq-tab-btn--active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="faq-tab-btn-icon">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.key === "categories" && <span className="faq-tab-pill">{totalCategories}</span>}
                {tab.key === "questions" && <span className="faq-tab-pill">{totalQuestions}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="faq-tab-content faq-tab-content--animate">
            <div className="faq-stats-grid">
              <StatCard icon={<Icon.Folder />} label={t("cms.faq.overview.total_categories")} value={totalCategories} accent="blue" delay={0} />
              <StatCard icon={<Icon.Layers />} label={t("cms.faq.overview.total_questions")} value={totalQuestions} accent="purple" delay={60} />
              <StatCard icon={<Icon.Activity />} label={t("cms.faq.overview.active_questions")} value={activeQuestions} accent="green" delay={120} />
              <StatCard icon={<Icon.Hash />} label={t("cms.faq.overview.inactive_questions")} value={inactiveQuestions} accent="amber" delay={180} />
            </div>

            <div className="faq-overview-grid">
              {/* Recent Categories */}
              <div className="faq-card">
                <div className="faq-card-header">
                  <div className="faq-card-header-left">
                    <span className="faq-card-header-icon faq-card-header-icon--blue"><Icon.Folder /></span>
                    <h3 className="faq-card-title">{t("cms.faq.overview.recent_categories")}</h3>
                  </div>
                  <button className="faq-card-link-btn" onClick={() => setActiveTab("categories")}>
                    {t("cms.faq.overview.view_all")}<Icon.ChevronRight />
                  </button>
                </div>
                <div className="faq-card-body">
                  {categories.length === 0 ? <EmptyState message={t("cms.faq.category.empty")} /> : (
                    categories.slice(0, 5).map((c, i) => (
                      <div key={c.id} className="faq-overview-row" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="faq-overview-row-left">
                          {c.icon_url
                            ? <img src={c.icon_url} alt="" className="faq-overview-icon-img" />
                            : <div className="faq-overview-icon-placeholder"><Icon.Folder /></div>}
                          <div>
                            <p className="faq-overview-name">{isRtl ? c.title_ar : c.title_en}</p>
                            <p className="faq-overview-sub">{c.slug}</p>
                          </div>
                        </div>
                        <div className="faq-overview-row-right">
                          <StatusBadge active={c.is_active} t={t} />
                          <span className="faq-overview-count">{c.faqs?.length ?? 0} {t("cms.faq.overview.questions_count")}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Questions */}
              <div className="faq-card">
                <div className="faq-card-header">
                  <div className="faq-card-header-left">
                    <span className="faq-card-header-icon faq-card-header-icon--purple"><Icon.QuestionMark /></span>
                    <h3 className="faq-card-title">{t("cms.faq.overview.recent_questions")}</h3>
                  </div>
                  <button className="faq-card-link-btn" onClick={() => setActiveTab("questions")}>
                    {t("cms.faq.overview.view_all")}<Icon.ChevronRight />
                  </button>
                </div>
                <div className="faq-card-body">
                  {faqs.length === 0 ? <EmptyState message={t("cms.faq.empty")} /> : (
                    faqs.slice(0, 5).map((f, i) => (
                      <div key={f.id} className="faq-overview-row" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="faq-overview-row-left">
                          <div className="faq-overview-icon-placeholder faq-overview-icon-placeholder--purple"><Icon.QuestionMark /></div>
                          <div>
                            <p className="faq-overview-name">{isRtl ? f.question_ar : f.question_en}</p>
                            <span className="faq-cat-chip">{getCatName(f.category)}</span>
                          </div>
                        </div>
                        <div className="faq-overview-row-right">
                          <StatusBadge active={f.is_active} t={t} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {activeTab === "categories" && (
          <div className="faq-tab-content faq-tab-content--animate">
            <div className="faq-card faq-card--form" ref={catFormRef}>
              <div className="faq-card-header">
                <div className="faq-card-header-left">
                  <span className="faq-card-header-icon faq-card-header-icon--blue"><Icon.Folder /></span>
                  <h3 className="faq-card-title">{catEdit ? t("cms.faq.category.form_title_edit") : t("cms.faq.category.form_title_create")}</h3>
                </div>
                {catEdit && <button className="faq-icon-btn faq-icon-btn--ghost" onClick={resetCatForm}><Icon.X /></button>}
              </div>
              <form onSubmit={handleCatSubmit} className="faq-form">
                <SectionDivider icon={<Icon.Tag />} label={t("cms.faq.category.section_titles")} />
                <div className="faq-form-row">
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.category.fields.title_ar")}</label>
                    <input className="faq-input" dir="rtl" placeholder={t("cms.faq.category.placeholders.title_ar")} value={catForm.title_ar} onChange={(e) => setCatForm({ ...catForm, title_ar: e.target.value })} required />
                  </div>
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.category.fields.title_en")}</label>
                    <input className="faq-input" dir="ltr" placeholder={t("cms.faq.category.placeholders.title_en")} value={catForm.title_en} onChange={(e) => setCatForm({ ...catForm, title_en: e.target.value })} required />
                  </div>
                </div>
                <SectionDivider icon={<Icon.Hash />} label={t("cms.faq.category.section_settings")} />
                <div className="faq-form-row">
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.category.fields.slug")} <span className="faq-label-hint">{t("cms.faq.category.slug_hint")}</span></label>
                    <input className="faq-input" dir="ltr" placeholder={t("cms.faq.category.placeholders.slug")} value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} />
                  </div>
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.fields.order")}</label>
                    <input className="faq-input" type="number" min="0" placeholder="0" value={catForm.order} onChange={(e) => setCatForm({ ...catForm, order: e.target.value })} />
                  </div>
                </div>
                <SectionDivider icon={<Icon.Image />} label={t("cms.faq.category.section_media")} />
                <div className="faq-form-row">
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.category.fields.icon")}</label>
                    <div className="faq-file-row">
                      {catIconPreview && <div className="faq-icon-preview"><img src={catIconPreview} alt="preview" /></div>}
                      <label className="faq-file-label">
                        <Icon.Image /><span>{t("cms.faq.category.choose_icon")}</span>
                        <input type="file" accept={PICTURE_ACCEPT} className="faq-file-input" onChange={handleIconChange} />
                        <UploadLimits kind="icon" />
                      </label>
                    </div>
                  </div>
                  <div className="faq-form-group faq-form-group--center">
                    <label className="faq-label">{t("cms.faq.fields.active")}</label>
                    <label className="faq-toggle">
                      <input type="checkbox" checked={catForm.is_active} onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })} />
                      <span className="faq-toggle-track"><span className="faq-toggle-thumb" /></span>
                      <span className="faq-toggle-label">{catForm.is_active ? t("cms.faq.status.active") : t("cms.faq.status.inactive")}</span>
                    </label>
                  </div>
                </div>
                <div className="faq-form-actions">
                  <button type="submit" className="faq-btn faq-btn--primary" disabled={catSaving}>
                    {catSaving ? <span className="faq-spinner" /> : <Icon.Save />}
                    {catEdit ? t("cms.faq.actions.update") : t("cms.faq.actions.create")}
                  </button>
                  {catEdit && <button type="button" className="faq-btn faq-btn--ghost" onClick={resetCatForm}><Icon.X />{t("cms.faq.actions.cancel")}</button>}
                </div>
              </form>
            </div>

            <div className="faq-card">
              <div className="faq-card-header">
                <div className="faq-card-header-left">
                  <span className="faq-card-header-icon faq-card-header-icon--blue"><Icon.Layers /></span>
                  <h3 className="faq-card-title">{t("cms.faq.category.list_title")}</h3>
                </div>
                <span className="faq-count-badge">{categories.length}</span>
              </div>
              {categories.length === 0 ? <EmptyState message={t("cms.faq.category.empty")} /> : (
                <div className="faq-table-wrapper">
                  <table className="faq-table">
                    <thead>
                      <tr>
                        <th>{t("cms.faq.category.table.icon")}</th>
                        <th>{t("cms.faq.category.table.title_ar")}</th>
                        <th>{t("cms.faq.category.table.title_en")}</th>
                        <th>{t("cms.faq.category.table.slug")}</th>
                        <th>{t("cms.faq.category.table.order")}</th>
                        <th>{t("cms.faq.category.table.status")}</th>
                        <th>{t("cms.faq.category.table.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c, i) => (
                        <tr key={c.id} style={{ animationDelay: `${i * 40}ms` }} className="faq-table-row--animate">
                          <td>{c.icon_url ? <img src={c.icon_url} alt="" className="faq-table-icon" /> : <div className="faq-table-icon-placeholder"><Icon.Folder /></div>}</td>
                          <td dir="rtl" className="faq-cell-ar">{c.title_ar}</td>
                          <td className="faq-cell-en">{c.title_en}</td>
                          <td><code className="faq-slug-code">{c.slug}</code></td>
                          <td><span className="faq-order-chip">{c.order}</span></td>
                          <td><StatusBadge active={c.is_active} t={t} /></td>
                          <td>
                            <div className="faq-actions-cell">
                              <Editbtn
                                onClick={() => handleCatEdit(c)}
                              />
                              <Deletebtn
                                onConfirm={() => handleCatDelete(c.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {activeTab === "questions" && (
          <div className="faq-tab-content faq-tab-content--animate">
            <div className="faq-card faq-card--form" ref={faqFormRef}>
              <div className="faq-card-header">
                <div className="faq-card-header-left">
                  <span className="faq-card-header-icon faq-card-header-icon--purple"><Icon.QuestionMark /></span>
                  <h3 className="faq-card-title">{faqEdit ? t("cms.faq.form_title_edit") : t("cms.faq.form_title_create")}</h3>
                </div>
                {faqEdit && <button className="faq-icon-btn faq-icon-btn--ghost" onClick={resetFaqForm}><Icon.X /></button>}
              </div>
              <form onSubmit={handleFaqSubmit} className="faq-form">
                <SectionDivider icon={<Icon.QuestionMark />} label={t("cms.faq.section_questions")} />
                <div className="faq-form-row">
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.fields.question_ar")}</label>
                    <input className="faq-input" dir="rtl" placeholder={t("cms.faq.placeholders.question_ar")} value={faqForm.question_ar} onChange={(e) => setFaqForm({ ...faqForm, question_ar: e.target.value })} required />
                  </div>
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.fields.question_en")}</label>
                    <input className="faq-input" dir="ltr" placeholder={t("cms.faq.placeholders.question_en")} value={faqForm.question_en} onChange={(e) => setFaqForm({ ...faqForm, question_en: e.target.value })} required />
                  </div>
                </div>
                <SectionDivider icon={<Icon.Layers />} label={t("cms.faq.section_answers")} />
                <div className="faq-form-row">
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.fields.answer_ar")}</label>
                    <textarea className="faq-textarea" dir="rtl" placeholder={t("cms.faq.placeholders.answer_ar")} value={faqForm.answer_ar} onChange={(e) => setFaqForm({ ...faqForm, answer_ar: e.target.value })} required />
                  </div>
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.fields.answer_en")}</label>
                    <textarea className="faq-textarea" dir="ltr" placeholder={t("cms.faq.placeholders.answer_en")} value={faqForm.answer_en} onChange={(e) => setFaqForm({ ...faqForm, answer_en: e.target.value })} required />
                  </div>
                </div>
                <SectionDivider icon={<Icon.Hash />} label={t("cms.faq.section_settings")} />
                <div className="faq-form-row">
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.fields.category")}</label>
                    <select className="faq-input faq-select" value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} required>
                      <option value="">{t("cms.faq.placeholders.category")}</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{isRtl ? c.title_ar : c.title_en}</option>)}
                    </select>
                  </div>
                  <div className="faq-form-group">
                    <label className="faq-label">{t("cms.faq.fields.order")}</label>
                    <input className="faq-input" type="number" min="0" placeholder="0" value={faqForm.order} onChange={(e) => setFaqForm({ ...faqForm, order: e.target.value })} />
                  </div>
                </div>
                <div className="faq-form-row">
                  <div className="faq-form-group faq-form-group--center">
                    <label className="faq-label">{t("cms.faq.fields.active")}</label>
                    <label className="faq-toggle">
                      <input type="checkbox" checked={faqForm.is_active} onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })} />
                      <span className="faq-toggle-track"><span className="faq-toggle-thumb" /></span>
                      <span className="faq-toggle-label">{faqForm.is_active ? t("cms.faq.status.active") : t("cms.faq.status.inactive")}</span>
                    </label>
                  </div>
                  <div className="faq-form-spacer" aria-hidden="true" />
                </div>
                <div className="faq-form-actions">
                  <button type="submit" className="faq-btn faq-btn--primary" disabled={faqSaving}>
                    {faqSaving ? <span className="faq-spinner" /> : <Icon.Save />}
                    {faqEdit ? t("cms.faq.actions.update") : t("cms.faq.actions.create")}
                  </button>
                  {faqEdit && <button type="button" className="faq-btn faq-btn--ghost" onClick={resetFaqForm}><Icon.X />{t("cms.faq.actions.cancel")}</button>}
                </div>
              </form>
            </div>

            <div className="faq-card">
              <div className="faq-card-header">
                <div className="faq-card-header-left">
                  <span className="faq-card-header-icon faq-card-header-icon--purple"><Icon.Layers /></span>
                  <h3 className="faq-card-title">{t("cms.faq.list_title")}</h3>
                </div>
                <span className="faq-count-badge">{faqs.length}</span>
              </div>
              {faqs.length === 0 ? <EmptyState message={t("cms.faq.empty")} /> : (
                <div className="faq-questions-list">
                  {faqs.map((f, i) => (
                    <div key={f.id} className="faq-question-card" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="faq-question-card-top">
                        <div className="faq-question-card-main">
                          <p className="faq-question-text">{isRtl ? f.question_ar : f.question_en}</p>
                          <p className="faq-answer-preview">
                            {(isRtl ? f.answer_ar : f.answer_en)?.slice(0, 120)}
                            {(isRtl ? f.answer_ar : f.answer_en)?.length > 120 ? "…" : ""}
                          </p>
                        </div>
                        <div className="faq-question-card-actions">
                          <Editbtn
                            onClick={() => handleFaqEdit(f)}
                          />
                          <Deletebtn
                            onConfirm={() => handleFaqDelete(f.id)}
                          />
                        </div>
                      </div>
                      <div className="faq-question-card-footer">
                        <span className="faq-cat-chip"><Icon.Tag /> {getCatName(f.category)}</span>
                        <span className="faq-order-chip"><Icon.Hash /> {f.order}</span>
                        <StatusBadge active={f.is_active} t={t} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>

  );
}
