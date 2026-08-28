// Dashboard SEO settings
import React, { useEffect, useState } from "react";
import UploadLimits, { PICTURE_ACCEPT } from "../../../components/forms/cms/UploadLimits";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  adminGetDefaultSEO,
  adminUpdateDefaultSEO,
  adminSEOList,
  adminCreateSEO,
  adminUpdateSEO,
  adminDeleteSEO,
  adminAllPages,
} from "../../../api/seoApi";
import "../../../styles/dashboard/cms/seo.css";

export default function SEO() {
  const { t, i18n } = useTranslation();

  const [defaultSEO, setDefaultSEO] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [seoPages, setSEOPages] = useState([]);

  const [selectedSlug, setSelectedSlug] = useState("");
  const [editingSEO, setEditingSEO] = useState(null);

  const [form, setForm] = useState({
    slug: "",
    meta_title: "",
    meta_description: "",
    keywords: "",
    og_title: "",
    og_description: "",
    og_image: null,
    canonical_url: "",
  });

  useEffect(() => {
    loadDefaultSEO();
    loadAllPages();
    loadSEOPages();
  }, []);

  const loadDefaultSEO = async () => {
    const res = await adminGetDefaultSEO();
    setDefaultSEO(res.data);
  };

  const loadAllPages = async () => {
    const res = await adminAllPages();
    setAllPages(res.data);
  };

  const loadSEOPages = async () => {
    const res = await adminSEOList();
    setSEOPages(res.data);
  };

  /* ================= DEFAULT SEO ================= */
  const handleDefaultChange = (e) => {
    const { name, value } = e.target;
    setDefaultSEO((prev) => ({ ...prev, [name]: value }));
  };

  const handleDefaultSave = async () => {
    try {
      await adminUpdateDefaultSEO(defaultSEO);
      toast.success(t("cms.seo.success.default_updated"));
    } catch {
      toast.error(t("cms.seo.errors.default_failed"));
    }
  };

  /* ================= PAGE SEO ================= */
  const handleSelectPage = (slug) => {
    setSelectedSlug(slug);

    const found = seoPages.find((p) => p.slug === slug);

    if (found) {
      setEditingSEO(found);
      setForm({
        slug: found.slug,
        meta_title: found.meta_title || "",
        meta_description: found.meta_description || "",
        keywords: found.keywords || "",
        og_title: found.og_title || "",
        og_description: found.og_description || "",
        og_image: null,
        canonical_url: found.canonical_url || "",
      });
    } else {
      setEditingSEO(null);
      setForm({
        slug,
        meta_title: "",
        meta_description: "",
        keywords: "",
        og_title: "",
        og_description: "",
        og_image: null,
        canonical_url: "",
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePageSEOSave = async () => {
    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) fd.append(key, form[key]);
    });

    let res;

    if (editingSEO) {
      res = await adminUpdateSEO(editingSEO.id, fd);
    } else {
      res = await adminCreateSEO(fd);
    }

    if (res.success !== false) {
      toast.success(
        editingSEO
          ? t("cms.seo.success.page_updated")
          : t("cms.seo.success.page_created")
      );
      loadSEOPages();
    } else {
      toast.error(t("cms.seo.errors.page_failed"));
    }
  };

  const handleDeletePageSEO = async () => {
    if (!editingSEO) return;

    const result = await Swal.fire({
      title: t("cms.seo.confirm_delete_title"),
      text: t("cms.seo.confirm_delete"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("cms.seo.actions.delete"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: i18n.language === "ar",
    });

    if (result.isConfirmed) {
      await adminDeleteSEO(editingSEO.id);
      Swal.fire({
        title: t("cms.seo.deleted_title"),
        text: t("cms.seo.success.page_deleted"),
        icon: "success",
        confirmButtonColor: "#22c55e",
      });
      loadSEOPages();
      setEditingSEO(null);
      setSelectedSlug("");
    }
  };

  return (
    <div className="dashboard-seo-container">
      <div className="dashboard-seo-header">
        <div className="dashboard-seo-header-content">
          <h1 className="dashboard-seo-title">{t("cms.seo.title")}</h1>
          <p className="dashboard-seo-subtitle">{t("cms.seo.subtitle")}</p>
        </div>
      </div>

      {/* ==================== DEFAULT SEO ==================== */}
      {defaultSEO && (
        <div className="dashboard-seo-card">
          <div className="dashboard-seo-card-header">
            <div className="dashboard-seo-card-header-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              <h2>{t("cms.seo.default_title")}</h2>
            </div>
          </div>

          <div className="dashboard-seo-form-section">
            <h3 className="dashboard-seo-section-title">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5Z" fill="currentColor"/>
              </svg>
              {t("cms.seo.sections.site_info")}
            </h3>

            <div className="dashboard-seo-form-grid">
              <div className="dashboard-seo-form-group">
                <label className="dashboard-seo-label">{t("cms.seo.fields.site_title")}</label>
                <input
                  className="dashboard-seo-input"
                  name="site_title"
                  value={defaultSEO.site_title || ""}
                  onChange={handleDefaultChange}
                  placeholder={t("cms.seo.placeholders.site_title")}
                />
              </div>

              <div className="dashboard-seo-form-group">
                <label className="dashboard-seo-label">{t("cms.seo.fields.keywords")}</label>
                <input
                  className="dashboard-seo-input"
                  name="keywords"
                  value={defaultSEO.keywords || ""}
                  onChange={handleDefaultChange}
                  placeholder={t("cms.seo.placeholders.keywords")}
                />
              </div>

              <div className="dashboard-seo-form-group dashboard-seo-full-width">
                <label className="dashboard-seo-label">{t("cms.seo.fields.site_description")}</label>
                <textarea
                  className="dashboard-seo-textarea"
                  name="site_description"
                  value={defaultSEO.site_description || ""}
                  onChange={handleDefaultChange}
                  placeholder={t("cms.seo.placeholders.site_description")}
                  rows="4"
                />
              </div>
            </div>

            <div className="dashboard-seo-form-actions">
              <button className="dashboard-seo-btn-primary" onClick={handleDefaultSave}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15.75 8.0625V15.1875C15.75 15.4361 15.6512 15.6746 15.4754 15.8504C15.2996 16.0262 15.0611 16.125 14.8125 16.125H3.1875C2.93886 16.125 2.70041 16.0262 2.52459 15.8504C2.34878 15.6746 2.25 15.4361 2.25 15.1875V3.5625C2.25 3.31386 2.34878 3.07541 2.52459 2.89959C2.70041 2.72378 2.93886 2.625 3.1875 2.625H10.3125" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M13.5 1.5L16.5 4.5L8.25 12.75H5.25V9.75L13.5 1.5Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {t("cms.seo.actions.save_default")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAGE SEO ==================== */}
      <div className="dashboard-seo-card">
        <div className="dashboard-seo-card-header">
          <div className="dashboard-seo-card-header-left">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
            </svg>
            <h2>{t("cms.seo.page_title")}</h2>
          </div>
        </div>

        <div className="dashboard-seo-page-selector">
          <label className="dashboard-seo-label">{t("cms.seo.select_page")}</label>
          <select
            className="dashboard-seo-select"
            value={selectedSlug}
            onChange={(e) => handleSelectPage(e.target.value)}
          >
            <option value="">{t("cms.seo.select_page")}</option>
            {allPages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title} {p.has_seo ? "✔" : ""}
              </option>
            ))}
          </select>
        </div>

        {!selectedSlug && (
          <div className="dashboard-seo-empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M28 4H12C9.8 4 8 5.8 8 8V40C8 42.2 9.8 44 12 44H36C38.2 44 40 42.2 40 40V16L28 4Z" fill="currentColor"/>
            </svg>
            <p>{t("cms.seo.select_page_hint")}</p>
          </div>
        )}

        {selectedSlug && (
          <>
            {/* Meta Tags */}
            <div className="dashboard-seo-form-section">
              <h3 className="dashboard-seo-section-title">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M14 2H4C2.9 2 2 2.9 2 4V14C2 15.1 2.9 16 4 16H14C15.1 16 16 15.1 16 14V4C16 2.9 15.1 2 14 2Z" fill="currentColor"/>
                </svg>
                {t("cms.seo.sections.meta_tags")}
              </h3>

              <div className="dashboard-seo-form-grid">
                <div className="dashboard-seo-form-group">
                  <label className="dashboard-seo-label">{t("cms.seo.fields.meta_title")}</label>
                  <input
                    className="dashboard-seo-input"
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleFormChange}
                    placeholder={t("cms.seo.placeholders.meta_title")}
                  />
                </div>

                <div className="dashboard-seo-form-group">
                  <label className="dashboard-seo-label">{t("cms.seo.fields.keywords")}</label>
                  <input
                    className="dashboard-seo-input"
                    name="keywords"
                    value={form.keywords}
                    onChange={handleFormChange}
                    placeholder={t("cms.seo.placeholders.keywords")}
                  />
                </div>

                <div className="dashboard-seo-form-group dashboard-seo-full-width">
                  <label className="dashboard-seo-label">{t("cms.seo.fields.meta_description")}</label>
                  <textarea
                    className="dashboard-seo-textarea"
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleFormChange}
                    placeholder={t("cms.seo.placeholders.meta_description")}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div className="dashboard-seo-form-section">
              <h3 className="dashboard-seo-section-title">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M16.5 2.25H1.5C0.675 2.25 0 2.925 0 3.75V14.25C0 15.075 0.675 15.75 1.5 15.75H16.5C17.325 15.75 18 15.075 18 14.25V3.75C18 2.925 17.325 2.25 16.5 2.25Z" fill="currentColor"/>
                </svg>
                {t("cms.seo.sections.open_graph")}
              </h3>

              <div className="dashboard-seo-form-grid">
                <div className="dashboard-seo-form-group">
                  <label className="dashboard-seo-label">{t("cms.seo.fields.og_title")}</label>
                  <input
                    className="dashboard-seo-input"
                    name="og_title"
                    value={form.og_title}
                    onChange={handleFormChange}
                    placeholder={t("cms.seo.placeholders.og_title")}
                  />
                </div>

                <div className="dashboard-seo-form-group">
                  <label className="dashboard-seo-label">{t("cms.seo.fields.og_image")}</label>
                  <input
                    className="dashboard-seo-input"
                    type="file"
                    name="og_image"
                    onChange={handleFormChange}
                    accept={PICTURE_ACCEPT}
                  />
                    <UploadLimits kind="cover" />
                </div>

                <div className="dashboard-seo-form-group dashboard-seo-full-width">
                  <label className="dashboard-seo-label">{t("cms.seo.fields.og_description")}</label>
                  <textarea
                    className="dashboard-seo-textarea"
                    name="og_description"
                    value={form.og_description}
                    onChange={handleFormChange}
                    placeholder={t("cms.seo.placeholders.og_description")}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Advanced */}
            <div className="dashboard-seo-form-section">
              <h3 className="dashboard-seo-section-title">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15.19 10C15.19 10.12 15.18 10.24 15.17 10.36L16.82 11.63C16.96 11.74 17 11.93 16.92 12.09L15.35 14.91C15.27 15.07 15.09 15.13 14.92 15.07L13.01 14.34C12.62 14.65 12.2 14.92 11.74 15.13L11.46 17.18C11.44 17.36 11.29 17.5 11.11 17.5H7.97C7.79 17.5 7.64 17.36 7.62 17.18L7.34 15.13C6.88 14.92 6.46 14.65 6.07 14.34L4.16 15.07C3.99 15.13 3.81 15.07 3.73 14.91L2.16 12.09C2.08 11.93 2.12 11.74 2.26 11.63L3.91 10.36C3.9 10.24 3.89 10.12 3.89 10C3.89 9.88 3.9 9.76 3.91 9.64L2.26 8.37C2.12 8.26 2.08 8.07 2.16 7.91L3.73 5.09C3.81 4.93 3.99 4.87 4.16 4.93L6.07 5.66C6.46 5.35 6.88 5.08 7.34 4.87L7.62 2.82C7.64 2.64 7.79 2.5 7.97 2.5H11.11C11.29 2.5 11.44 2.64 11.46 2.82L11.74 4.87C12.2 5.08 12.62 5.35 13.01 5.66L14.92 4.93C15.09 4.87 15.27 4.93 15.35 5.09L16.92 7.91C17 8.07 16.96 8.26 16.82 8.37L15.17 9.64C15.18 9.76 15.19 9.88 15.19 10Z" fill="currentColor"/>
                </svg>
                {t("cms.seo.sections.advanced")}
              </h3>

              <div className="dashboard-seo-form-group">
                <label className="dashboard-seo-label">{t("cms.seo.fields.canonical_url")}</label>
                <input
                  className="dashboard-seo-input"
                  name="canonical_url"
                  value={form.canonical_url}
                  onChange={handleFormChange}
                  placeholder={t("cms.seo.placeholders.canonical_url")}
                />
              </div>
            </div>

            <div className="dashboard-seo-form-actions">
              <button className="dashboard-seo-btn-primary" onClick={handlePageSEOSave}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15.75 8.0625V15.1875C15.75 15.4361 15.6512 15.6746 15.4754 15.8504C15.2996 16.0262 15.0611 16.125 14.8125 16.125H3.1875C2.93886 16.125 2.70041 16.0262 2.52459 15.8504C2.34878 15.6746 2.25 15.4361 2.25 15.1875V3.5625C2.25 3.31386 2.34878 3.07541 2.52459 2.89959C2.70041 2.72378 2.93886 2.625 3.1875 2.625H10.3125" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M13.5 1.5L16.5 4.5L8.25 12.75H5.25V9.75L13.5 1.5Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {editingSEO ? t("cms.seo.actions.update_page") : t("cms.seo.actions.create_page")}
              </button>

              {editingSEO && (
                <button className="dashboard-seo-btn-delete" onClick={handleDeletePageSEO}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6V14H12V6H4ZM10.5 2L9.5 1H6.5L5.5 2H2V4H14V2H10.5Z" fill="currentColor"/>
                  </svg>
                  {t("cms.seo.actions.delete")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
